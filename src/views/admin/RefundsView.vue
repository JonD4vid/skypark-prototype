<template>
  <div>
    <div class="admin-top">
      <div>
        <h1>Refunds</h1>
        <p class="lede" style="margin-top:6px">Refunds wait for operator confirmation before a PowerTranz Refund is sent.</p>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date / time</th>
            <th>Reference</th>
            <th>Card</th>
            <th>Amount</th>
            <th>Requested by</th>
            <th>Reason</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!admin.pendingRefunds.length">
            <td colspan="7" style="color:var(--muted)">No refunds waiting for confirmation.</td>
          </tr>
          <tr v-for="t in admin.pendingRefunds" :key="t.id">
            <td style="white-space:nowrap">{{ formatDateTime(t.datetime) }}</td>
            <td class="mono">{{ t.ref }}</td>
            <td class="mono">{{ t.cardMasked }}</td>
            <td class="mono">{{ money(t.amount) }}</td>
            <td>{{ t.refund.requestedBy }}</td>
            <td>{{ t.refund.reason }}</td>
            <td>
              <div class="toolbar">
                <button class="btn-sm primary" type="button" @click="admin.confirmRefund(t.id)">Confirm</button>
                <button class="btn-sm" type="button" @click="admin.rejectRefund(t.id)">Reject</button>
                <router-link class="btn-sm" :to="'/admin/transactions/' + t.id">Detail</router-link>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { formatDateTime, money } from '@/lib/format'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
</script>
