<template>
  <div class="screen screen-center" style="gap:18px;padding:20px">
    <div class="spinner"></div>
    <div style="font:600 16px var(--font)">{{ store.processingLabel }}</div>
    <div class="card" style="padding:16px 20px;min-width:min(340px,100%);display:flex;flex-direction:column;gap:9px">
      <div v-for="(step, i) in steps" :key="step" style="display:flex;align-items:center;gap:10px">
        <span class="step-dot" :style="dot(i)"></span>
        <span :style="text(i)">{{ step }}</span>
      </div>
    </div>
    <div style="font:400 13.5px/1.5 var(--font);color:var(--muted);max-width:320px">
      Your bank may ask you to confirm this payment. Don't close this page - you'll be brought back automatically.
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const admin = useAdminStore()
const router = useRouter()
const timers = []
const isTopUp = computed(() => store.paymentPurpose === 'topup')
const steps = computed(() =>
  isTopUp.value
    ? ['Payment authorised by your bank', 'Payment verified independently', 'Credit added to your account']
    : ['Payment authorised by your bank', 'Payment verified independently', 'Sale recorded in the parking system'],
)

function dot(i) {
  const done = i < store.procStep
  const active = i === store.procStep
  return {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    flex: 'none',
    background: done ? '#0e7a4f' : active ? '#1141a3' : '#d4dae4',
    animation: active ? 'pulse 1s ease-in-out infinite' : 'none',
  }
}

function text(i) {
  const done = i < store.procStep
  const active = i === store.procStep
  return {
    font: `${active ? 600 : 400} 13.5px Instrument Sans, system-ui`,
    color: done ? '#0e7a4f' : active ? '#131a26' : '#8a93a3',
  }
}

function record(result) {
  admin.upsertFromPayment({
    ref: store.lastRef,
    transactionId: result.transactionId,
    datetime: result.datetime,
    plate: isTopUp.value ? '-' : store.plateShown,
    amount: isTopUp.value ? store.topUpAmount : store.amountNumber,
    method: store.payMethodLabel(),
    cardMasked: result.cardMasked,
    cardToken: result.cardToken,
    cardBrand: store.paymentMethodSnapshot().cardBrand,
    paymentStatus: result.paymentStatus,
    entervoStatus: isTopUp.value ? '-' : result.entervoStatus,
    entervo: isTopUp.value ? 'skip' : result.entervo,
    facility: isTopUp.value ? 'Prepaid credit' : store.facility.shortName,
    customer: store.signedIn ? 'Duree Arthur' : 'Guest',
    customerId: store.signedIn ? store.customerId : null,
    validation: isTopUp.value ? '-' : (store.validation?.summary || '-'),
    timeline: result.timeline,
    errors: result.errors,
  })
}

onMounted(() => {
  timers.push(setTimeout(() => {
    if (store.demo.payment !== 'approved') {
      const result = isTopUp.value ? store.finishTopUpPayment() : store.finishPayment()
      record(result)
      router.replace(isTopUp.value ? '/account/topup/pay' : '/payment')
      return
    }
    store.paymentTick(1)
    timers.push(setTimeout(() => {
      store.paymentTick(2)
      timers.push(setTimeout(() => {
        const result = isTopUp.value ? store.finishTopUpPayment() : store.finishPayment()
        record(result)
        router.replace(isTopUp.value ? '/account/topup/confirm' : '/confirm')
      }, 1200))
    }, 1100))
  }, 1800))
})

onUnmounted(() => timers.forEach(clearTimeout))
</script>
