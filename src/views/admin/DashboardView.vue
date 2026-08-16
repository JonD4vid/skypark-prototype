<template>
  <div>
    <div class="admin-top">
      <div>
        <h1>Dashboard</h1>
        <p class="lede" style="margin-top:6px">Today's parking payments. Failed and unposted rows are the ones to act on.</p>
      </div>
      <div class="tiny" style="text-align:right">{{ admin.operator }}</div>
    </div>

    <div class="metrics">
      <div class="metric">
        <div class="meta-k">Collected today</div>
        <div class="amount-fig" style="font-size:28px">{{ money(admin.collectedToday) }}</div>
      </div>
      <div class="metric">
        <div class="meta-k">Transactions</div>
        <div class="amount-fig" style="font-size:28px">{{ admin.transactionCountToday }}</div>
      </div>
      <div class="metric">
        <div class="meta-k">Validated</div>
        <div class="amount-fig" style="font-size:28px">{{ admin.validatedToday }}</div>
      </div>
      <div class="metric danger">
        <div class="meta-k">Failed / unposted</div>
        <div class="amount-fig" style="font-size:28px;color:var(--red)">{{ admin.failedToday }}</div>
      </div>
    </div>

    <h2 style="font:700 18px var(--font);margin:22px 0 10px">Refunds waiting for confirmation</h2>
    <p class="lede" style="margin:0 0 12px">A PowerTranz Refund is only sent after an operator confirms.</p>
    <div class="table-wrap" style="margin-bottom:22px">
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Card</th>
            <th>Amount</th>
            <th>Requested by</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!admin.pendingRefunds.length">
            <td colspan="5" style="color:var(--muted)">No pending refunds.</td>
          </tr>
          <tr v-for="t in admin.pendingRefunds" :key="t.id">
            <td class="mono">{{ t.ref }}</td>
            <td class="mono">{{ t.cardMasked }}</td>
            <td class="mono">{{ money(t.amount) }}</td>
            <td>{{ t.refund.requestedBy }}</td>
            <td><router-link :to="'/admin/refunds'">Review</router-link></td>
          </tr>
        </tbody>
      </table>
    </div>
    <h2 style="font:700 18px var(--font);margin:0 0 10px">Stuck at barrier</h2>
    <p class="lede" style="margin:0 0 12px">Payment captured by PowerTranz, but entervo has not accepted the notification. These vehicles may be waiting at an exit.</p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Plate</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>entervo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!admin.stuck.length">
            <td colspan="6" style="color:var(--muted)">No unposted payments right now.</td>
          </tr>
          <tr v-for="t in admin.stuck" :key="t.id">
            <td class="mono">{{ t.ref }}</td>
            <td class="mono">{{ t.plate }}</td>
            <td class="mono">{{ money(t.amount) }}</td>
            <td><span class="status status-captured">{{ t.paymentStatus }}</span></td>
            <td><span class="status" :class="entervoClass(t.entervoStatus)">{{ t.entervoStatus }}</span></td>
            <td><router-link :to="'/admin/transactions/' + t.id">Open</router-link></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { money } from '@/lib/format'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()

function entervoClass(status) {
  if (status === 'Posted') return 'status-posted'
  if (status === 'Retrying') return 'status-retrying'
  if (status === 'Not sent') return 'status-notsent'
  return 'status-empty'
}
</script>
