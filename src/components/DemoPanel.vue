<template>
  <button class="demo-fab" type="button" @click="open = !open">
    <span class="demo-dot"></span>
    Demo scenarios
  </button>

  <template v-if="open">
    <div class="demo-scrim" @click="open = false"></div>
    <aside class="demo-rail">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:18px 20px 12px;position:sticky;top:0;background:#fff;z-index:1">
        <div>
          <div style="font:700 17px var(--font)">Demo scenarios</div>
          <div style="font:400 12px var(--font);color:var(--subtle);margin-top:2px">For client review: drive every failure path</div>
        </div>
        <button class="btn-sm" type="button" @click="open = false">✕</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:16px;padding:8px 20px 28px">
        <div>
          <div class="rail-k">Jump to screen</div>
          <div class="saved-pills">
            <button v-for="s in screens" :key="s.name" class="pill-btn" type="button" @click="jump(s)">{{ s.label }}</button>
          </div>
        </div>

        <div v-for="group in groups" :key="group.title">
          <div style="font:600 13px var(--font)">{{ group.title }}</div>
          <div style="font:400 11.5px/1.45 var(--font);color:var(--subtle);margin:1px 0 7px">{{ group.note }}</div>
          <div class="saved-pills">
            <button
              v-for="opt in group.opts"
              :key="opt.label"
              class="pill-btn"
              :class="{ on: opt.on() }"
              type="button"
              @click="opt.pick"
            >{{ opt.label }}</button>
          </div>
        </div>

        <router-link to="/admin" class="admin-jump" @click="open = false">Open admin portal</router-link>
      </div>
    </aside>
  </template>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const router = useRouter()
const open = ref(false)

const screens = [
  { label: '01 Entry', name: 'entry' },
  { label: '02 Plate', name: 'plate' },
  { label: '03 Session', name: 'session' },
  { label: '04 Validation', name: 'validation' },
  { label: '05 Payment', name: 'payment' },
  { label: '06 Confirmation', name: 'confirm' },
  { label: '07 Receipt', name: 'receipt' },
  { label: '08 Sign in', name: 'signin' },
  { label: '09 Account', name: 'account', signIn: true },
  { label: 'Top up', name: 'topup', signIn: true },
  { label: 'Top-up payment', name: 'topup-pay', signIn: true },
  { label: 'Magic link', name: 'signin-link' },
  { label: 'Forgot password', name: 'signin-forgot' },
  { label: 'Reset password', name: 'signin-reset' },
]

function jump(s) {
  if (s.signIn) store.signIn()
  if (s.name === 'signin-link') store.requestSignInLink('duree@skygrid.tt')
  if (s.name === 'signin-reset') store.requestPasswordReset('duree@skygrid.tt')
  if (s.name === 'confirm') store.entervoState = store.demo.entervo === 'posted' ? 'ok' : 'failed'
  if (s.name === 'payment') store.payError = null
  if (s.name === 'plate') store.fromQR = false
  if (s.name === 'topup-pay' || s.name === 'topup-confirm') store.beginTopUp(store.topUpAmount || 50)
  router.push({ name: s.name })
  open.value = false
}

const groups = computed(() => [
  {
    title: 'Ticket scan',
    note: 'QR / barcode read at entry',
    opts: [
      { label: 'Read ok', on: () => store.demo.scan === 'ok', pick: () => store.setDemo('scan', 'ok') },
      { label: 'Scan failed', on: () => store.demo.scan === 'fail', pick: () => store.setDemo('scan', 'fail') },
    ],
  },
  {
    title: 'Facility capability',
    note: 'Pay by plate exists only at LPR facilities: absent, not disabled',
    opts: [
      { label: 'LPR / ticketless', on: () => store.demo.lpr, pick: () => store.setDemo('lpr', true) },
      { label: 'Ticket only', on: () => !store.demo.lpr, pick: () => store.setDemo('lpr', false) },
    ],
  },
  {
    title: 'Session lookup (entervo)',
    note: 'Result of the plate / ticket lookup',
    opts: [
      ['Found', 'found'],
      ['Not found', 'notfound'],
      ['Multiple matches', 'multiple'],
      ['Service unavailable', 'unavailable'],
      ['Already paid', 'paid'],
    ].map(([label, val]) => ({
      label,
      on: () => store.demo.lookup === val,
      pick: () => store.setDemo('lookup', val),
    })),
  },
  {
    title: 'Validation code',
    note: 'What applying a code does',
    opts: [
      ['Free time', 'freetime'],
      ['50% off', 'percent'],
      ['$20 credit', 'fixed'],
      ['Covers total', 'zero'],
      ['Invalid', 'invalid'],
      ['Expired', 'expired'],
      ['Already used', 'used'],
      ['Wrong facility', 'wrongfacility'],
      ['Usage limit', 'limit'],
    ].map(([label, val]) => ({
      label,
      on: () => store.demo.valid === val,
      pick: () => store.setDemo('valid', val),
    })),
  },
  {
    title: 'Wallets on merchant account',
    note: 'Apple / Google Pay pending PowerTranz enablement',
    opts: [
      { label: 'Enabled', on: () => store.demo.wallets, pick: () => store.setDemo('wallets', true) },
      { label: 'Card only', on: () => !store.demo.wallets, pick: () => store.setDemo('wallets', false) },
    ],
  },
  {
    title: 'Payment result (PowerTranz)',
    note: 'Outcome after Pay',
    opts: [
      ['Approved', 'approved'],
      ['Declined', 'declined'],
      ['Insufficient funds', 'insufficient'],
      ['3DS failed', 'threeds'],
      ['Timeout', 'timeout'],
      ['Gateway down', 'gateway'],
    ].map(([label, val]) => ({
      label,
      on: () => store.demo.payment === val,
      pick: () => store.setDemo('payment', val),
    })),
  },
  {
    title: 'entervo notification',
    note: 'The hard case: paid, but the parking system wasn’t told',
    opts: [
      { label: 'Posted', on: () => store.demo.entervo === 'posted', pick: () => store.setDemo('entervo', 'posted') },
      { label: 'Failed', on: () => store.demo.entervo === 'failed', pick: () => store.setDemo('entervo', 'failed') },
    ],
  },
  {
    title: 'Customer',
    note: 'Signed-in users can pay with prepaid credit',
    opts: [
      { label: 'Guest', on: () => !store.signedIn, pick: () => store.signOut() },
      { label: 'Signed in', on: () => store.signedIn, pick: () => store.signIn() },
    ],
  },
])
</script>

<style scoped>
.rail-k {
  font: 600 10.5px var(--font);
  color: var(--subtle);
  letter-spacing: 1.3px;
  margin-bottom: 8px;
}
.admin-jump {
  display: block;
  text-align: center;
  padding: 12px;
  border-radius: 12px;
  background: var(--blue-soft);
  color: var(--blue);
  font: 600 14px var(--font);
  text-decoration: none;
}
</style>
