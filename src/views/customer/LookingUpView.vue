<template>
  <div class="screen screen-center">
    <div class="spinner"></div>
    <div style="font:500 15px var(--font);color:var(--muted)">Checking with the parking system…</div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const router = useRouter()
let timer

onMounted(() => {
  store.log({
    action: 'Session lookup started',
    category: 'session',
    detail: store.ticket ? `Ticket ${store.ticket}` : `Plate ${store.plateShown}`,
  })
  timer = setTimeout(() => router.replace('/session'), 1100)
})
onUnmounted(() => clearTimeout(timer))
</script>
