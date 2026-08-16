import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  CUSTOMERS,
  FACILITIES,
  ORGANISATIONS,
  ORG_USERS,
  SEED_TRANSACTIONS,
  VALIDATION_RULES,
  validationDetail,
} from '@/data/mock'
import { isSameDay, nowIso } from '@/lib/format'
import { appendRefundTimeline, emptyRefund, timelineErrors } from '@/lib/powertranz'
import { useActivityStore } from '@/stores/activity'

export const useAdminStore = defineStore('admin', () => {
  const transactions = ref(SEED_TRANSACTIONS.map((t) => ({
    ...t,
    refund: { ...t.refund },
    timeline: t.timeline.map((s) => ({ ...s })),
    errors: t.errors.map((e) => ({ ...e })),
  })))
  const customers = ref(CUSTOMERS.map((c) => ({
    ...c,
    vehicles: [...c.vehicles],
    cards: (c.cards || []).map((card) => ({ ...card })),
  })))
  const organisations = ref(ORGANISATIONS.map((o) => ({ ...o })))
  const orgUsers = ref(ORG_USERS.map((u) => ({ ...u })))
  const validationRules = ref(VALIDATION_RULES.map((v) => ({ ...v })))
  const facilities = ref(FACILITIES.map((f) => ({ ...f })))
  const operator = ref('SkyGrid operations')

  function log(partial) {
    useActivityStore().record({
      actorType: 'admin',
      actor: operator.value,
      ...partial,
    })
  }

  const collectedToday = computed(() =>
    transactions.value
      .filter((t) => isSameDay(t.datetime) && t.paymentStatus === 'Captured')
      .reduce((sum, t) => sum + t.amount, 0),
  )

  const transactionCountToday = computed(
    () => transactions.value.filter((t) => isSameDay(t.datetime)).length,
  )

  const validatedToday = computed(
    () => transactions.value.filter((t) => isSameDay(t.datetime) && t.validation !== '-').length,
  )

  const failedToday = computed(
    () =>
      transactions.value.filter(
        (t) =>
          isSameDay(t.datetime) &&
          (t.paymentStatus === 'Declined' || t.entervoStatus === 'Retrying' || t.entervoStatus === 'Not sent'),
      ).length,
  )

  const stuck = computed(() =>
    transactions.value.filter((t) => t.entervoStatus === 'Retrying' || t.entervoStatus === 'Not sent'),
  )

  const pendingRefunds = computed(() =>
    transactions.value.filter((t) => t.refund?.status === 'pending_admin'),
  )

  function findTxn(id) {
    return transactions.value.find((t) => t.id === id || t.ref === id)
  }

  function upsertFromPayment(payload) {
    const row = {
      id: payload.ref,
      ref: payload.ref,
      transactionId: payload.transactionId,
      datetime: payload.datetime || nowIso(),
      plate: payload.plate,
      amount: payload.amount,
      method: payload.method,
      cardMasked: payload.cardMasked || '-',
      cardToken: payload.cardToken || '-',
      cardBrand: payload.cardBrand || '-',
      paymentStatus: payload.paymentStatus || 'Captured',
      entervoStatus: payload.entervoStatus || (payload.entervo === 'ok' ? 'Posted' : payload.paymentStatus === 'Declined' ? '-' : 'Retrying'),
      facility: payload.facility,
      customer: payload.customer,
      customerId: payload.customerId || null,
      validation: payload.validation || '-',
      refund: emptyRefund(),
      timeline: payload.timeline || [],
      errors: payload.errors || timelineErrors(payload.timeline || []),
    }
    transactions.value = [row, ...transactions.value.filter((t) => t.ref !== payload.ref)]
  }

  function resend(id) {
    const row = findTxn(id)
    if (!row) return
    row.entervoStatus = 'Posted'
    row.timeline = [
      ...row.timeline,
      {
        at: nowIso(),
        request: 'entervo',
        step: 'Payment notify retry',
        iso: null,
        status: 'ok',
        latencyMs: 88,
        message: 'Re-sent by operator, posted',
      },
    ]
    row.errors = timelineErrors(row.timeline)
    log({
      action: 'Re-sent payment notification to entervo',
      category: 'admin',
      detail: `${row.ref} · ${row.plate}`,
      ref: row.ref,
      plate: row.plate,
      customerId: row.customerId,
    })
  }

  function requestRefund(id, { requestedBy, reason, actorType = 'customer', customerId }) {
    const row = findTxn(id)
    if (!row || row.paymentStatus !== 'Captured') return false
    row.paymentStatus = 'Refund pending'
    row.refund = {
      status: 'pending_admin',
      amount: row.amount,
      requestedBy,
      requestedAt: nowIso(),
      confirmedBy: null,
      confirmedAt: null,
      reason: reason || '',
      decision: null,
    }
    useActivityStore().record({
      actorType,
      actor: requestedBy,
      action: 'Refund requested',
      category: 'refund',
      detail: reason || `Awaiting admin confirmation · ${row.cardMasked}`,
      ref: row.ref,
      plate: row.plate,
      customerId: customerId || row.customerId,
    })
    return true
  }

  function confirmRefund(id) {
    const row = findTxn(id)
    if (!row || row.refund?.status !== 'pending_admin') return false
    const at = nowIso()
    row.refund.status = 'completed'
    row.refund.confirmedBy = operator.value
    row.refund.confirmedAt = at
    row.refund.decision = 'approved'
    row.paymentStatus = 'Refunded'
    row.timeline = appendRefundTimeline(row.timeline, { startedAt: at, approved: true })
    row.errors = timelineErrors(row.timeline)
    log({
      action: 'Refund confirmed',
      category: 'refund',
      detail: `PowerTranz Refund IsoResponse 00 · $${row.amount.toFixed(2)} · ${row.cardMasked}`,
      ref: row.ref,
      plate: row.plate,
      customerId: row.customerId,
    })
    return true
  }

  function rejectRefund(id, reason = 'Not eligible') {
    const row = findTxn(id)
    if (!row || row.refund?.status !== 'pending_admin') return false
    const at = nowIso()
    row.refund.status = 'rejected'
    row.refund.confirmedBy = operator.value
    row.refund.confirmedAt = at
    row.refund.decision = 'rejected'
    row.refund.reason = reason
    row.paymentStatus = 'Captured'
    row.timeline = appendRefundTimeline(row.timeline, { startedAt: at, approved: false })
    log({
      action: 'Refund rejected',
      category: 'refund',
      detail: reason,
      ref: row.ref,
      plate: row.plate,
      customerId: row.customerId,
    })
    return true
  }

  function toggleFacilityLpr(id) {
    const facility = facilities.value.find((f) => f.id === id)
    if (!facility) return
    facility.lpr = !facility.lpr
    log({
      action: 'Updated facility capability',
      category: 'admin',
      detail: `${facility.name} · pay by plate ${facility.lpr ? 'enabled' : 'disabled'}`,
    })
  }

  function syncCustomerCards(customerId, cards) {
    const c = customers.value.find((row) => row.id === customerId)
    if (c) c.cards = cards.map((card) => ({ ...card }))
  }

  function syncCustomerCredit(customerId, credit) {
    const c = customers.value.find((row) => row.id === customerId)
    if (c) c.credit = credit
  }

  function makeId(prefix) {
    return `${prefix}-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 6)}`
  }

  function makeCode(type) {
    const prefixes = { Tenant: 'SKY', Merchant: 'FC', 'Staff group': 'OPS' }
    const prefix = prefixes[type] || 'ORG'
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let tail = ''
    for (let i = 0; i < 4; i++) tail += chars[Math.floor(Math.random() * chars.length)]
    return `${prefix}-${tail}`
  }

  function cloneOrgFields(payload) {
    return {
      name: (payload.name || '').trim(),
      suite: (payload.suite || '').trim(),
      type: payload.type || 'Tenant',
      status: payload.status || 'Active',
      contactName: (payload.contactName || '').trim(),
      contactEmail: (payload.contactEmail || '').trim(),
      contactPhone: (payload.contactPhone || '').trim(),
      address: (payload.address || '').trim(),
    }
  }

  function usersFor(orgId) {
    return orgUsers.value
      .filter((u) => u.orgId === orgId)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  function orgStats(orgId) {
    const users = usersFor(orgId)
    return {
      users: users.length,
      vehicles: users.filter((u) => u.plate).length,
      codes: users.filter((u) => u.code).length,
      onSite: users.filter((u) => u.lastEntry && (!u.lastExit || u.lastEntry > u.lastExit)).length,
    }
  }

  function createOrganisation(payload) {
    const fields = cloneOrgFields(payload)
    if (!fields.name) return null
    const org = { id: makeId('org'), ...fields }
    organisations.value = [org, ...organisations.value]
    log({
      action: 'Created organisation',
      category: 'admin',
      detail: `${org.name} · ${org.type}`,
      orgId: org.id,
    })
    return org
  }

  function updateOrganisation(id, payload) {
    const org = organisations.value.find((row) => row.id === id)
    if (!org) return null
    Object.assign(org, cloneOrgFields({ ...org, ...payload }))
    log({
      action: 'Updated organisation',
      category: 'admin',
      detail: `${org.name} · ${org.contactName || 'no contact'}`,
      orgId: org.id,
    })
    return org
  }

  function deleteOrganisation(id) {
    const org = organisations.value.find((row) => row.id === id)
    if (!org) return false
    organisations.value = organisations.value.filter((row) => row.id !== id)
    orgUsers.value = orgUsers.value.filter((u) => u.orgId !== id)
    log({
      action: 'Deleted organisation',
      category: 'admin',
      detail: org.name,
      orgId: id,
    })
    return true
  }

  function createOrgUser(orgId, payload) {
    const org = organisations.value.find((row) => row.id === orgId)
    if (!org) return null
    const name = (payload.name || '').trim()
    if (!name) return null
    const user = {
      id: makeId('ou'),
      orgId,
      name,
      role: (payload.role || '').trim(),
      email: (payload.email || '').trim(),
      phone: (payload.phone || '').trim(),
      plate: (payload.plate || '').trim(),
      code: (payload.code || '').trim() || makeCode(org.type),
      uses: 0,
      status: payload.status || 'Active',
      lastValidated: null,
      lastEntry: null,
      lastExit: null,
    }
    orgUsers.value = [...orgUsers.value, user]
    log({
      action: 'Added organisation user',
      category: 'admin',
      detail: `${user.name} · ${org.name} · ${user.code}`,
      orgId,
      orgUserId: user.id,
    })
    return user
  }

  function updateOrgUser(id, payload) {
    const user = orgUsers.value.find((row) => row.id === id)
    if (!user) return null
    user.name = (payload.name || user.name).trim()
    user.role = (payload.role ?? user.role).trim()
    user.email = (payload.email ?? user.email).trim()
    user.phone = (payload.phone ?? user.phone).trim()
    user.plate = (payload.plate ?? user.plate).trim()
    user.code = (payload.code ?? user.code).trim()
    user.status = payload.status || user.status
    log({
      action: 'Updated organisation user',
      category: 'admin',
      detail: `${user.name} · ${user.code}`,
      orgId: user.orgId,
      orgUserId: user.id,
    })
    return user
  }

  function deleteOrgUser(id) {
    const user = orgUsers.value.find((row) => row.id === id)
    if (!user) return false
    orgUsers.value = orgUsers.value.filter((row) => row.id !== id)
    log({
      action: 'Removed organisation user',
      category: 'admin',
      detail: `${user.name} · ${user.code}`,
      orgId: user.orgId,
      orgUserId: user.id,
    })
    return true
  }

  function orgLabel(orgId) {
    const org = organisations.value.find((row) => row.id === orgId)
    if (!org) return '—'
    return org.suite ? `${org.name} · ${org.suite}` : org.name
  }

  function cloneValidationFields(payload) {
    const type = payload.type || 'Free time'
    const value = Number(payload.value)
    const capLimit = payload.capLimit === '' || payload.capLimit == null ? null : Number(payload.capLimit)
    return {
      orgId: payload.orgId || '',
      type,
      value: Number.isFinite(value) ? value : 0,
      facility: (payload.facility || 'All SkyPark').trim() || 'All SkyPark',
      capLimit: Number.isFinite(capLimit) && capLimit > 0 ? capLimit : null,
    }
  }

  function ruleSummary(rule) {
    return `${orgLabel(rule.orgId)} · ${validationDetail(rule.type, rule.value)} · ${rule.facility}`
  }

  function createValidation(payload) {
    const fields = cloneValidationFields(payload)
    if (!fields.orgId || !fields.value) return null
    const rule = { id: makeId('v'), uses: 0, ...fields }
    validationRules.value = [rule, ...validationRules.value]
    log({
      action: 'Created validation',
      category: 'admin',
      detail: ruleSummary(rule),
      orgId: rule.orgId,
    })
    return rule
  }

  function updateValidation(id, payload) {
    const rule = validationRules.value.find((row) => row.id === id)
    if (!rule) return null
    Object.assign(rule, cloneValidationFields({ ...rule, ...payload }))
    log({
      action: 'Updated validation',
      category: 'admin',
      detail: ruleSummary(rule),
      orgId: rule.orgId,
    })
    return rule
  }

  function deleteValidation(id) {
    const rule = validationRules.value.find((row) => row.id === id)
    if (!rule) return false
    validationRules.value = validationRules.value.filter((row) => row.id !== id)
    log({
      action: 'Deleted validation',
      category: 'admin',
      detail: ruleSummary(rule),
      orgId: rule.orgId,
    })
    return true
  }

  return {
    transactions,
    customers,
    organisations,
    orgUsers,
    validationRules,
    facilities,
    operator,
    usersFor,
    orgStats,
    createOrganisation,
    updateOrganisation,
    deleteOrganisation,
    createOrgUser,
    updateOrgUser,
    deleteOrgUser,
    orgLabel,
    createValidation,
    updateValidation,
    deleteValidation,
    collectedToday,
    transactionCountToday,
    validatedToday,
    failedToday,
    stuck,
    pendingRefunds,
    findTxn,
    upsertFromPayment,
    resend,
    requestRefund,
    confirmRefund,
    rejectRefund,
    toggleFacilityLpr,
    syncCustomerCards,
    syncCustomerCredit,
    log,
  }
})
