<template>
  <div class="screen">
    <button class="back-btn" type="button" @click="$router.push('/')">‹ Back</button>
    <h1>Enter ticket number</h1>
    <p class="lede">Printed under the barcode on your ticket.</p>
    <input
      class="input-id md"
      :value="store.ticket"
      placeholder="0042 8871 22"
      inputmode="numeric"
      @input="store.ticket = $event.target.value"
    />
    <button class="btn btn-primary" type="button" @click="$router.push('/lookup')">Find my session</button>
  </div>
</template>

<script setup>
import { useSkyParkStore } from '@/stores/skypark'
const store = useSkyParkStore()
</script>
