<template>
  <div class="screen">
    <button class="back-btn" type="button" @click="$router.push('/')">‹ Back</button>
    <h1>Hi, {{ store.customerName }}</h1>
    <p class="lede">{{ store.customerEmail }}</p>

    <div class="credit-card">
      <div style="font:500 12px var(--font);color:var(--navy-muted);letter-spacing:1px">Prepaid credit</div>
      <div style="font:700 36px var(--mono);margin-top:4px">{{ money(store.creditBalance) }}</div>
      <button class="btn" style="margin-top:12px;min-height:44px;width:auto;padding:11px 18px;background:#fff;color:var(--navy);font-size:14.5px;border-radius:10px" type="button" @click="$router.push('/account/topup')">Top up credit</button>
    </div>

    <div class="card">
      <button class="list-btn" type="button" @click="$router.push('/account/vehicles')">
        <span>
          <span style="display:block;font:600 15px var(--font)">Saved vehicles</span>
          <span style="display:block;font:400 12.5px var(--font);color:var(--subtle);margin-top:1px">For faster plate entry, {{ store.vehicles.length }} saved</span>
        </span>
        <span class="chev">›</span>
      </button>
      <button class="list-btn" type="button" @click="$router.push('/account/cards')">
        <span>
          <span style="display:block;font:600 15px var(--font)">Tokenized cards</span>
          <span style="display:block;font:400 12.5px var(--font);color:var(--subtle);margin-top:1px">{{ store.cards.length ? store.cards.map((c) => c.masked).join(' · ') : 'None saved' }}</span>
        </span>
        <span class="chev">›</span>
      </button>
      <button class="list-btn" type="button" @click="$router.push('/account/history')">
        <span>
          <span style="display:block;font:600 15px var(--font)">Payment history</span>
          <span style="display:block;font:400 12.5px var(--font);color:var(--subtle);margin-top:1px">{{ store.history.length }} payments · cards, wallets, and credit</span>
        </span>
        <span class="chev">›</span>
      </button>
      <button class="list-btn" type="button" @click="$router.push('/receipt')">
        <span style="font:600 15px var(--font)">Receipts</span>
        <span class="chev">›</span>
      </button>
    </div>

    <div>
      <h2 style="font:700 18px var(--font);margin:4px 0 2px">Activity</h2>
      <p class="lede" style="margin:0 0 10px">When you scanned in, scanned out, and paid, including the card or wallet used.</p>
      <div class="card" style="padding:0 18px;max-height:480px;overflow:auto">
        <div v-if="!activityFeed.length" class="card-pad" style="color:var(--muted)">No activity yet.</div>
        <div v-for="e in activityFeed" :key="e.id" class="list-row" style="padding:13px 0;align-items:flex-start;gap:12px">
          <span style="flex:1;min-width:0">
            <span style="display:block;font:600 14.5px var(--font)">{{ e.title }}</span>
            <span v-if="e.methodLabel" style="display:block;font:500 13px var(--font);margin-top:3px">{{ e.methodLabel }}</span>
            <span style="display:block;font:400 12.5px var(--font);color:var(--subtle);margin-top:2px">
              {{ activityDetail(e) }}
            </span>
            <span style="display:block;font:400 12px var(--font);color:var(--subtle);margin-top:2px">{{ formatShort(e.at) }}</span>
          </span>
          <span v-if="e.amount != null" class="mono" style="font-size:14.5px;flex:none">{{ money(e.amount) }}</span>
        </div>
      </div>
    </div>

    <p class="tiny" style="text-align:left">Saved plates speed up manual entry. SkyPark doesn't detect your vehicle automatically on arrival.</p>
    <button class="btn-ghost" type="button" @click="store.signOut(); $router.push('/')">Sign out</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { enrichCustomerActivity } from '@/lib/account'
import { formatShort, money } from '@/lib/format'
import { useActivityStore } from '@/stores/activity'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const activity = useActivityStore()

const activityFeed = computed(() =>
  enrichCustomerActivity(activity.events, store.history, store.customerId),
)

function activityDetail(event) {
  const bits = []
  if (event.where) bits.push(event.where.replace(/^SkyPark · /, ''))
  else if (event.detail) bits.push(event.detail.replace(/^Session found · /, ''))
  if (event.plate && !bits.join(' ').includes(event.plate)) bits.push(event.plate)
  if (event.ref && (event.title === 'Payment' || event.title === 'Payment declined' || event.title.startsWith('Refund'))) {
    bits.push(event.ref)
  }
  return bits.join(' · ')
}
</script>
