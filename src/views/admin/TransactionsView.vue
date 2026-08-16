<template>
  <div>
    <div class="admin-top">
      <div>
        <h1>Transactions</h1>
        <p class="lede" style="margin-top:6px">Each row is a PowerTranz sale. Payment status and entervo status are separate events.</p>
      </div>
      <div class="toolbar">
        <button class="btn-sm" type="button" @click="exportCsv">Export CSV</button>
      </div>
    </div>

    <div class="filters">
      <input class="search" v-model="q" placeholder="Search plate, reference, card, transaction id" />
      <button class="pill-btn" :class="{ on: entervoFilter === 'all' }" type="button" @click="entervoFilter = 'all'">All</button>
      <button class="pill-btn" :class="{ on: entervoFilter === 'Posted' }" type="button" @click="entervoFilter = 'Posted'">Posted</button>
      <button class="pill-btn" :class="{ on: entervoFilter === 'Retrying' }" type="button" @click="entervoFilter = 'Retrying'">Retrying</button>
      <button class="pill-btn" :class="{ on: entervoFilter === 'Not sent' }" type="button" @click="entervoFilter = 'Not sent'">Not sent</button>
      <button class="pill-btn" :class="{ on: payFilter === 'Declined' }" type="button" @click="payFilter = payFilter === 'Declined' ? 'all' : 'Declined'">Declined</button>
      <button class="pill-btn" :class="{ on: payFilter === 'Refund pending' }" type="button" @click="payFilter = payFilter === 'Refund pending' ? 'all' : 'Refund pending'">Refund pending</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date / time</th>
            <th>Reference</th>
            <th>Transaction id</th>
            <th>Plate</th>
            <th>Card</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>entervo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in rows" :key="t.id" style="cursor:pointer" @click="$router.push('/admin/transactions/' + t.id)">
            <td style="white-space:nowrap;color:var(--muted)">{{ formatDateTime(t.datetime) }}</td>
            <td class="mono">{{ t.ref }}</td>
            <td class="mono" style="font-size:12px">{{ t.transactionId }}</td>
            <td class="mono">{{ t.plate }}</td>
            <td class="mono">{{ t.cardMasked }}</td>
            <td class="mono">{{ money(t.amount) }}</td>
            <td><span class="status" :class="payClass(t.paymentStatus)">{{ t.paymentStatus }}</span></td>
            <td><span class="status" :class="entervoClass(t.entervoStatus)">{{ t.entervoStatus }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { formatDateTime, money } from '@/lib/format'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
const q = ref('')
const entervoFilter = ref('all')
const payFilter = ref('all')

const rows = computed(() =>
  admin.transactions.filter((t) => {
    const hay = `${t.ref} ${t.plate} ${t.customer} ${t.cardMasked} ${t.transactionId}`.toLowerCase()
    if (q.value && !hay.includes(q.value.toLowerCase())) return false
    if (entervoFilter.value !== 'all' && t.entervoStatus !== entervoFilter.value) return false
    if (payFilter.value !== 'all' && t.paymentStatus !== payFilter.value) return false
    return true
  }),
)

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

function exportCsv() {
  const header = ['Datetime', 'Reference', 'Transaction id', 'Plate', 'Card', 'Amount', 'Payment status', 'entervo status', 'Facility']
  const lines = [header.join(','), ...rows.value.map((t) =>
    [t.datetime, t.ref, t.transactionId, t.plate, t.cardMasked, t.amount.toFixed(2), t.paymentStatus, t.entervoStatus, t.facility].join(','),
  )]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'skypark-transactions.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>
