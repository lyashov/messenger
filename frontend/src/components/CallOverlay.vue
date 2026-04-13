<template>
  <div class="call-overlay">
    <div class="call-header">
      <button class="back-btn" @click="endCall" title="Вернуться в чат">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Выйти</span>
      </button>
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

      <button
        class="ctrl-btn"
        :class="{ active: screenSharing }"
        @click="$emit('toggleScreen')"
        title="Поделиться экраном"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M8 21h8m-4-4v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path v-if="!screenSharing" d="M9 13l3-3 3 3m-3-3v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path v-else d="M9 10l3 3 3-3m-3 3V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  nickname: String,
  localStream: Object,
  remoteStreams: Object,
  videoCount: Number,
  audioEnabled: Boolean,
  videoEnabled: Boolean,
  screenSharing: Boolean
})

const emit = defineEmits(['toggleAudio', 'toggleVideo', 'toggleScreen', 'endCall'])

const localVideoEl = ref(null)
const duration = ref(0)
let timer = null

const formattedDuration = ref('00:00')

onMounted(() => {
  // Attach local stream after DOM is ready
  if (localVideoEl.value && props.localStream) {
    localVideoEl.value.srcObject = props.localStream
  }

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
  nextTick(() => {
    if (localVideoEl.value && stream) {
      localVideoEl.value.srcObject = stream
    }
  })
})

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
  overflow: hidden;
}

.call-header {
  padding: 12px 16px;
  padding-top: max(12px, env(safe-area-inset-top));
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
  color: #fff;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.call-title {
  font-size: 16px;
  font-weight: 600;
}

.call-duration {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-variant-numeric: tabular-nums;
  margin-left: auto;
}

.call-grid {
  flex: 1;
  min-height: 0;
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
  background: #1a1f2e;
  border-radius: 12px;
  overflow: hidden;
  min-height: 0;
}

.video-cell video {
  position: absolute;
  inset: 0;
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
  color: #fff;
  backdrop-filter: blur(4px);
  z-index: 2;
}

.video-off {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1f2e;
  z-index: 1;
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
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
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
  background: #2a3040;
  color: #e0e0e0;
  transition: all 0.2s;
}

.ctrl-btn:hover {
  background: #374151;
}

.ctrl-btn.off {
  background: #ef4444;
  color: #fff;
}

.ctrl-btn.active {
  background: var(--tg-blue);
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

@media (max-width: 768px) {
  .call-header {
    padding: 8px 12px;
    padding-top: max(8px, env(safe-area-inset-top));
    gap: 10px;
  }

  .back-btn span {
    display: none;
  }

  .back-btn {
    padding: 8px 10px;
  }

  .call-grid {
    gap: 2px;
    padding: 2px;
  }

  .grid-2 { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; }
  .grid-3 { grid-template-columns: 1fr; }

  .video-cell {
    border-radius: 8px;
  }

  .call-controls {
    padding: 12px;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
    gap: 10px;
  }

  .ctrl-btn {
    width: 46px;
    height: 46px;
  }

  .ctrl-btn svg {
    width: 20px;
    height: 20px;
  }

  .ctrl-btn.hangup {
    width: 52px;
    height: 52px;
  }

  .video-off-avatar {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }
}
</style>
