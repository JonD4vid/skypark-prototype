<template>
  <div>
    <div class="admin-top">
      <div>
        <h1>Configuration</h1>
        <p class="lede" style="margin-top:6px">Facilities and capabilities. Pay by plate appears only where LPR / ticketless is enabled.</p>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Facility</th>
            <th>Pay by plate</th>
            <th>Exit window</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in admin.facilities" :key="f.id">
            <td>{{ f.name }}</td>
            <td>
              <button class="pill-btn" :class="{ on: f.lpr }" type="button" @click="askToggle(f)">
                {{ f.lpr ? 'LPR enabled' : 'Ticket only' }}
              </button>
            </td>
            <td>{{ f.exitWindowMin }} minutes</td>
            <td>{{ f.active ? 'Yes' : 'No' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pending" class="modal-scrim" @click.self="pending = null">
      <div class="modal-card">
        <h2 style="margin:0 0 8px;font:700 20px var(--font)">
          Switch {{ pending.name }} to {{ pending.lpr ? 'Ticket only' : 'LPR enabled' }}?
        </h2>
        <p class="lede">
          {{ pending.lpr
            ? 'Pay by plate will no longer appear for this facility. Drivers will need a ticket.'
            : 'Pay by plate will appear for this facility. Drivers can pay with licence plate recognition.' }}
        </p>
        <div class="toolbar" style="margin-top:14px">
          <button class="btn-sm primary" type="button" @click="confirmToggle">Confirm</button>
          <button class="btn-sm" type="button" @click="pending = null">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useSkyParkStore } from '@/stores/skypark'

const admin = useAdminStore()
const sky = useSkyParkStore()
const pending = ref(null)

function askToggle(facility) {
  pending.value = facility
}

function confirmToggle() {
  const facility = pending.value
  if (!facility) return
  admin.toggleFacilityLpr(facility.id)
  if (facility.id === 'level-2-west') sky.setDemo('lpr', facility.lpr)
  pending.value = null
}
</script>
