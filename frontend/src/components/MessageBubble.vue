<template>
  <div v-if="msg.nickname === 'Система'" class="msg-system">
    <span>{{ msg.text }}</span>
  </div>
  <div v-else class="msg-row" :class="{ mine: isMine }">
    <div v-if="!isMine" class="msg-avatar" :style="{ background: color }">
      {{ msg.nickname.charAt(0).toUpperCase() }}
    </div>
    <div class="msg-bubble" :class="{ mine: isMine }">
      <div v-if="!isMine" class="msg-name" :style="{ color }">{{ msg.nickname }}</div>
      <div class="msg-text">{{ msg.text }}</div>
      <div class="msg-time">{{ formatTime(msg.timestamp) }}</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  msg: Object,
  isMine: Boolean,
  color: String
})

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.msg-system {
  text-align: center;
  padding: 4px 0;
}

.msg-system span {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.15);
  color: #fff;
  font-size: 13px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.msg-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 75%;
  margin-bottom: 2px;
}

.msg-row.mine {
  margin-left: auto;
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  flex-shrink: 0;
  margin-bottom: 1px;
}

.msg-bubble {
  padding: 7px 12px 6px;
  border-radius: 12px 12px 12px 4px;
  background: var(--tg-bg-msg-in);
  position: relative;
  min-width: 80px;
  box-shadow: 0 1px 2px var(--tg-msg-shadow);
}

.msg-bubble.mine {
  background: var(--tg-bg-msg-out);
  border-radius: 12px 12px 4px 12px;
}

.msg-bubble.mine {
  box-shadow: 0 1px 2px var(--tg-msg-shadow);
}

.msg-name {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
}

.msg-text {
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: pre-wrap;
  margin-right: 48px;
}

.msg-time {
  font-size: 11px;
  color: var(--tg-text-msg-time);
  float: right;
  margin-top: -14px;
  margin-left: 12px;
}

.msg-bubble.mine .msg-time {
  color: var(--tg-text-msg-time-out);
}
</style>
