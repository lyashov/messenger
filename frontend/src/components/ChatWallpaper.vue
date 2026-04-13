<template>
  <svg class="wallpaper" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="doodle" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
        <!-- Cloud -->
        <path d="M45 60c0-8 6-14 13-14 1-7 7-12 14-12 8 0 15 6 15 14h2c6 0 10 4 10 10s-4 10-10 10H48c-6 0-10-5-10-10 0-3 1-5 3-7z" fill="none" :stroke="color" stroke-width="1.5"/>
        <!-- Star -->
        <path d="M160 30l4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6 9-1z" fill="none" :stroke="color" stroke-width="1.3"/>
        <!-- Heart -->
        <path d="M290 45c3-6 12-6 15 0 3-6 12-6 15 0 0 8-15 18-15 18S290 53 290 45z" fill="none" :stroke="color" stroke-width="1.3"/>
        <!-- Pizza -->
        <path d="M30 140l20-35 20 35z" fill="none" :stroke="color" stroke-width="1.3"/>
        <circle cx="42" cy="130" r="2" fill="none" :stroke="color" stroke-width="1"/>
        <circle cx="52" cy="133" r="2" fill="none" :stroke="color" stroke-width="1"/>
        <!-- Camera -->
        <rect x="145" y="120" width="30" height="22" rx="3" fill="none" :stroke="color" stroke-width="1.3"/>
        <circle cx="160" cy="131" r="7" fill="none" :stroke="color" stroke-width="1.3"/>
        <rect x="155" y="116" width="10" height="5" rx="1" fill="none" :stroke="color" stroke-width="1"/>
        <!-- Balloon -->
        <ellipse cx="300" cy="125" rx="12" ry="15" fill="none" :stroke="color" stroke-width="1.3"/>
        <path d="M300 140v20" fill="none" :stroke="color" stroke-width="1"/>
        <!-- Burger -->
        <path d="M30 230c0-6 10-10 20-10s20 4 20 10H30z" fill="none" :stroke="color" stroke-width="1.3"/>
        <line x1="30" y1="237" x2="70" y2="237" :stroke="color" stroke-width="1.3"/>
        <path d="M30 244h40c0 5-9 8-20 8s-20-3-20-8z" fill="none" :stroke="color" stroke-width="1.3"/>
        <!-- Music note -->
        <circle cx="150" cy="240" r="6" fill="none" :stroke="color" stroke-width="1.3"/>
        <line x1="156" y1="240" x2="156" y2="215" :stroke="color" stroke-width="1.3"/>
        <path d="M156 215c5 0 10 3 10 6" fill="none" :stroke="color" stroke-width="1.3"/>
        <!-- Rocket -->
        <path d="M290 220c5-15 10-25 10-25s5 10 10 25c-3 2-7 3-10 3s-7-1-10-3z" fill="none" :stroke="color" stroke-width="1.3"/>
        <path d="M290 220l-4 8h8z" fill="none" :stroke="color" stroke-width="1"/>
        <path d="M310 220l4 8h-8z" fill="none" :stroke="color" stroke-width="1"/>
        <!-- Cat face -->
        <circle cx="50" cy="330" r="14" fill="none" :stroke="color" stroke-width="1.3"/>
        <path d="M36 316l5 10M64 316l-5 10" fill="none" :stroke="color" stroke-width="1.3"/>
        <circle cx="44" cy="328" r="2" fill="none" :stroke="color" stroke-width="1"/>
        <circle cx="56" cy="328" r="2" fill="none" :stroke="color" stroke-width="1"/>
        <path d="M47 334c3 2 6 2 6 0" fill="none" :stroke="color" stroke-width="1"/>
        <!-- Gift box -->
        <rect x="140" y="320" width="24" height="20" rx="2" fill="none" :stroke="color" stroke-width="1.3"/>
        <line x1="152" y1="320" x2="152" y2="340" :stroke="color" stroke-width="1"/>
        <path d="M143 320c4-8 9-5 9 0M161 320c-4-8-9-5-9 0" fill="none" :stroke="color" stroke-width="1.3"/>
        <!-- Donut -->
        <circle cx="300" cy="335" r="14" fill="none" :stroke="color" stroke-width="1.3"/>
        <circle cx="300" cy="335" r="5" fill="none" :stroke="color" stroke-width="1.3"/>
        <path d="M288 330c2-4 6-6 12-6s10 2 12 6" fill="none" :stroke="color" stroke-width="1"/>
        <!-- Small stars scattered -->
        <path d="M110 80l2 4 4 0-3 3 1 4-4-2-4 2 1-4-3-3 4 0z" fill="none" :stroke="color" stroke-width="1"/>
        <path d="M230 180l2 4 4 0-3 3 1 4-4-2-4 2 1-4-3-3 4 0z" fill="none" :stroke="color" stroke-width="1"/>
        <path d="M350 80l2 4 4 0-3 3 1 4-4-2-4 2 1-4-3-3 4 0z" fill="none" :stroke="color" stroke-width="1"/>
        <path d="M370 280l2 4 4 0-3 3 1 4-4-2-4 2 1-4-3-3 4 0z" fill="none" :stroke="color" stroke-width="1"/>
        <!-- Pencil -->
        <rect x="100" y="290" width="8" height="30" rx="1" fill="none" :stroke="color" stroke-width="1.2" transform="rotate(-20, 104, 305)"/>
        <path d="M96 316l4 8 4-8" fill="none" :stroke="color" stroke-width="1" transform="rotate(-20, 104, 305)"/>
        <!-- Cherry -->
        <circle cx="220" cy="100" r="6" fill="none" :stroke="color" stroke-width="1.2"/>
        <circle cx="232" cy="104" r="6" fill="none" :stroke="color" stroke-width="1.2"/>
        <path d="M220 94c2-10 8-14 14-12M232 98c-1-8 1-14 5-16" fill="none" :stroke="color" stroke-width="1"/>
        <!-- Leaf -->
        <path d="M355 170c-12 4-20 14-16 22s16 6 28 2 20-14 16-22-16-6-28-2z" fill="none" :stroke="color" stroke-width="1.2"/>
        <path d="M355 170c8 10 12 18 12 24" fill="none" :stroke="color" stroke-width="1"/>
        <!-- Sun -->
        <circle cx="215" cy="300" r="8" fill="none" :stroke="color" stroke-width="1.3"/>
        <line x1="215" y1="288" x2="215" y2="284" :stroke="color" stroke-width="1.2"/>
        <line x1="215" y1="312" x2="215" y2="316" :stroke="color" stroke-width="1.2"/>
        <line x1="203" y1="300" x2="199" y2="300" :stroke="color" stroke-width="1.2"/>
        <line x1="227" y1="300" x2="231" y2="300" :stroke="color" stroke-width="1.2"/>
        <!-- Ice cream -->
        <path d="M350 340l-10 30h20z" fill="none" :stroke="color" stroke-width="1.2"/>
        <circle cx="350" cy="338" r="10" fill="none" :stroke="color" stroke-width="1.3"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#doodle)"/>
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme.js'

const { theme } = useTheme()

const color = computed(() =>
  theme.value === 'dark' ? 'rgba(100, 150, 180, 0.13)' : 'rgba(70, 120, 70, 0.18)'
)
</script>

<style scoped>
.wallpaper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
