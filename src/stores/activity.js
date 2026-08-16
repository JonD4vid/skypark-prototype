import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { nowIso } from '@/lib/format'
import { SEED_ACTIVITY } from '@/data/mock'

export const useActivityStore = defineStore('activity', () => {
  const events = ref(SEED_ACTIVITY.map((e) => ({ ...e })))

  function record(partial) {
    events.value = [
      {
        id: 'log_' + Date.now() + '_' + Math.random().toString(16).slice(2, 6),
        at: partial.at || nowIso(),
        actorType: partial.actorType || 'system',
        actor: partial.actor || 'System',
        action: partial.action,
        category: partial.category || 'system',
        outcome: partial.outcome || 'ok',
        detail: partial.detail || '',
        ref: partial.ref || null,
        plate: partial.plate || null,
        customerId: partial.customerId || null,
        orgId: partial.orgId || null,
        orgUserId: partial.orgUserId || null,
        method: partial.method || null,
        cardMasked: partial.cardMasked || null,
        cardBrand: partial.cardBrand || null,
        tokenized: !!partial.tokenized,
        amount: partial.amount ?? null,
      },
      ...events.value,
    ]
  }

  const byCustomer = computed(() => (id) => events.value.filter((e) => e.customerId === id))
  const byOrg = computed(() => (id) => events.value.filter((e) => e.orgId === id))
  const byOrgUser = computed(() => (id) => events.value.filter((e) => e.orgUserId === id))

  return { events, record, byCustomer, byOrg, byOrgUser }
})
