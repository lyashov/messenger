<template>
  <div class="chat-layout">
    <Sidebar @leave="handleLeave" />

    <div class="chat-main">
      <div class="chat-header">
        <div class="chat-header-info">
          <h2>Комната</h2>
          <span class="chat-header-status">{{ users.length }} участник{{ plural(users.length) }}</span>
        </div>
        <div class="chat-header-actions">
          <button
            v-if="!inCall"
            class="call-btn"
            @click="handleStartCall"
            title="Начать звонок"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Позвонить</span>
          </button>
        </div>
      </div>

      <div class="chat-messages" ref="messagesEl">
        <ChatWallpaper />
        <div class="messages-inner">
          <div class="messages-spacer"></div>
          <MessageBubble
            v-for="(m, i) in messages"
            :key="i"
            :msg="m"
            :isMine="m.nickname === nickname"
            :color="getColor(m.nickname)"
          />
        </div>
      </div>

      <div class="chat-input-area">
        <div class="chat-input-wrapper">
          <input
            v-model="text"
            @keyup.enter="handleSend"
            placeholder="Сообщение..."
            class="chat-input"
          />
          <button
            class="send-btn"
            @click="handleSend"
            :disabled="!text.trim()"
            title="Отправить"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <CallOverlay
      v-if="inCall"
      :nickname="nickname"
      :localStream="localStream"
      :remoteStreams="remoteStreams"
      :videoCount="videoCount"
      :audioEnabled="audioEnabled"
      :videoEnabled="videoEnabled"
      @toggleAudio="toggleAudio"
      @toggleVideo="toggleVideo"
      @endCall="endCall"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useWebSocket } from '../composables/useWebSocket.js'
import { useWebRTC } from '../composables/useWebRTC.js'
import Sidebar from './Sidebar.vue'
import MessageBubble from './MessageBubble.vue'
import CallOverlay from './CallOverlay.vue'
import ChatWallpaper from './ChatWallpaper.vue'

const {
  nickname, messages, users,
  leave, sendChat, sendSignal, setSignalHandler
} = useWebSocket()

const {
  inCall, audioEnabled, videoEnabled, localStream,
  remoteStreams, videoCount,
  startCall, endCall, handleSignal,
  toggleAudio, toggleVideo, closeAllPeers
} = useWebRTC(sendSignal, nickname, users)

setSignalHandler(handleSignal)

const text = ref('')
const messagesEl = ref(null)

const colors = [
  '#e17076', '#7bc862', '#e5ca77', '#65aadd',
  '#a695e7', '#ee7aae', '#6ec9cb', '#faa774'
]

function getColor(name) {
  if (name === 'Система') return '#708499'
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function plural(n) {
  if (n % 10 === 1 && n % 100 !== 11) return ''
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'а'
  return 'ов'
}

function handleSend() {
  if (!text.value.trim()) return
  sendChat(text.value)
  text.value = ''
}

function handleLeave() {
  closeAllPeers()
  leave()
}

async function handleStartCall() {
  try {
    await startCall()
  } catch (e) {
    alert(e.message)
  }
}

watch(messages, () => {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}, { deep: true })
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: 100%;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-header {
  height: 56px;
  min-height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--tg-bg-header);
  border-bottom: 1px solid var(--tg-border);
}

.chat-header-info h2 {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--tg-text-header);
}

.chat-header-status {
  font-size: 13px;
  color: var(--tg-text-header);
  opacity: 0.7;
}

.call-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 24px;
  background: #fff;
  color: var(--tg-bg-header);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.call-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  position: relative;
  background: var(--tg-wallpaper-color);
}

.messages-inner {
  position: relative;
  z-index: 1;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
}

.messages-spacer {
  flex: 1;
}

.chat-input-area {
  padding: 8px 8px 12px;
  background: var(--tg-bg);
  border-top: 1px solid var(--tg-border);
}

.chat-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--tg-bg-input);
  border-radius: 12px;
  padding: 4px 4px 4px 16px;
}

.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--tg-text);
  font-size: 14px;
  padding: 8px 0;
  outline: none;
}

.chat-input::placeholder {
  color: var(--tg-text-secondary);
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--tg-blue);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: var(--tg-blue-dark);
}

.send-btn:disabled {
  background: var(--tg-bg-header);
  color: var(--tg-text-secondary);
  cursor: not-allowed;
}
</style>
