<template>
  <div>
    <div class="admin-top">
      <div>
        <h1>Activity log</h1>
        <p class="lede" style="margin-top:6px">Every customer and admin action: cards, payments, check-in/out, scans, refunds, and configuration.</p>
      </div>
    </div>

    <div class="filters">
      <input class="search" v-model="q" placeholder="Search action, actor, plate, reference" />
      <button class="pill-btn" :class="{ on: actor === 'all' }" type="button" @click="actor = 'all'">All actors</button>
      <button class="pill-btn" :class="{ on: actor === 'customer' }" type="button" @click="actor = 'customer'">Customer</button>
      <button class="pill-btn" :class="{ on: actor === 'org' }" type="button" @click="actor = 'org'">Organisation</button>
      <button class="pill-btn" :class="{ on: actor === 'admin' }" type="button" @click="actor = 'admin'">Admin</button>
      <button class="pill-btn" :class="{ on: actor === 'system' }" type="button" @click="actor = 'system'">System</button>
      <button class="pill-btn" :class="{ on: outcome === 'fail' }" type="button" @click="outcome = outcome === 'fail' ? 'all' : 'fail'">Failures</button>
    </div>
    <div class="filters">
      <button v-for="c in categories" :key="c" class="pill-btn" :class="{ on: category === c }" type="button" @click="category = c">{{ c }}</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date / time</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Result</th>
            <th>Detail</th>
            <th>Ref</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in rows" :key="e.id">
            <td style="white-space:nowrap;color:var(--muted)">{{ formatDateTime(e.at) }}</td>
            <td>
              <div>{{ e.actor }}</div>
              <div style="font-size:12px;color:var(--subtle)">{{ e.actorType }}</div>
            </td>
            <td>{{ e.action }}</td>
            <td :class="e.outcome === 'fail' ? 'log-fail' : 'log-ok'">{{ e.outcome }}</td>
            <td>{{ e.detail }}</td>
            <td class="mono">{{ e.ref || e.plate || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { formatDateTime } from '@/lib/format'
import { useActivityStore } from '@/stores/activity'

const activity = useActivityStore()
const q = ref('')
const actor = ref('all')
const category = ref('all')
const outcome = ref('all')
const categories = ['all', 'payment', 'card', 'session', 'scan', 'refund', 'validation', 'account', 'admin']

const rows = computed(() =>
  activity.events.filter((e) => {
    if (actor.value !== 'all' && e.actorType !== actor.value) return false
    if (category.value !== 'all' && e.category !== category.value) return false
    if (outcome.value !== 'all' && e.outcome !== outcome.value) return false
    const hay = `${e.action} ${e.actor} ${e.detail} ${e.ref || ''} ${e.plate || ''}`.toLowerCase()
    return !q.value || hay.includes(q.value.toLowerCase())
  }),
)
</script>
