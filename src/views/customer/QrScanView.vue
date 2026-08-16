<template>
  <div v-if="failed" class="screen">
    <button class="back-btn" type="button" @click="$router.push('/')">‹ Back</button>
    <div class="alert alert-bad">
      <div class="alert-icon">!</div>
      <div>
        <div style="font:600 16px var(--font)">We couldn't read that barcode</div>
        <p>The camera didn't get a clean Code 128 read. Try again in better light, or enter the ticket number printed under the barcode.</p>
      </div>
    </div>
    <button class="btn btn-primary" type="button" @click="$router.push('/scan')">Scan again</button>
    <button class="btn btn-secondary" type="button" @click="$router.push('/ticket')">Enter ticket number</button>
  </div>
  <div v-else class="qr-wrap">
    <div class="qr-frame">
      <span class="tl"></span><span class="tr"></span><span class="bl"></span><span class="br"></span>
    </div>
    <div style="font:500 15px var(--font);color:#fff;animation:pulse 1.2s ease-in-out infinite">
      Line up the barcode on your ticket…
    </div>
    <div style="font:400 13px var(--font);color:#8f9aad;text-align:center;max-width:300px">
      Code 128 barcode, printed under the numbers on your ticket
    </div>
    <button class="btn-ghost" style="color:#bfd0f2" type="button" @click="$router.push('/')">Cancel</button>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const router = useRouter()
const failed = ref(false)
let timer

onMounted(() => {
  timer = setTimeout(() => {
    if (store.demo.scan === 'fail') {
      failed.value = true
      store.log({
        action: 'Scan failed',
        category: 'scan',
        outcome: 'fail',
        detail: 'Barcode unreadable · Code 128',
      })
      return
    }
    store.fromQR = true
    store.ticket = store.facility.ticket
    store.log({
      action: 'Scan succeeded',
      category: 'scan',
      detail: `Ticket ${store.facility.ticket} read from barcode`,
    })
    router.replace('/plate')
  }, 1600)
})

onUnmounted(() => clearTimeout(timer))
</script>
