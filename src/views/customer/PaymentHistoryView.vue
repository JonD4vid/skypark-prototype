<template>
  <div class="screen">
    <button class="back-btn" type="button" @click="$router.push('/account')">‹ Back</button>
    <h1>Payment history</h1>
    <p class="lede">Every parking charge and credit top-up, including the card or wallet used.</p>

    <div v-if="store.history.length" class="card" style="padding:0 18px">
      <div v-for="h in store.history" :key="h.id" class="list-row" style="padding:14px 0;align-items:flex-start;gap:12px">
        <span style="flex:1;min-width:0">
          <span style="display:block;font:600 15px var(--font)">{{ h.where }}</span>
          <span style="display:block;font:400 12.5px var(--font);color:var(--subtle);margin-top:2px">
            {{ h.when }}<template v-if="h.plate"> · {{ h.plate }}</template>
          </span>
          <span style="display:block;font:500 13px var(--font);margin-top:6px">{{ paymentMethodLabel(h) }}</span>
          <span style="display:block;font:400 12px var(--font);color:var(--subtle);margin-top:2px">{{ h.ref }}</span>
        </span>
        <span style="text-align:right;flex:none">
          <span class="mono" style="display:block;font-size:15px">{{ money(h.amount) }}</span>
          <span v-if="h.status" class="pill" :class="paymentStatusClass(h.status)" style="display:inline-block;margin-top:6px">{{ h.status }}</span>
        </span>
      </div>
    </div>
    <div v-else class="card card-pad" style="color:var(--muted)">No payments yet.</div>
  </div>
</template>

<script setup>
import { paymentMethodLabel, paymentStatusClass } from '@/lib/account'
import { money } from '@/lib/format'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
</script>
