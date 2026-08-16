<template>
  <div class="screen">
    <button class="back-btn" type="button" @click="$router.push('/account')">‹ Back</button>
    <h1>Top up credit</h1>
    <p class="lede">Choose an amount to add. You'll pay it on the next screen with a card or wallet. Amounts are TTD.</p>
    <div class="route-grid" style="grid-template-columns:1fr 1fr">
      <button v-for="amt in amounts" :key="amt" class="choice" style="min-height:72px;flex-direction:column;align-items:flex-start;gap:4px" type="button" @click="pick = amt">
        <span class="mono" style="font-size:22px">{{ money(amt) }}</span>
        <span v-if="pick === amt" class="pill pill-ok">Selected</span>
      </button>
    </div>
    <button class="btn btn-primary" type="button" :disabled="!pick" @click="continueToPay">
      Continue to payment{{ pick ? ' · ' + money(pick) : '' }}
    </button>
    <p class="tiny">Current balance {{ money(store.creditBalance) }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { money } from '@/lib/format'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const router = useRouter()
const amounts = [25, 50, 100, 200]
const pick = ref(store.topUpAmount || 50)

function continueToPay() {
  store.beginTopUp(pick.value)
  router.push('/account/topup/pay')
}
</script>
