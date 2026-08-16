<template>
  <div class="screen">
    <button class="back-btn" type="button" @click="back">‹ Back</button>

    <template v-if="store.demo.lookup === 'found'">
      <h1>We found your session</h1>
      <div class="card">
        <div class="card-pad card-row" style="border-bottom:1px solid var(--line-faint)">
          <span class="plate">{{ store.plateShown }}</span>
          <span class="pill pill-ok">Active session</span>
        </div>
        <div class="meta-grid">
          <div><div class="meta-k">Facility</div><div class="meta-v">{{ store.facility.name }}</div></div>
          <div><div class="meta-k">Tariff</div><div class="meta-v">{{ store.facility.tariff }}</div></div>
          <div><div class="meta-k">Entered</div><div class="meta-v">{{ store.facility.entered }}</div></div>
          <div><div class="meta-k">Duration</div><div class="meta-v">{{ store.facility.duration }}</div></div>
          <div><div class="meta-k">Ticket</div><div class="meta-v mono">{{ store.ticket || store.facility.ticket }}</div></div>
          <div><div class="meta-k">Paid up to</div><div class="meta-v">{{ store.facility.paidUpTo }}</div></div>
        </div>
        <div class="amount-block">
          <div class="amount-row">
            <span style="font:500 14px var(--font);color:var(--muted)">Amount due</span>
            <span class="amount-fig">{{ store.amountDue }}</span>
          </div>
          <div v-if="store.hasValidation" style="display:flex;justify-content:space-between;margin-top:6px;font:400 13px var(--font);color:var(--green)">
            <span>{{ store.validation.summary }}</span>
            <span style="text-decoration:line-through;color:var(--subtle)">$42.00</span>
          </div>
          <div class="attr">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#8a93a3" stroke-width="2"/><path d="M12 8v4.5l3 2" stroke="#8a93a3" stroke-width="2" stroke-linecap="round"/></svg>
            Calculated by entervo, the facility's parking system
          </div>
        </div>
      </div>
      <button class="btn btn-primary" type="button" @click="$router.push('/payment')">Continue to payment · {{ store.amountDue }}</button>
      <button v-if="!store.hasValidation" class="btn-dashed" type="button" @click="$router.push('/validation')">
        Have a validation code from a store or tenant?
      </button>
    </template>

    <template v-else-if="store.demo.lookup === 'notfound'">
      <h1>No active session found</h1>
      <p class="lede" style="margin-top:-4px">Nothing is currently parked under <span class="mono">{{ store.plateShown }}</span> at a SkyPark facility.</p>
      <div class="card card-pad" style="font:400 14px/1.7 var(--font)">
        Check the plate for typos · If this facility uses paper tickets, try the ticket number instead · Or search by phone
      </div>
      <button class="btn btn-primary" type="button" @click="$router.push('/plate')">Try the plate again</button>
      <button class="btn btn-secondary" type="button" @click="$router.push('/ticket')">Enter ticket number</button>
    </template>

    <template v-else-if="store.demo.lookup === 'multiple'">
      <h1>Two sessions match</h1>
      <p class="lede" style="margin-top:-4px"><span class="mono">{{ store.plateShown }}</span> has active sessions at two facilities. Pick where you're parked now.</p>
      <button v-for="ms in MULTI_SESSIONS" :key="ms.id" class="choice" type="button" @click="pickSession">
        <span>
          <span style="display:block;font:600 15px var(--font)">{{ ms.facility }}</span>
          <span style="display:block;font:400 13px var(--font);color:var(--muted);margin-top:2px">Entered {{ ms.entered }}</span>
        </span>
        <span class="mono">{{ money(ms.amount) }}</span>
      </button>
    </template>

    <template v-else-if="store.demo.lookup === 'unavailable'">
      <div class="alert alert-bad">
        <div class="alert-icon">!</div>
        <div>
          <div style="font:600 16px var(--font)">We can't reach the parking system</div>
          <p>The lookup service isn't responding right now, so we can't retrieve your session or amount due. Your parking is unaffected.</p>
        </div>
      </div>
      <button class="btn btn-primary" type="button" @click="$router.push('/lookup')">Try again</button>
      <p class="tiny">If this keeps happening, pay at the pay station before you exit.</p>
    </template>

    <template v-else>
      <div class="alert alert-ok">
        <div class="alert-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12.5 10 18 20 6" stroke="#0e7a4f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div>
          <div style="font:600 16px var(--font)">This session is already paid</div>
          <p><span class="mono">{{ store.plateShown }}</span> was paid at 12:31 pm. No further payment is needed. Head to the exit.</p>
        </div>
      </div>
      <button class="btn btn-secondary" type="button" @click="$router.push('/receipt')">View receipt</button>
      <button class="btn-ghost" type="button" @click="$router.push('/')">Done</button>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MULTI_SESSIONS } from '@/data/mock'
import { money } from '@/lib/format'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const router = useRouter()

onMounted(() => {
  const lookup = store.demo.lookup
  if (lookup === 'found') {
    store.log({
      action: 'Check-in',
      category: 'session',
      detail: `Session found · ${store.facility.name} · entered ${store.facility.entered}`,
    })
  } else if (lookup === 'notfound') {
    store.log({
      action: 'Check-in failed',
      category: 'session',
      outcome: 'fail',
      detail: `No active session for ${store.plateShown}`,
    })
  } else if (lookup === 'unavailable') {
    store.log({
      action: 'Lookup failed',
      category: 'session',
      outcome: 'fail',
      detail: 'entervo lookup service unavailable',
    })
  } else if (lookup === 'multiple') {
    store.log({
      action: 'Check-in needs facility selection',
      category: 'session',
      detail: `Multiple sessions matched ${store.plateShown}`,
    })
  } else if (lookup === 'paid') {
    store.log({
      action: 'Check-in',
      category: 'session',
      detail: `Session already paid · ${store.plateShown}`,
    })
  }
})

function back() {
  router.push(store.fromQR ? '/plate' : '/')
}

function pickSession() {
  store.setDemo('lookup', 'found')
  store.log({
    action: 'Check-in',
    category: 'session',
    detail: `Facility selected · ${store.facility.name}`,
  })
}
</script>
