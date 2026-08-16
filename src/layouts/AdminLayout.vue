<template>
  <div class="admin-app">
    <header class="admin-bar">
      <button
        class="admin-menu-btn"
        type="button"
        :aria-expanded="open"
        aria-controls="admin-nav"
        aria-label="Open menu"
        @click="open = true"
      >
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
          <path d="M1 1h16M1 7h16M1 13h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <div>
        <div class="admin-bar-brand">SkyPark <span>Ops</span></div>
        <div class="admin-bar-page">{{ currentLabel }}</div>
      </div>
    </header>

    <div v-if="open" class="admin-scrim" @click="open = false"></div>

    <aside
      id="admin-nav"
      class="admin-nav"
      :class="{ open }"
      :inert="isMobile && !open"
    >
      <div class="admin-nav-head">
        <router-link to="/admin" class="admin-brand" @click="open = false">
          <span class="brand-name" style="color:#fff">SkyPark</span>
          <span class="brand-pay">Ops</span>
        </router-link>
        <button class="admin-nav-close" type="button" aria-label="Close menu" @click="open = false">✕</button>
      </div>
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="admin-link"
        :class="{ 'router-link-active': isActive(item) }"
        active-class=""
        exact-active-class=""
      >
        <span>{{ item.label }}</span>
        <span v-if="item.badge && stuckCount" class="badge">{{ stuckCount }}</span>
        <span v-else-if="item.refunds && refundCount" class="badge">{{ refundCount }}</span>
      </router-link>
      <div class="grow"></div>
      <router-link to="/" class="admin-link">Customer pay →</router-link>
    </aside>
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
const route = useRoute()
const stuckCount = computed(() => admin.stuck.length)
const refundCount = computed(() => admin.pendingRefunds.length)
const open = ref(false)
const isMobile = ref(false)

const items = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/transactions', label: 'Transactions', badge: true },
  { to: '/admin/refunds', label: 'Refunds', refunds: true },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/organisations', label: 'Organisations' },
  { to: '/admin/validations', label: 'Validations' },
  { to: '/admin/credit', label: 'Credit balances' },
  { to: '/admin/audit', label: 'Activity log' },
  { to: '/admin/config', label: 'Configuration' },
]

function isActive(item) {
  if (item.end) return route.path === item.to
  return route.path === item.to || route.path.startsWith(item.to + '/')
}

const currentLabel = computed(() => {
  const match = [...items].reverse().find((item) => isActive(item))
  return match?.label || 'Ops'
})

watch(() => route.fullPath, () => {
  open.value = false
})

watch(open, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})

function onKey(e) {
  if (e.key === 'Escape') open.value = false
}

let mql
function applyViewport() {
  isMobile.value = mql.matches
  if (!mql.matches) open.value = false
}

onMounted(() => {
  mql = window.matchMedia('(max-width: 860px)')
  applyViewport()
  mql.addEventListener('change', applyViewport)
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  mql?.removeEventListener('change', applyViewport)
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>
