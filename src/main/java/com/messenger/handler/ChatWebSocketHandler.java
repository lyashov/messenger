package com.messenger.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messenger.model.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(ChatWebSocketHandler.class);
    private static final int MAX_USERS = 5;

    private final ObjectMapper mapper = new ObjectMapper();
    private final Map<WebSocketSession, String> sessionToNick = new ConcurrentHashMap<>();
    private final Map<String, WebSocketSession> nickToSession = new ConcurrentHashMap<>();

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        ChatMessage msg = mapper.readValue(message.getPayload(), ChatMessage.class);

        switch (msg.type()) {
            case "join" -> handleJoin(session, msg);
            case "chat" -> handleChat(msg);
            case "offer", "answer", "ice" -> forwardToTarget(msg);
            default -> log.warn("Unknown message type: {}", msg.type());
        }
    }

    private void handleJoin(WebSocketSession session, ChatMessage msg) throws IOException {
        String nick = msg.nickname();

        if (nickToSession.containsKey(nick)) {
            sendTo(session, new ChatMessage("error", null, null,
                    "Никнейм уже занят", null, null, null, 0));
            return;
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
}
