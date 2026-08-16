<template>
  <div>
    <div class="admin-top">
      <div>
        <h1>Credit balances</h1>
        <p class="lede" style="margin-top:6px">Prepaid credit is a stored-value liability. This view is for reconciliation, not just display.</p>
      </div>
      <div class="metric" style="min-width:200px">
        <div class="meta-k">Outstanding liability</div>
        <div class="amount-fig" style="font-size:24px">{{ money(total) }}</div>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Email</th>
            <th>Balance</th>
            <th>Vehicles</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in withCredit" :key="c.id">
            <td>{{ c.name }}</td>
            <td>{{ c.email }}</td>
            <td class="mono">{{ money(c.credit) }}</td>
            <td class="mono">{{ c.vehicles.join(' · ') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { money } from '@/lib/format'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
const withCredit = computed(() => admin.customers.filter((c) => c.credit > 0))
const total = computed(() => withCredit.value.reduce((sum, c) => sum + c.credit, 0))
</script>
