<template>
  <div class="screen">
    <button class="back-btn" type="button" @click="$router.push('/account')">‹ Back</button>
    <h1>Saved vehicles</h1>
    <p class="lede">Stored plates for faster manual entry. SkyPark does not identify your vehicle on arrival.</p>

    <div class="card">
      <div v-for="v in store.vehicles" :key="v.plate" class="list-btn">
        <span>
          <span class="mono" style="display:block;font-size:16px;letter-spacing:1px">{{ v.plate }}</span>
          <span style="display:block;font:400 12.5px var(--font);color:var(--subtle);margin-top:1px">{{ v.label }}</span>
        </span>
        <button class="link-btn" type="button" @click="store.removeVehicle(v.plate)">Remove</button>
      </div>
    </div>

    <input class="input-id sm" v-model="plate" placeholder="PDE 1234" autocapitalize="characters" />
    <button class="btn btn-primary" type="button" @click="add">Save plate</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatPlate } from '@/lib/format'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const plate = ref('')

function add() {
  store.addVehicle(formatPlate(plate.value))
  plate.value = ''
}
</script>
