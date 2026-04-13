<template>
  <div class="join-screen">
    <div class="join-card">
      <div class="join-logo">
        <div class="logo-circle">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" fill="#fff"/>
          </svg>
        </div>
        <h1>TelegaMAX</h1>
        <p class="join-subtitle">Приватный мессенджер</p>
      </div>

      <div v-if="error" class="join-error">{{ error }}</div>

      <div class="join-form">
        <input
          v-model="nick"
          @keyup.enter="handleJoin"
          placeholder="Ваше имя"
          maxlength="20"
          autofocus
          class="join-input"
        />
        <button class="join-btn" @click="handleJoin" :disabled="!nick.trim()">
          Войти в чат
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWebSocket } from '../composables/useWebSocket.js'

const { error, join } = useWebSocket()
const nick = ref('')

function handleJoin() {
  join(nick.value)
}
</script>

<style scoped>
.join-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--tg-bg-secondary);
  padding: 16px;
  padding-top: max(16px, env(safe-area-inset-top));
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
}

.join-card {
  background: var(--tg-bg);
  padding: 48px 40px;
  border-radius: 12px;
  width: 360px;
  max-width: 100%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.join-logo {
  text-align: center;
  margin-bottom: 32px;
}

.logo-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--tg-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 4px 16px rgba(51, 144, 236, 0.3);
}

.join-logo h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--tg-text);
  margin-bottom: 4px;
}

.join-subtitle {
  color: var(--tg-text-secondary);
  font-size: 14px;
}

.join-error {
  background: rgba(229, 57, 53, 0.15);
  color: var(--tg-red);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 16px;
  text-align: center;
}

.join-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.join-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--tg-border);
  border-radius: 10px;
  background: var(--tg-bg);
  color: var(--tg-text);
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.join-input:focus {
  border-color: var(--tg-blue);
}

.join-input::placeholder {
  color: var(--tg-text-secondary);
}

.join-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: var(--tg-blue);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.join-btn:hover:not(:disabled) {
  background: var(--tg-blue-dark);
}

.join-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .join-card {
    padding: 36px 24px;
    border-radius: 8px;
  }
}
</style>
