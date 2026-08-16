<template>
  <div class="screen">
    <button class="back-btn" type="button" @click="$router.push('/')">‹ Close</button>
    <h1>Your receipt</h1>
    <div class="card" style="padding:20px 20px 18px">
      <div class="card-row" style="border-bottom:1px dashed var(--line);padding-bottom:14px;align-items:baseline">
        <div>
          <div style="font:700 17px var(--font)">SkyPark parking</div>
          <div style="font:400 12.5px var(--font);color:var(--muted);margin-top:2px">{{ store.facility.shortName }} · Today, 12:48 pm</div>
        </div>
        <div style="font:700 26px var(--mono)">{{ store.amountDue }}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;padding-top:14px;font:400 13.5px var(--font)">
        <div class="card-row"><span style="color:var(--muted)">Plate</span><span class="mono">{{ store.plateShown }}</span></div>
        <div class="card-row"><span style="color:var(--muted)">Duration</span><span>{{ store.facility.duration }} · {{ store.facility.tariff }}</span></div>
        <div v-if="store.hasValidation" class="card-row"><span style="color:var(--muted)">Validation</span><span style="color:var(--green)">{{ store.validation.summary }}</span></div>
        <div class="card-row"><span style="color:var(--muted)">Method</span><span>{{ store.payMethodLabel() }}</span></div>
        <div class="card-row"><span style="color:var(--muted)">Card</span><span class="mono">{{ store.lastCardMasked }}</span></div>
        <div class="card-row"><span style="color:var(--muted)">Reference</span><span class="mono">{{ store.lastRef }}</span></div>
        <div class="card-row"><span style="color:var(--muted)">Transaction id</span><span class="mono">{{ store.lastTransactionId || '-' }}</span></div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px">
      <button class="btn btn-secondary" type="button" @click="email">{{ store.sent.email ? 'Sent to d•••@skygrid.tt ✓' : 'Email receipt' }}</button>
      <button class="btn btn-secondary" type="button" @click="sms">{{ store.sent.sms ? 'Sent to •••• 4402 ✓' : 'Send by SMS' }}</button>
      <button class="btn btn-secondary" type="button" @click="download">{{ store.sent.pdf ? 'Downloaded ✓' : 'Download PDF' }}</button>
      <button v-if="canRefund" class="btn btn-secondary" type="button" @click="askRefund">{{ refundLabel }}</button>
    </div>

    <div v-if="!store.signedIn" style="background:var(--blue-soft);border-radius:14px;padding:15px 17px">
      <div style="font:600 14.5px var(--font);color:var(--blue-hover)">Park here often?</div>
      <div style="font:400 13px/1.5 var(--font);color:var(--blue-text);margin-top:3px">Create an account to keep receipts, save your plate and top up prepaid credit.</div>
      <button class="btn btn-primary" style="margin-top:10px;min-height:44px;width:auto;padding:11px 16px;font-size:14px;border-radius:10px" type="button" @click="$router.push({ path: '/signin', query: { intent: 'create' } })">Create account</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const admin = useAdminStore()
const refundLabel = ref('Request refund')

const txn = computed(() => admin.findTxn(store.lastRef))
const canRefund = computed(() => txn.value && txn.value.paymentStatus === 'Captured')

function email() {
  store.sent.email = true
  store.log({ action: 'Receipt emailed', category: 'account', ref: store.lastRef })
}
function sms() {
  store.sent.sms = true
  store.log({ action: 'Receipt sent by SMS', category: 'account', ref: store.lastRef })
}

function askRefund() {
  const ok = admin.requestRefund(store.lastRef, {
    requestedBy: store.actorName,
    reason: 'Customer requested from receipt',
    actorType: store.signedIn ? 'customer' : 'customer',
    customerId: store.signedIn ? store.customerId : null,
  })
  refundLabel.value = ok ? 'Refund sent for admin confirmation' : 'Refund not available'
}

function download() {
  const text = [
    'SkyPark parking receipt',
    store.facility.name,
    `Plate: ${store.plateShown}`,
    `Amount: ${store.amountDue}`,
    `Card: ${store.lastCardMasked}`,
    `Reference: ${store.lastRef}`,
    `Transaction id: ${store.lastTransactionId}`,
    `Method: ${store.payMethodLabel()}`,
    'Amount calculated by entervo',
  ].join('\n')
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${store.lastRef}-receipt.txt`
  a.click()
  URL.revokeObjectURL(url)
  store.sent.pdf = true
  store.log({ action: 'Receipt downloaded', category: 'account', ref: store.lastRef })
}
</script>
