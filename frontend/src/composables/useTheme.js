import { ref } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'light')

function applyTheme() {
  document.documentElement.setAttribute('data-theme', theme.value)
}

applyTheme()

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
    applyTheme()
  }

  return { theme, toggleTheme }
}
