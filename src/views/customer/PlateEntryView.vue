<template>
  <div class="screen">
    <button class="back-btn" type="button" @click="$router.push('/')">‹ Back</button>

    <div v-if="store.fromQR" class="pill pill-ok" style="align-self:flex-start;display:flex;align-items:center;gap:8px;padding:6px 12px;font-size:12.5px">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 12.5 10 18 20 6" stroke="#0e7a4f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Ticket {{ store.facility.ticket }} read from barcode
    </div>

    <h1>Enter your plate</h1>
    <p class="lede">Exactly as printed on your vehicle. Spacing doesn't matter.</p>

    <div v-if="store.signedIn && store.vehicles.length" class="saved-pills">
      <button
        v-for="v in store.vehicles"
        :key="v.plate"
        class="pill-btn"
        :class="{ on: store.plate.replace(/\s/g, '') === v.plate.replace(/\s/g, '') }"
        type="button"
        @click="store.useSavedPlate(v.plate)"
      >{{ v.plate }}</button>
    </div>

    <input
      class="input-id"
      :value="store.plate"
      placeholder="PDE 1234"
      autocapitalize="characters"
      autocomplete="off"
      @input="onPlate"
    />
    <button class="btn btn-primary" type="button" @click="$router.push('/lookup')">Find my session</button>
    <button class="btn-ghost" type="button" @click="$router.push('/search')">Can't find it? Search by phone</button>
  </div>
</template>

<script setup>
import { useSkyParkStore } from '@/stores/skypark'
import { formatPlate } from '@/lib/format'

const store = useSkyParkStore()

function onPlate(e) {
  store.plate = formatPlate(e.target.value)
}
</script>
