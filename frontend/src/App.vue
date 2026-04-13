<template>
  <JoinScreen v-if="screen === 'join'" />
  <ChatScreen v-else-if="screen === 'chat'" />
</template>

<script setup>
import { useWebSocket } from './composables/useWebSocket.js'
import JoinScreen from './components/JoinScreen.vue'
import ChatScreen from './components/ChatScreen.vue'

const { screen } = useWebSocket()
</script>
