import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles.css'

// Fix iOS Safari keyboard pushing content off screen
function setAppHeight() {
  const h = window.visualViewport ? window.visualViewport.height : window.innerHeight
  document.documentElement.style.setProperty('--app-height', `${h}px`)
}

setAppHeight()
window.addEventListener('resize', setAppHeight)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', setAppHeight)
}

createApp(App).mount('#app')
