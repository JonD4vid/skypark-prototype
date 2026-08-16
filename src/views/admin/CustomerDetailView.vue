<template>
  <div v-if="c">
    <button class="back-btn" type="button" @click="$router.push('/admin/customers')">‹ Customers</button>
    <h1>{{ c.name }}</h1>
    <p class="lede" style="margin-top:6px">{{ c.email }} · {{ c.phone }}</p>

    <div class="metrics" style="margin-top:18px">
      <div class="metric">
        <div class="meta-k">Prepaid credit</div>
        <div class="amount-fig" style="font-size:24px">{{ money(c.credit) }}</div>
      </div>
      <div class="metric">
        <div class="meta-k">Vehicles</div>
        <div class="meta-v mono" style="margin-top:8px">{{ c.vehicles.join(' · ') }}</div>
      </div>
      <div class="metric">
        <div class="meta-k">Visits</div>
        <div class="amount-fig" style="font-size:24px">{{ c.visits }}</div>
      </div>
    </div>

    <h2 style="font:700 18px var(--font);margin:8px 0 10px">Tokenized cards</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Masked PAN</th>
            <th>Brand</th>
            <th>Expiry</th>
            <th>PowerTranz token</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!(c.cards || []).length">
            <td colspan="5" style="color:var(--muted)">No tokenized cards.</td>
          </tr>
          <tr v-for="card in c.cards" :key="card.id">
            <td class="mono">{{ card.masked }}</td>
            <td>{{ card.brand }}</td>
            <td class="mono">{{ card.exp }}</td>
            <td class="mono">{{ card.token }}</td>
            <td>{{ card.default ? 'Default' : '' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 style="font:700 18px var(--font);margin:22px 0 10px">Activity</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date / time</th>
            <th>Action</th>
            <th>Result</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in logs" :key="e.id">
            <td style="white-space:nowrap;color:var(--muted)">{{ formatDateTime(e.at) }}</td>
            <td>{{ e.action }}</td>
            <td :class="e.outcome === 'fail' ? 'log-fail' : 'log-ok'">{{ e.outcome }}</td>
            <td>{{ e.detail }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { formatDateTime, money } from '@/lib/format'
import { useActivityStore } from '@/stores/activity'
import { useAdminStore } from '@/stores/admin'

const route = useRoute()
const admin = useAdminStore()
const activity = useActivityStore()
const c = computed(() => admin.customers.find((row) => row.id === route.params.id))
const logs = computed(() => activity.events.filter((e) => e.customerId === route.params.id))
</script>
