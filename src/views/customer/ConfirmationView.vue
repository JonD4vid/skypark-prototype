<template>
  <div class="screen" style="padding-top:40px">
    <template v-if="store.entervoState === 'ok'">
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:10px 0 4px">
        <div class="ok-mark">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M4 12.5 10 18 20 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div style="font:700 26px var(--font);letter-spacing:-0.6px">Paid {{ store.amountDue }}</div>
        <div style="font:600 18px var(--font);color:var(--green)">You may now exit</div>
        <div style="font:400 13.5px/1.5 var(--font);color:var(--muted);text-align:center;max-width:340px">
          The parking system has your ticket recorded as paid. Drive to the exit within 15 minutes; the barrier opens on your ticket or plate.
        </div>
      </div>
      <div class="card card-pad meta-grid" style="padding:14px 18px">
        <div><div class="meta-k">Plate</div><div class="meta-v mono">{{ store.plateShown }}</div></div>
        <div><div class="meta-k">Reference</div><div class="meta-v mono">{{ store.lastRef }}</div></div>
        <div><div class="meta-k">Transaction id</div><div class="meta-v mono">{{ store.lastTransactionId || '-' }}</div></div>
        <div><div class="meta-k">Card</div><div class="meta-v mono">{{ store.lastCardMasked }}</div></div>
      </div>
      <button class="btn btn-primary" type="button" @click="$router.push('/receipt')">Get my receipt</button>
      <button class="btn-ghost" type="button" @click="$router.push('/')">Done</button>
    </template>

    <template v-else>
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:10px 0 4px">
        <div class="warn-mark">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 7v6" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="12" cy="17" r="1.6" fill="#fff"/></svg>
        </div>
        <div style="font:700 24px var(--font);letter-spacing:-0.6px;text-align:center">Payment received: {{ store.amountDue }}</div>
        <div style="font:500 15px/1.5 var(--font);color:var(--muted);text-align:center;max-width:340px">
          Your payment is verified with PowerTranz. The parking system has not yet recorded it, so the barrier may not open on its own.
        </div>
      </div>
      <div class="alert alert-warn" style="flex-direction:column;gap:10px">
        <div style="display:flex;align-items:center;gap:9px">
          <div class="spinner" style="width:16px;height:16px;border-width:2.5px;border-color:#e3ca92;border-top-color:var(--amber)"></div>
          <span style="font:600 14px var(--font);color:var(--amber-ink)">Recording the sale in the parking system… retrying</span>
        </div>
        <div style="font:400 13px/1.6 var(--font);color:var(--amber-ink)">
          Your card was charged once. <strong>Don't pay again</strong>. Our operations team has been alerted automatically and can release your exit.
        </div>
      </div>
      <div class="card card-pad meta-grid" style="padding:14px 18px">
        <div><div class="meta-k">Plate</div><div class="meta-v mono">{{ store.plateShown }}</div></div>
        <div><div class="meta-k">Reference</div><div class="meta-v mono">{{ store.lastRef }}</div></div>
        <div><div class="meta-k">Transaction id</div><div class="meta-v mono">{{ store.lastTransactionId || '-' }}</div></div>
        <div><div class="meta-k">Card</div><div class="meta-v mono">{{ store.lastCardMasked }}</div></div>
      </div>
      <a class="btn btn-dark" style="display:flex;align-items:center;justify-content:center;gap:9px;text-decoration:none;font-size:16px" href="tel:+18685550100">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M6 3h4l2 5-2.5 1.5a12 12 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2.2 2A17 17 0 0 1 4 6.2 2 2 0 0 1 6 3Z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>
        Call operations (free)
      </a>
      <div class="tiny">
        At the barrier, you can also press the intercom help button and quote reference <span class="mono" style="color:var(--muted)">{{ store.lastRef }}</span>.
      </div>
      <button class="btn-ghost" type="button" @click="resolve">
        (demo: parking system confirms →)
      </button>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const admin = useAdminStore()

onMounted(() => {
  if (store.entervoState === 'ok') {
    store.log({
      action: 'Check-out authorised',
      category: 'session',
      detail: `entervo posted · exit window 15 min · ${store.lastRef}`,
      ref: store.lastRef,
    })
  } else {
    store.log({
      action: 'Check-out blocked',
      category: 'session',
      outcome: 'fail',
      detail: 'Payment captured but parking system has not recorded it',
      ref: store.lastRef,
    })
  }
})

function resolve() {
  store.resolveEntervo()
  admin.resend(store.lastRef)
  store.log({
    action: 'Check-out authorised',
    category: 'session',
    detail: 'Parking system confirmed after retry',
    ref: store.lastRef,
  })
}
</script>
