<template>
  <div class="screen">
    <button class="back-btn" type="button" @click="$router.push('/session')">‹ Back</button>
    <h1>Validation code</h1>
    <p class="lede">From a store, restaurant or building tenant. Optional. Skip it if you don't have one.</p>

    <input
      class="input-id sm"
      :value="store.code"
      placeholder="SKY-4TXQ"
      autocapitalize="characters"
      @input="onCode"
    />

    <div v-if="store.codeError" class="alert alert-bad" style="font:500 13.5px/1.5 var(--font);color:var(--red-ink);display:block">
      {{ store.codeError }}
    </div>

    <div v-if="store.validation" class="alert alert-ok" style="display:block">
      <div style="display:flex;align-items:center;gap:8px;font:600 15px var(--font);color:var(--green-ink)">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 12.5 10 18 20 6" stroke="#0b5c3c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        {{ store.validation.benefit }}
      </div>
      <div style="font:400 13px var(--font);color:var(--green-mid);margin-top:3px">{{ store.validation.org }}</div>
      <div class="amount-row" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--green-line)">
        <span style="font:500 13.5px var(--font);color:var(--green-mid)">New total</span>
        <span style="font:700 26px var(--mono);color:var(--green-ink)">{{ store.amountDue }}</span>
      </div>
    </div>

    <template v-if="!store.validation">
      <button class="btn btn-primary" type="button" @click="store.applyCode()">Apply code</button>
      <button class="btn-ghost" type="button" @click="$router.push('/session')">Skip and continue without a code</button>
    </template>

    <button
      v-else-if="store.validation.total > 0"
      class="btn btn-primary"
      type="button"
      @click="$router.push('/payment')"
    >Continue to payment · {{ store.amountDue }}</button>

    <button v-else class="btn btn-success" type="button" @click="finishZero">Done, nothing to pay</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const router = useRouter()

function onCode(e) {
  store.code = e.target.value.toUpperCase()
  store.codeError = null
}

function finishZero() {
  store.finishZeroDue()
  router.push('/confirm')
}
</script>
