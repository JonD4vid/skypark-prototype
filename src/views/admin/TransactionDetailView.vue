<template>
  <div v-if="t">
    <button class="back-btn" type="button" @click="$router.push('/admin/transactions')">‹ Transactions</button>
    <div class="admin-top">
      <div>
        <h1>{{ t.ref }}</h1>
        <p class="lede" style="margin-top:6px">{{ formatDateTime(t.datetime) }} · {{ t.plate }} · {{ t.facility }}</p>
      </div>
      <div class="toolbar">
        <button
          v-if="t.entervoStatus === 'Retrying' || t.entervoStatus === 'Not sent'"
          class="btn-sm primary"
          type="button"
          @click="admin.resend(t.id)"
        >Re-send to entervo</button>
        <button
          v-if="t.paymentStatus === 'Captured'"
          class="btn-sm"
          type="button"
          @click="openRefund = true"
        >Request refund</button>
      </div>
    </div>

    <div class="metrics">
      <div class="metric">
        <div class="meta-k">Amount</div>
        <div class="amount-fig" style="font-size:28px">{{ money(t.amount) }}</div>
      </div>
      <div class="metric">
        <div class="meta-k">Payment (PowerTranz)</div>
        <div style="margin-top:8px"><span class="status" :class="payClass(t.paymentStatus)">{{ t.paymentStatus }}</span></div>
      </div>
      <div class="metric">
        <div class="meta-k">entervo</div>
        <div style="margin-top:8px"><span class="status" :class="entervoClass(t.entervoStatus)">{{ t.entervoStatus }}</span></div>
      </div>
    </div>

    <div class="card card-pad" style="margin-bottom:16px">
      <div class="meta-grid" style="padding:0">
        <div><div class="meta-k">Date / time</div><div class="meta-v">{{ formatDateTime(t.datetime) }}</div></div>
        <div><div class="meta-k">SkyPark reference</div><div class="meta-v mono">{{ t.ref }}</div></div>
        <div><div class="meta-k">PowerTranz transaction id</div><div class="meta-v mono">{{ t.transactionId }}</div></div>
        <div><div class="meta-k">Card used</div><div class="meta-v mono">{{ t.cardMasked }}</div></div>
        <div><div class="meta-k">Token</div><div class="meta-v mono">{{ t.cardToken }}</div></div>
        <div><div class="meta-k">Brand / method</div><div class="meta-v">{{ t.cardBrand }} · {{ t.method }}</div></div>
        <div><div class="meta-k">Customer</div><div class="meta-v">{{ t.customer }}</div></div>
        <div><div class="meta-k">Validation</div><div class="meta-v">{{ t.validation }}</div></div>
      </div>
    </div>

    <h2 style="font:700 18px var(--font);margin:0 0 8px">Auth / Capture timeline</h2>
    <p class="lede" style="margin:0 0 12px">PowerTranz Sale/Auth then Capture, including 3DS2 and any IsoResponse errors.</p>
    <div class="card card-pad">
      <ol class="timeline">
        <li v-for="(row, i) in t.timeline" :key="i" class="timeline-row">
          <span class="timeline-time">{{ formatTime(row.at) }}</span>
          <span class="timeline-req" :class="statusDot(row.status)">{{ row.request }}</span>
          <span class="timeline-msg">
            <strong>{{ row.step }}</strong>
            <span v-if="row.iso"> · ISO {{ row.iso }}</span>
            <div style="color:var(--muted)">{{ row.message }}</div>
          </span>
          <span class="timeline-lat">{{ row.latencyMs != null ? row.latencyMs + ' ms' : '' }}</span>
        </li>
      </ol>
    </div>

    <div v-if="t.errors.length" class="alert alert-bad" style="display:block;margin-top:16px">
      <div style="font:600 14px var(--font);color:var(--red-ink);margin-bottom:8px">Errors received</div>
      <div v-for="(err, i) in t.errors" :key="i" style="font:400 13px/1.5 var(--font);color:var(--red-ink)">
        {{ formatTime(err.at) }} · {{ err.request }}{{ err.iso ? ' · ISO ' + err.iso : '' }}: {{ err.message }}
      </div>
    </div>

    <div class="card card-pad" style="margin-top:16px">
      <div class="meta-k">Refund</div>
      <div v-if="t.refund.status === 'none'" class="meta-v" style="margin-top:6px">No refund on this sale.</div>
      <div v-else class="meta-grid" style="padding:10px 0 0">
        <div><div class="meta-k">Status</div><div class="meta-v">{{ t.refund.status }}</div></div>
        <div><div class="meta-k">Amount</div><div class="meta-v mono">{{ money(t.refund.amount) }}</div></div>
        <div><div class="meta-k">Requested by</div><div class="meta-v">{{ t.refund.requestedBy }}</div></div>
        <div><div class="meta-k">Confirmed by</div><div class="meta-v">{{ t.refund.confirmedBy || '-' }}</div></div>
        <div><div class="meta-k">Reason</div><div class="meta-v">{{ t.refund.reason || '-' }}</div></div>
      </div>
      <div v-if="t.refund.status === 'pending_admin'" class="toolbar" style="margin-top:14px">
        <button class="btn-sm primary" type="button" @click="confirmOpen = true">Confirm refund</button>
        <button class="btn-sm" type="button" @click="admin.rejectRefund(t.id)">Reject</button>
      </div>
    </div>
  </div>
  <p v-else>Transaction not found.</p>

  <div v-if="openRefund && t" class="modal-scrim" @click.self="openRefund = false">
    <div class="modal-card">
      <h2 style="margin:0 0 8px;font:700 20px var(--font)">Request refund</h2>
      <p class="lede">Admin still has to confirm before PowerTranz Refund is sent.</p>
      <div class="meta-v mono" style="margin:12px 0">{{ money(t.amount) }} · {{ t.cardMasked }}</div>
      <input class="input-text" v-model="reason" placeholder="Reason" />
      <div class="toolbar" style="margin-top:14px">
        <button class="btn-sm primary" type="button" @click="request">Submit for confirmation</button>
        <button class="btn-sm" type="button" @click="openRefund = false">Cancel</button>
      </div>
    </div>
  </div>

  <div v-if="confirmOpen && t" class="modal-scrim" @click.self="confirmOpen = false">
    <div class="modal-card">
      <h2 style="margin:0 0 8px;font:700 20px var(--font)">Confirm refund</h2>
      <p class="lede">This sends a PowerTranz Refund against transaction {{ t.transactionId }} for {{ money(t.amount) }} on {{ t.cardMasked }}.</p>
      <div class="toolbar" style="margin-top:14px">
        <button class="btn-sm primary" type="button" @click="confirm">Confirm and refund</button>
        <button class="btn-sm" type="button" @click="confirmOpen = false">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { formatDateTime, formatTime, money } from '@/lib/format'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
const route = useRoute()
const t = computed(() => admin.findTxn(route.params.id))
const openRefund = ref(false)
const confirmOpen = ref(false)
const reason = ref('')

function request() {
  admin.requestRefund(t.value.id, {
    requestedBy: admin.operator,
    reason: reason.value || 'Operator-initiated',
    actorType: 'admin',
  })
  openRefund.value = false
}

function confirm() {
  admin.confirmRefund(t.value.id)
  confirmOpen.value = false
}

function payClass(status) {
  if (status === 'Captured') return 'status-captured'
  if (status === 'Declined') return 'status-declined'
  if (status === 'Refunded') return 'status-refunded'
  if (status === 'Refund pending') return 'status-retrying'
  return 'status-empty'
}

function entervoClass(status) {
  if (status === 'Posted') return 'status-posted'
  if (status === 'Retrying') return 'status-retrying'
  if (status === 'Not sent') return 'status-notsent'
  return 'status-empty'
}

function statusDot(status) {
  if (status === 'ok') return 'dot-ok'
  if (status === 'error') return 'dot-err'
  if (status === 'skipped') return 'dot-skip'
  return 'dot-sent'
}
</script>
