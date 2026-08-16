<template>
  <div class="screen">
    <button class="back-btn" type="button" @click="$router.push('/plate')">‹ Back</button>
    <h1>Search by phone</h1>
    <p class="lede">If you gave your number at entry or have an account, we can look up your session.</p>
    <input
      class="input-id sm"
      :value="store.phone"
      placeholder="(868) 000 0000"
      inputmode="tel"
      @input="store.phone = $event.target.value"
    />
    <button class="btn btn-primary" type="button" @click="$router.push('/lookup')">Search</button>
    <p class="tiny">Search covers sessions on this platform and what the parking system lookup accepts.</p>
  </div>
</template>

<script setup>
import { useSkyParkStore } from '@/stores/skypark'
const store = useSkyParkStore()
</script>
