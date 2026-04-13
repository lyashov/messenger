<template>
  <div class="call-overlay">
    <div class="call-header">
      <span class="call-title">Видеозвонок</span>
      <span class="call-duration">{{ formattedDuration }}</span>
    </div>

    <div class="call-grid" :class="'grid-' + videoCount">
      <div class="video-cell">
        <video ref="localVideoEl" autoplay playsinline muted></video>
        <div class="video-label">{{ nickname }} (вы)</div>
        <div v-if="!videoEnabled" class="video-off">
          <div class="video-off-avatar">{{ nickname.charAt(0).toUpperCase() }}</div>
        </div>
      </div>
      <div v-for="(stream, nick) in remoteStreams" :key="nick" class="video-cell">
        <video autoplay playsinline :ref="el => setStream(el, stream)"></video>
        <div class="video-label">{{ nick }}</div>
      </div>
    </div>

    <div class="call-controls">
      <button
        class="ctrl-btn"
        :class="{ off: !audioEnabled }"
        @click="toggleAudio"
        :title="audioEnabled ? 'Выключить микрофон' : 'Включить микрофон'"
      >
        <svg v-if="audioEnabled" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" stroke-width="2"/>
          <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4m-4 0h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M1 1l22 22M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17 16.95A7 7 0 015 12v-2m14 0v2c0 .76-.12 1.5-.35 2.18M12 19v4m-4 0h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <button
        class="ctrl-btn"
        :class="{ off: !videoEnabled }"
        @click="toggleVideo"
        :title="videoEnabled ? 'Выключить камеру' : 'Включить камеру'"
      >
        <svg v-if="videoEnabled" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34l1 1L23 7v10M1 1l22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <button class="ctrl-btn hangup" @click="endCall" title="Завершить звонок">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M10.68 13.31a16 16 0 01-3.13-4.13c-.27-.52-.15-1.14.27-1.55l.46-.47a1.5 1.5 0 000-2.12L6.16 2.92a1.5 1.5 0 00-2.12 0l-.73.73C1.5 5.46 1.33 8.55 3.46 12.17a24.4 24.4 0 008.37 8.37c3.62 2.13 6.71 1.96 8.52.15l.73-.73a1.5 1.5 0 000-2.12l-2.12-2.12a1.5 1.5 0 00-2.12 0l-.47.46c-.41.42-1.03.54-1.55.27a16 16 0 01-4.13-3.13z" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  nickname: String,
  localStream: Object,
  remoteStreams: Object,
  videoCount: Number,
  audioEnabled: Boolean,
  videoEnabled: Boolean
})

const emit = defineEmits(['toggleAudio', 'toggleVideo', 'endCall'])

const localVideoEl = ref(null)
const duration = ref(0)
let timer = null

const formattedDuration = ref('00:00')

onMounted(() => {
  timer = setInterval(() => {
    duration.value++
    const m = String(Math.floor(duration.value / 60)).padStart(2, '0')
    const s = String(duration.value % 60).padStart(2, '0')
    formattedDuration.value = `${m}:${s}`
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

watch(() => props.localStream, (stream) => {
  if (localVideoEl.value && stream) {
    localVideoEl.value.srcObject = stream
  }
}, { immediate: true })

function setStream(el, stream) {
  if (el && el.srcObject !== stream) {
    el.srcObject = stream
  }
}

function toggleAudio() { emit('toggleAudio') }
function toggleVideo() { emit('toggleVideo') }
function endCall() { emit('endCall') }
</script>

<style scoped>
.call-overlay {
  position: fixed;
  inset: 0;
  background: #0a0e13;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.call-header {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.3);
}

.call-title {
  font-size: 16px;
  font-weight: 600;
}

.call-duration {
  font-size: 14px;
  color: var(--tg-text-secondary);
  font-variant-numeric: tabular-nums;
}

.call-grid {
  flex: 1;
  display: grid;
  gap: 4px;
  padding: 4px;
}

.grid-1 { grid-template-columns: 1fr; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.grid-3 { grid-template-columns: 1fr 1fr; }
.grid-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
.grid-5 { grid-template-columns: 1fr 1fr 1fr; }

.video-cell {
  position: relative;
  background: var(--tg-bg);
  border-radius: 12px;
  overflow: hidden;
}

.video-cell video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-label {
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.55);
  font-size: 13px;
  backdrop-filter: blur(4px);
}

.video-off {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tg-bg-header);
}

.video-off-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--tg-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 500;
  color: #fff;
}

.call-controls {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.3);
}

.ctrl-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tg-bg-header);
  color: var(--tg-text);
  transition: all 0.2s;
}

.ctrl-btn:hover {
  background: #374151;
}

.ctrl-btn.off {
  background: #ef4444;
  color: #fff;
}

.ctrl-btn.hangup {
  width: 60px;
  height: 60px;
  background: #ef4444;
  color: #fff;
}

.ctrl-btn.hangup:hover {
  background: #dc2626;
}
</style>
