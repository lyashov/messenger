<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" fill="var(--tg-blue)"/>
        </svg>
        <span>TelegaMAX</span>
      </div>
    </div>

    <div class="user-section">
      <div class="user-section-header">
        <span class="user-count">Онлайн — {{ users.length }}</span>
      </div>
      <div class="user-list">
        <div
          v-for="u in users"
          :key="u"
          class="user-item"
          :class="{ me: u === nickname }"
        >
          <div class="user-avatar" :style="{ background: getColor(u) }">
            {{ u.charAt(0).toUpperCase() }}
          </div>
          <div class="user-info">
            <span class="user-name">{{ u }}</span>
            <span v-if="u === nickname" class="user-you">вы</span>
          </div>
          <div class="user-online-dot"></div>
        </div>
      </div>
    </div>

    <div class="sidebar-footer">
      <button class="leave-btn" @click="$emit('leave')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Выйти
      </button>
    </div>
  </div>
</template>

<script setup>
import { useWebSocket } from '../composables/useWebSocket.js'

defineEmits(['leave'])
const { users, nickname } = useWebSocket()

const colors = [
  '#e17076', '#7bc862', '#e5ca77', '#65aadd',
  '#a695e7', '#ee7aae', '#6ec9cb', '#faa774'
]

function getColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-width: 260px;
  background: var(--tg-bg-sidebar);
  border-right: 1px solid var(--tg-border);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--tg-border);
  min-height: 56px;
  display: flex;
  align-items: center;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
}

.user-section {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.user-section-header {
  padding: 8px 16px;
}

.user-count {
  font-size: 13px;
  color: var(--tg-blue);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-list {
  display: flex;
  flex-direction: column;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  cursor: default;
  transition: background 0.15s;
}

.user-item:hover {
  background: var(--tg-bg-hover);
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-you {
  font-size: 12px;
  color: var(--tg-text-secondary);
}

.user-online-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--tg-green);
  margin-left: auto;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--tg-border);
}

.leave-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--tg-text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.leave-btn:hover {
  background: var(--tg-bg-hover);
  color: var(--tg-red);
}
</style>
