<template>
  <div class="screen screen-center" style="gap:18px">
    <div class="spinner"></div>
    <div style="font:600 16px var(--font)">Signing you in…</div>
    <p class="lede">{{ store.pendingLinkEmail ? `From the link sent to ${store.pendingLinkEmail}` : 'From your email sign-in link' }}</p>
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
  timer = setTimeout(() => {
    store.consumeSignInLink()
    router.replace('/account')
  }, 900)
})

onUnmounted(() => clearTimeout(timer))
</script>
