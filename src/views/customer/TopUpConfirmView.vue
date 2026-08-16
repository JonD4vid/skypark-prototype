<template>
  <div class="screen" style="padding-top:40px">
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:10px 0 4px">
      <div class="ok-mark">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M4 12.5 10 18 20 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div style="font:700 26px var(--font);letter-spacing:-0.6px">Credit added {{ store.topUpDue }}</div>
      <div style="font:600 18px var(--font);color:var(--green)">New balance {{ money(store.creditBalance) }}</div>
      <div style="font:400 13.5px/1.5 var(--font);color:var(--muted);text-align:center;max-width:340px">
        This prepaid credit is on your SkyPark account. You can use it the next time you pay for parking.
      </div>
    </div>
    <div class="card card-pad meta-grid" style="padding:14px 18px">
      <div><div class="meta-k">Added</div><div class="meta-v mono">{{ store.topUpDue }}</div></div>
      <div><div class="meta-k">Balance</div><div class="meta-v mono">{{ money(store.creditBalance) }}</div></div>
      <div><div class="meta-k">Reference</div><div class="meta-v mono">{{ store.lastRef }}</div></div>
      <div><div class="meta-k">Card</div><div class="meta-v mono">{{ store.lastCardMasked }}</div></div>
    </div>
    <button class="btn btn-primary" type="button" @click="$router.push('/account')">Back to my account</button>
  </div>
</template>

<script setup>
import { money } from '@/lib/format'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
</script>
