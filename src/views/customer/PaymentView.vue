<template>
  <div class="screen">
    <button class="back-btn" type="button" @click="$router.push('/session')">‹ Back</button>
    <h1>Pay {{ store.amountDue }}</h1>
    <p class="lede">{{ store.plateShown }} · {{ store.facility.name }}</p>

    <div v-if="store.payError" class="alert alert-bad" style="display:block">
      <div style="font:600 14px var(--font);color:var(--red-ink)">{{ store.payError[0] }}</div>
      <div style="font:400 13px/1.5 var(--font);color:var(--red-ink);margin-top:2px">{{ store.payError[1] }}</div>
    </div>

    <template v-if="store.demo.wallets">
      <div class="btn-row">
        <button class="btn btn-dark" style="min-height:52px;border-radius:12px;font:600 15px var(--font)" type="button" @click="pay('apple')">Apple Pay</button>
        <button class="btn btn-secondary" style="min-height:52px;border-radius:12px" type="button" @click="pay('google')">Google Pay</button>
      </div>
      <div style="display:flex;align-items:center;gap:12px;color:var(--subtle);font:400 12.5px var(--font)">
        <div style="flex:1;height:1px;background:var(--line-soft)"></div>or pay by card<div style="flex:1;height:1px;background:var(--line-soft)"></div>
      </div>
    </template>

    <button
      v-if="store.signedIn"
      class="choice"
      type="button"
      @click="pay('credit')"
    >
      <span style="font:600 14.5px var(--font)">Use prepaid credit</span>
      <span class="mono" style="color:var(--green)">{{ money(store.creditBalance) }} available</span>
    </button>

    <template v-if="store.signedIn && store.cards.length">
      <div class="meta-k">Tokenized cards</div>
      <button
        v-for="c in store.cards"
        :key="c.id"
        class="card-option"
        :class="{ on: store.payMethod !== 'card' && store.selectedCardId === c.id }"
        type="button"
        @click="pickToken(c.id)"
      >
        <span class="card-brand">{{ c.brand.slice(0, 4).toUpperCase() }}</span>
        <span style="flex:1">
          <span class="mono" style="display:block;font-size:14.5px">{{ c.masked }}</span>
          <span style="display:block;font:400 12px var(--font);color:var(--subtle);margin-top:2px">{{ c.brand }} · exp {{ c.exp }}{{ c.default ? ' · default' : '' }}</span>
        </span>
      </button>
      <button class="btn-ghost" type="button" @click="useNew = !useNew">
        {{ useNew ? 'Hide new card' : 'Use a different card' }}
      </button>
    </template>

    <div v-if="!store.signedIn || !store.cards.length || useNew" class="card">
      <div style="display:flex;align-items:center;gap:8px;padding:11px 16px;background:#f2f5fa;border-bottom:1px solid var(--line-soft)">
        <svg width="12" height="14" viewBox="0 0 24 26" fill="none"><rect x="3" y="10" width="18" height="13" rx="3" stroke="#5b6472" stroke-width="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="#5b6472" stroke-width="2"/></svg>
        <span style="font:500 12px var(--font);color:var(--muted)">Secure page hosted by PowerTranz</span>
      </div>
      <div style="padding:16px 16px 18px;display:flex;flex-direction:column;gap:12px">
        <input class="input-text" :value="store.card" placeholder="Card number" inputmode="numeric" @input="onPan" />
        <div class="btn-row">
          <input class="input-text" :value="store.exp" placeholder="MM / YY" inputmode="numeric" @input="store.exp = $event.target.value" />
          <input class="input-text" :value="store.cvv" placeholder="CVV" inputmode="numeric" @input="store.cvv = $event.target.value" />
        </div>
        <label v-if="store.signedIn" style="display:flex;align-items:center;gap:8px;font:500 13.5px var(--font)">
          <input type="checkbox" v-model="store.saveNewCard" />
          Tokenize and save this card to my account
        </label>
        <div style="font:400 12px/1.5 var(--font);color:var(--subtle)">
          Card details never reach SkyPark. PowerTranz returns a token and a masked PAN such as 41112xxxxxxx456.
        </div>
      </div>
    </div>

    <button class="btn btn-primary" type="button" @click="payWithCard">Pay {{ store.amountDue }}</button>

    <div class="grow"></div>
    <div class="pay-brands" aria-label="Accepted cards and payment processor">
      <img class="pay-brand pay-brand-knockout" src="/assets/visa-logo.png" alt="Visa" />
      <img class="pay-brand pay-brand-knockout" src="/assets/mastercard-logo.png" alt="Mastercard" />
      <img class="pay-brand pay-brand-processor" src="/assets/powertranz_logo.jpg" alt="PowerTranz" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { money } from '@/lib/format'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const router = useRouter()
const useNew = ref(!store.signedIn || !store.cards.length)

onMounted(() => {
  store.paying = false
  if (store.signedIn && store.cards.length && !store.selectedCardId) {
    store.selectedCardId = store.cards[0].id
  }
  if (store.signedIn && store.cards.length && !useNew.value) {
    store.payMethod = 'token'
  }
})

function onPan(e) {
  store.card = e.target.value
  store.payMethod = 'card'
}

function pickToken(id) {
  store.selectedCardId = id
  store.payMethod = 'token'
  useNew.value = false
}

function pay(method) {
  const result = store.startPayment(method)
  if (result.duplicate) return
  router.push('/processing')
}

function payWithCard() {
  const method = useNew.value || !store.selectedCardId ? 'card' : 'token'
  pay(method)
}
</script>
