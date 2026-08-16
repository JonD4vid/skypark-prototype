<template>
  <div class="screen screen-wide">
    <div class="facility-chip">
      <div class="facility-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z" stroke="#1141a3" stroke-width="2"/><circle cx="12" cy="10" r="2.6" fill="#1141a3"/></svg>
      </div>
      <div>
        <div style="font:600 15px var(--font)">{{ store.facility.name }}</div>
        <div style="font:400 12.5px var(--font);color:var(--muted)">You're paying for parking here</div>
      </div>
    </div>

    <div>
      <h1 class="hero-title">Pay for parking</h1>
      <p class="hero-copy">Settle your parking before you head to the exit. No account needed.</p>
    </div>

    <div class="route-grid">
      <button class="route-card primary" type="button" @click="$router.push('/scan')">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#fff" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#fff" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#fff" stroke-width="2"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z" fill="#fff"/></svg>
        <span class="route-title">Scan ticket barcode</span>
        <span class="route-copy">Point your camera at the barcode on your parking ticket. Fastest way to pay.</span>
      </button>

      <button v-if="store.demo.lpr" class="route-card" type="button" @click="goPlate">
        <span class="plate-chip">PDE 1234</span>
        <span class="route-title">Pay by plate</span>
        <span class="route-copy">Type your licence plate, no ticket required</span>
      </button>

      <button class="route-card" type="button" @click="$router.push('/ticket')">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2.5" stroke="#1141a3" stroke-width="2"/><path d="M8 9v6M11.5 9v6M15 9v3" stroke="#1141a3" stroke-width="2" stroke-linecap="round"/></svg>
        <span class="route-title">Enter ticket number</span>
        <span class="route-copy">From the paper ticket you took at entry</span>
      </button>
    </div>

    <div class="grow"></div>
    <div class="foot-note">Payments secured by PowerTranz · 3DS2</div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const router = useRouter()

function goPlate() {
  store.fromQR = false
  router.push('/plate')
}
</script>
