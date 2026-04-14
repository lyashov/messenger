package com.messenger.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messenger.model.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.PingMessage;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.*;

public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(ChatWebSocketHandler.class);
    private static final int MAX_USERS = 5;
    private static final long IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
    private static final long PING_INTERVAL_MS = 30 * 1000; // 30 seconds

    private final ObjectMapper mapper = new ObjectMapper();
    private final Map<WebSocketSession, String> sessionToNick = new ConcurrentHashMap<>();
    private final Map<String, WebSocketSession> nickToSession = new ConcurrentHashMap<>();
    private final ScheduledExecutorService pingScheduler = Executors.newSingleThreadScheduledExecutor();

    {
        pingScheduler.scheduleAtFixedRate(this::pingAll, PING_INTERVAL_MS, PING_INTERVAL_MS, TimeUnit.MILLISECONDS);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        session.setTextMessageSizeLimit(64 * 1024);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        ChatMessage msg = mapper.readValue(message.getPayload(), ChatMessage.class);

        switch (msg.type()) {
            case "join" -> handleJoin(session, msg);
            case "chat" -> handleChat(msg);
            case "offer", "answer", "ice" -> forwardToTarget(msg);
            case "hangup" -> handleHangup(msg);
            default -> log.warn("Unknown message type: {}", msg.type());
        }
    }

    private void handleJoin(WebSocketSession session, ChatMessage msg) throws IOException {
        String nick = msg.nickname();

        if (nickToSession.containsKey(nick)) {
            WebSocketSession oldSession = nickToSession.get(nick);
            if (oldSession != null && oldSession.isOpen()) {
                // Nickname genuinely in use by another active session
                sendTo(session, new ChatMessage("error", null, null,
                        "Никнейм уже занят", null, null, null, 0));
                return;
            }
            // Old session is dead (page refresh / reconnect) — evict stale entry
            nickToSession.remove(nick);
            sessionToNick.remove(oldSession);
            log.info("Evicted stale session for: {}", nick);
        }

        if (sessionToNick.size() >= MAX_USERS) {
            sendTo(session, new ChatMessage("error", null, null,
                    "Комната заполнена (макс. " + MAX_USERS + ")", null, null, null, 0));
            return;
        }

        sessionToNick.put(session, nick);
        nickToSession.put(nick, session);
        log.info("User joined: {}", nick);

        broadcastUsers();
        broadcast(new ChatMessage("chat", "Система", null,
                nick + " присоединился к чату", null, null, null, System.currentTimeMillis()));
    }

    private void handleChat(ChatMessage msg) throws IOException {
        broadcast(new ChatMessage("chat", msg.nickname(), null,
                msg.text(), null, null, null, System.currentTimeMillis()));
    }

    private void forwardToTarget(ChatMessage msg) throws IOException {
        WebSocketSession target = nickToSession.get(msg.target());
        if (target != null && target.isOpen()) {
            sendTo(target, msg);
        }
    }

    private void handleHangup(ChatMessage msg) throws IOException {
        // Broadcast hangup to all other users so they can clean up peer connections
        String json = mapper.writeValueAsString(msg);
        for (Map.Entry<WebSocketSession, String> entry : sessionToNick.entrySet()) {
            if (!entry.getValue().equals(msg.nickname())) {
                sendRaw(entry.getKey(), json);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws IOException {
        String nick = sessionToNick.remove(session);
        if (nick != null) {
            nickToSession.remove(nick);
            log.info("User left: {}", nick);
            broadcastUsers();
            broadcast(new ChatMessage("chat", "Система", null,
                    nick + " покинул чат", null, null, null, System.currentTimeMillis()));
        }
    }

    private void broadcastUsers() throws IOException {
        var userList = new ArrayList<>(nickToSession.keySet());
        broadcast(new ChatMessage("users", null, null, null, null, null, userList, 0));
    }

    private void broadcast(ChatMessage msg) throws IOException {
        String json = mapper.writeValueAsString(msg);
        for (WebSocketSession s : sessionToNick.keySet()) {
            sendRaw(s, json);
        }
    }

    private void sendTo(WebSocketSession session, ChatMessage msg) throws IOException {
        sendRaw(session, mapper.writeValueAsString(msg));
    }

    private void sendRaw(WebSocketSession session, String json) {
        if (session.isOpen()) {
            synchronized (session) {
                try {
                    session.sendMessage(new TextMessage(json));
                } catch (IOException e) {
                    log.error("Failed to send message to session {}", session.getId(), e);
                }
            }
        }
    }

    private void pingAll() {
        for (WebSocketSession session : sessionToNick.keySet()) {
            if (session.isOpen()) {
                synchronized (session) {
                    try {
                        session.sendMessage(new PingMessage(ByteBuffer.wrap("ping".getBytes())));
                    } catch (IOException e) {
                        log.warn("Ping failed for session {}", session.getId());
                    }
                }
            }
        }
    }
}
