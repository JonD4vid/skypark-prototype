<template>
  <div>
    <div class="admin-top">
      <div>
        <h1>Customers</h1>
        <p class="lede" style="margin-top:6px">Lookup by plate, email, phone, or masked card. Cards are tokenized. Full PAN is never stored.</p>
      </div>
    </div>
    <input class="search" style="margin-bottom:14px;max-width:420px" v-model="q" placeholder="Plate, email, phone, name, card" />
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Contact</th>
            <th>Saved vehicles</th>
            <th>Tokenized cards</th>
            <th>Prepaid credit</th>
            <th>Visits</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in rows" :key="c.id" style="cursor:pointer" @click="$router.push('/admin/customers/' + c.id)">
            <td>
              <div style="font:600 14px var(--font)">{{ c.name }}</div>
            </td>
            <td>
              <div>{{ c.email }}</div>
              <div style="color:var(--muted);font-size:12.5px">{{ c.phone }}</div>
            </td>
            <td class="mono">{{ c.vehicles.join(' · ') }}</td>
            <td class="mono">{{ (c.cards || []).map((card) => card.masked).join(' · ') || '-' }}</td>
            <td class="mono">{{ money(c.credit) }}</td>
            <td>{{ c.visits }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { money } from '@/lib/format'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
const q = ref('')
const rows = computed(() => {
  const needle = q.value.toLowerCase()
  return admin.customers.filter((c) =>
    `${c.name} ${c.email} ${c.phone} ${c.vehicles.join(' ')} ${(c.cards || []).map((card) => card.masked).join(' ')}`.toLowerCase().includes(needle),
  )
})
</script>
