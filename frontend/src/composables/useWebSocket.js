import { ref, reactive } from 'vue'

const savedNick = localStorage.getItem('nickname')
const screen = ref(savedNick ? 'chat' : 'join')
const nickname = ref(savedNick || '')
const error = ref('')
const messages = reactive([])
const users = reactive([])

let ws = null
let onSignal = null

export function useWebSocket() {

  function setSignalHandler(handler) {
    onSignal = handler
  }

  function connect() {
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
    ws = new WebSocket(`${proto}//${location.host}/ws`)

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', nickname: nickname.value }))
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      handleMessage(msg)
    }

    ws.onclose = () => {
      if (screen.value === 'chat') {
        // Try to reconnect automatically
        setTimeout(() => {
          if (screen.value === 'chat' && nickname.value) {
            connect()
          }
        }, 2000)
      }
    }
  }

  function handleMessage(msg) {
    switch (msg.type) {
      case 'users':
        users.splice(0, users.length, ...msg.users)
        break
      case 'chat':
        messages.push(msg)
        break
      case 'error':
        error.value = msg.text
        if (screen.value === 'join' && ws) ws.close()
        break
      case 'offer':
      case 'answer':
      case 'ice':
      case 'hangup':
        if (onSignal) onSignal(msg)
        break
    }
  }

  function join(nick) {
    nickname.value = nick.trim()
    if (!nickname.value) {
      error.value = 'Введите никнейм'
      return
    }
    error.value = ''
    localStorage.setItem('nickname', nickname.value)
    screen.value = 'chat'
    connect()
  }

  function leave() {
    if (ws) ws.close()
    ws = null
    localStorage.removeItem('nickname')
    screen.value = 'join'
    nickname.value = ''
    messages.splice(0)
    users.splice(0)
  }

  function sendChat(text) {
    if (!text.trim() || !ws) return
    ws.send(JSON.stringify({ type: 'chat', nickname: nickname.value, text: text.trim() }))
  }

  function sendSignal(data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
    }
  }

  // Auto-connect if nickname was saved
  if (savedNick && !ws) {
    connect()
  }

  return {
    screen, nickname, error, messages, users,
    join, leave, sendChat, sendSignal, setSignalHandler
  }
}
