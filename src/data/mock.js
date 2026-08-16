import {
  appendRefundTimeline,
  buildGatewayTimeline,
  emptyRefund,
  timelineErrors,
} from '@/lib/powertranz'

export const FACILITY = {
  id: 'level-2-west',
  name: 'SkyPark · Level 2 west',
  shortName: 'Level 2 west',
  lpr: true,
  exitWindowMin: 15,
  tariff: 'Standard hourly',
  entered: 'Today, 10:42 am',
  duration: '2 h 06 m',
  ticket: '0042 8871 22',
  paidUpTo: '12:48 pm, then exit within 15 min',
}

export const BASE_AMOUNT = 42

export const VALIDATION_RESULTS = {
  freetime: {
    benefit: '2 hours free applied',
    org: 'Anchor tenant · Suite 300',
    total: 18,
    summary: '2 hours free · Anchor tenant',
  },
  percent: {
    benefit: '50% off applied',
    org: 'Retail merchant · Food court',
    total: 21,
    summary: '50% off · Retail merchant',
  },
  fixed: {
    benefit: '$20.00 credit applied',
    org: 'Retail merchant · Food court',
    total: 22,
    summary: '$20.00 credit · Retail merchant',
  },
  zero: {
    benefit: 'Parking fully covered',
    org: 'Anchor tenant · Suite 300',
    total: 0,
    summary: 'Fully validated · Anchor tenant',
  },
}

export const VALIDATION_ERRORS = {
  invalid: "That code isn't recognised. Check it and try again.",
  expired: 'This code has expired. Ask the issuer for a new one.',
  used: 'This code has already been used.',
  wrongfacility: "This code isn't valid at this facility.",
  limit: 'This code has reached its usage limit.',
}

export const PAYMENT_ERRORS = {
  declined: [
    'Payment declined',
    'Your bank declined this payment. Try another card, or pay at the pay station.',
  ],
  insufficient: [
    'Payment declined',
    "There aren't enough funds on this card. Try another card.",
  ],
  threeds: [
    'Verification not completed',
    "Your bank's confirmation step wasn't completed. Nothing was charged. Try again.",
  ],
  timeout: [
    'Payment timed out',
    "We didn't get a response in time. Check your messages or history before paying again; you may already have paid.",
  ],
  gateway: [
    'Payment service unavailable',
    "The payment service isn't responding. Nothing was charged. Try again shortly, or use the pay station.",
  ],
}

export const MULTI_SESSIONS = [
  {
    id: 'level-2-west',
    facility: 'SkyPark · Level 2 west',
    entered: 'today, 10:42 am',
    amount: 42,
  },
  {
    id: 'airport-b',
    facility: 'SkyPark · Airport lot B',
    entered: 'today, 6:15 am',
    amount: 96,
  },
]

export const DEFAULT_HISTORY = [
  {
    id: 'h-t1',
    where: 'SkyPark · Level 2 west',
    when: 'Today · 2 h 06 m',
    amount: 18,
    ref: 'SP-88214',
    method: 'Tokenized card',
    cardMasked: '41112xxxxxxx456',
    cardBrand: 'Visa',
    tokenized: true,
    status: 'Captured',
    plate: 'PDE 1234',
  },
  {
    id: 'h-t2',
    where: 'SkyPark · Level 2 west',
    when: 'Today · 1 h 48 m',
    amount: 42,
    ref: 'SP-88215',
    method: 'Apple Pay',
    cardMasked: 'Wallet · Apple Pay',
    cardBrand: 'Apple Pay',
    tokenized: false,
    status: 'Refund pending',
    plate: 'HBM 882',
  },
  {
    id: 'h-t5',
    where: 'SkyPark · Airport lot B',
    when: 'Today · 4 h 10 m',
    amount: 21,
    ref: 'SP-88204',
    method: 'Prepaid credit',
    cardMasked: 'Prepaid credit',
    cardBrand: '-',
    tokenized: false,
    status: 'Captured',
    plate: 'PDE 1234',
  },
  {
    id: 'h-t6',
    where: 'SkyPark · Airport lot B',
    when: 'Yesterday · 6 h 05 m',
    amount: 96,
    ref: 'SP-88190',
    method: 'Tokenized card',
    cardMasked: '41112xxxxxxx456',
    cardBrand: 'Visa',
    tokenized: true,
    status: 'Refunded',
    plate: 'HBM 882',
  },
  {
    id: 'h1',
    where: 'SkyPark · Level 2 west',
    when: 'Mon 10 Aug · 1 h 20 m',
    amount: 28,
    ref: 'SP-88102',
    method: 'Google Pay',
    cardMasked: 'Wallet · Google Pay',
    cardBrand: 'Google Pay',
    tokenized: false,
    status: 'Captured',
    plate: 'PDE 1234',
  },
  {
    id: 'h3',
    where: 'SkyPark · Harbour mall',
    when: 'Thu 6 Aug · 2 h 45 m',
    amount: 34,
    ref: 'SP-88061',
    method: 'Tokenized card',
    cardMasked: '54545xxxxxxx321',
    cardBrand: 'Mastercard',
    tokenized: true,
    status: 'Captured',
    plate: 'HBM 882',
  },
  {
    id: 'h2',
    where: 'SkyPark · Airport lot B',
    when: 'Fri 31 Jul · 6 h 05 m',
    amount: 96,
    ref: 'SP-87944',
    method: 'Card',
    cardMasked: '40000xxxxxxx188',
    cardBrand: 'Visa',
    tokenized: false,
    status: 'Captured',
    plate: 'HBM 882',
  },
]

export const DEFAULT_VEHICLES = [
  { plate: 'PDE 1234', label: 'Family SUV' },
  { plate: 'HBM 882', label: 'Work car' },
]

export const FACILITIES = [
  { id: 'level-2-west', name: 'SkyPark · Level 2 west', lpr: true, active: true, exitWindowMin: 15 },
  { id: 'airport-b', name: 'SkyPark · Airport lot B', lpr: true, active: true, exitWindowMin: 15 },
  { id: 'harbour', name: 'SkyPark · Harbour mall', lpr: false, active: true, exitWindowMin: 20 },
]

export const ORG_TYPES = ['Tenant', 'Merchant', 'Staff group']

function hoursAgo(hours, minutes = 0, seconds = 0) {
  const d = new Date()
  d.setHours(d.getHours() - hours, minutes, seconds, 120)
  return d
}

export const ORGANISATIONS = [
  {
    id: 'org-anchor',
    name: 'Anchor tenant',
    suite: 'Suite 300',
    type: 'Tenant',
    status: 'Active',
    contactName: 'Maya Singh',
    contactEmail: 'maya.singh@anchor.tt',
    contactPhone: '(868) 555 3100',
    address: 'Suite 300, One Woodbrook Place, Port of Spain',
  },
  {
    id: 'org-food',
    name: 'Retail merchant',
    suite: 'Food court',
    type: 'Merchant',
    status: 'Active',
    contactName: 'Priya Mohammed',
    contactEmail: 'priya@foodcourt.tt',
    contactPhone: '(868) 555 2288',
    address: 'Food court, Harbour mall, Port of Spain',
  },
  {
    id: 'org-ops',
    name: 'Staff permits',
    suite: 'Operations',
    type: 'Staff group',
    status: 'Active',
    contactName: 'Kareem Ali',
    contactEmail: 'kareem.ali@skygrid.tt',
    contactPhone: '(868) 555 1001',
    address: 'Operations, SkyPark, Piarco International Airport',
  },
]

export const ORG_USERS = [
  {
    id: 'ou-anchor-1',
    orgId: 'org-anchor',
    name: 'Maya Singh',
    role: 'Reception',
    email: 'maya.singh@anchor.tt',
    phone: '(868) 555 3101',
    plate: 'PCU 214',
    code: 'SKY-4TXQ',
    uses: 14,
    status: 'Active',
    lastValidated: hoursAgo(0, 13).toISOString(),
    lastEntry: hoursAgo(0, 14).toISOString(),
    lastExit: hoursAgo(0, 2).toISOString(),
  },
  {
    id: 'ou-anchor-2',
    orgId: 'org-anchor',
    name: 'Joel Ramdeen',
    role: 'Facilities',
    email: 'joel.ramdeen@anchor.tt',
    phone: '(868) 555 3102',
    plate: 'HBM 441',
    code: 'SKY-9KLP',
    uses: 6,
    status: 'Active',
    lastValidated: hoursAgo(20, 10).toISOString(),
    lastEntry: hoursAgo(20, 12).toISOString(),
    lastExit: hoursAgo(18, 40).toISOString(),
  },
  {
    id: 'ou-anchor-3',
    orgId: 'org-anchor',
    name: 'Alicia Khan',
    role: 'Front desk',
    email: 'alicia.khan@anchor.tt',
    phone: '(868) 555 3103',
    plate: 'PDE 908',
    code: 'SKY-2NWR',
    uses: 21,
    status: 'Active',
    lastValidated: hoursAgo(26, 5).toISOString(),
    lastEntry: hoursAgo(26, 8).toISOString(),
    lastExit: hoursAgo(24, 50).toISOString(),
  },
  {
    id: 'ou-food-1',
    orgId: 'org-food',
    name: 'Priya Mohammed',
    role: 'Shift lead',
    email: 'priya@foodcourt.tt',
    phone: '(868) 555 2288',
    plate: 'TAJ 220',
    code: 'FC-18QK',
    uses: 40,
    status: 'Active',
    lastValidated: hoursAgo(3, 20).toISOString(),
    lastEntry: hoursAgo(8, 5).toISOString(),
    lastExit: hoursAgo(3, 18).toISOString(),
  },
  {
    id: 'ou-food-2',
    orgId: 'org-food',
    name: 'Daniel Chen',
    role: 'Cashier',
    email: 'daniel.chen@foodcourt.tt',
    phone: '(868) 555 2290',
    plate: 'PCU 118',
    code: 'FC-33AB',
    uses: 12,
    status: 'Active',
    lastValidated: null,
    lastEntry: hoursAgo(2, 40).toISOString(),
    lastExit: null,
  },
  {
    id: 'ou-ops-1',
    orgId: 'org-ops',
    name: 'Kareem Ali',
    role: 'Supervisor',
    email: 'kareem.ali@skygrid.tt',
    phone: '(868) 555 1001',
    plate: 'OPS 1104',
    code: 'OPS-1104',
    uses: 2,
    status: 'Active',
    lastValidated: hoursAgo(6, 0).toISOString(),
    lastEntry: hoursAgo(7, 15).toISOString(),
    lastExit: hoursAgo(1, 5).toISOString(),
  },
  {
    id: 'ou-ops-2',
    orgId: 'org-ops',
    name: 'Shanice Brown',
    role: 'Attendant',
    email: 'shanice.brown@skygrid.tt',
    phone: '(868) 555 1005',
    plate: 'OPS 1105',
    code: 'OPS-1105',
    uses: 0,
    status: 'Active',
    lastValidated: null,
    lastEntry: null,
    lastExit: null,
  },
]

export const VALIDATION_TYPES = ['Free time', 'Percentage', 'Fixed value']

export const VALIDATION_RULES = [
  { id: 'v1', orgId: 'org-anchor', type: 'Free time', value: 2, facility: 'All SkyPark', uses: 128, capLimit: null },
  { id: 'v2', orgId: 'org-food', type: 'Percentage', value: 50, facility: 'Level 2 west', uses: 64, capLimit: 200 },
  { id: 'v3', orgId: 'org-food', type: 'Fixed value', value: 20, facility: 'Level 2 west', uses: 19, capLimit: 50 },
]

export function validationDetail(type, value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return ''
  if (type === 'Free time') return `${n} hour${n === 1 ? '' : 's'} free`
  if (type === 'Percentage') return `${n}% off total`
  if (type === 'Fixed value') return `$${n.toFixed(2)} credit`
  return ''
}

export function validationCap(capLimit) {
  return capLimit ? `${capLimit} / month` : 'Unlimited'
}

export const DEFAULT_CARDS = [
  {
    id: 'card1',
    token: 'ptz_tok_8f21a9c4',
    masked: '41112xxxxxxx456',
    brand: 'Visa',
    exp: '08/28',
    last4: '456',
    default: true,
  },
  {
    id: 'card2',
    token: 'ptz_tok_1b77e012',
    masked: '54545xxxxxxx321',
    brand: 'Mastercard',
    exp: '01/27',
    last4: '4321',
    default: false,
  },
]

export const CUSTOMERS = [
  {
    id: 'c1',
    name: 'Duree Arthur',
    email: 'duree@skygrid.tt',
    phone: '(868) 555 4402',
    credit: 65,
    vehicles: ['PDE 1234', 'HBM 882'],
    cards: DEFAULT_CARDS.map((c) => ({ ...c })),
    visits: 18,
  },
  {
    id: 'c2',
    name: 'Guest',
    email: '-',
    phone: '(868) 555 0198',
    credit: 0,
    vehicles: ['TAJ 4411'],
    cards: [],
    visits: 1,
  },
  {
    id: 'c3',
    name: 'Ravi Persad',
    email: 'ravi.p@example.tt',
    phone: '(868) 555 7721',
    credit: 120,
    vehicles: ['PCU 900'],
    cards: [
      {
        id: 'card3',
        token: 'ptz_tok_c9aa4410',
        masked: '40000xxxxxxx002',
        brand: 'Visa',
        exp: '11/26',
        last4: '0002',
        default: true,
      },
    ],
    visits: 9,
  },
]

function seedTxn(partial) {
  const {
    gatewayOutcome = 'approved',
    entervo = 'Posted',
    refundPending = false,
    datetime,
    ...rest
  } = partial
  const started = new Date(datetime)
  started.setSeconds(started.getSeconds() - 2)
  const timeline = buildGatewayTimeline({
    startedAt: started.toISOString(),
    outcome: gatewayOutcome,
    entervo: entervo === 'Posted' ? 'ok' : entervo === '-' ? 'ok' : 'failed',
  })
  let refund = emptyRefund()
  let finalTimeline = timeline
  if (rest.paymentStatus === 'Refunded') {
    const refundAt = new Date(datetime)
    refundAt.setHours(refundAt.getHours() + 2)
    refund = {
      status: 'completed',
      amount: rest.amount,
      requestedBy: rest.customer,
      requestedAt: new Date(datetime).toISOString(),
      confirmedBy: 'SkyGrid operations',
      confirmedAt: refundAt.toISOString(),
      reason: 'Duplicate session charge',
      decision: 'approved',
    }
    finalTimeline = appendRefundTimeline(timeline, { startedAt: refundAt.toISOString(), approved: true })
  } else if (refundPending) {
    refund = {
      status: 'pending_admin',
      amount: rest.amount,
      requestedBy: rest.customer,
      requestedAt: new Date(datetime).toISOString(),
      confirmedBy: null,
      confirmedAt: null,
      reason: 'Customer requested refund after early exit',
      decision: null,
    }
  }
  return {
    method: 'Tokenized card',
    cardMasked: '41112xxxxxxx456',
    cardToken: 'ptz_tok_8f21a9c4',
    cardBrand: 'Visa',
    validation: '-',
    customerId: 'c1',
    refund,
    timeline: finalTimeline,
    errors: timelineErrors(finalTimeline),
    ...rest,
    datetime: typeof datetime === 'string' ? datetime : datetime.toISOString(),
  }
}

const t1at = hoursAgo(0, 12)
const t2at = hoursAgo(0, 19)
const t3at = hoursAgo(0, 38)
const t4at = hoursAgo(1, 2)
const t5at = hoursAgo(2, 55)
const t6at = hoursAgo(22, 40)

export const SEED_TRANSACTIONS = [
  seedTxn({
    id: 't1',
    ref: 'SP-88214',
    transactionId: 'a8c21e0b-4d55-4e1a-9c44-0f7b1d2a88e1',
    datetime: t1at,
    plate: 'PDE 1234',
    amount: 18,
    paymentStatus: 'Captured',
    entervoStatus: 'Posted',
    facility: 'Level 2 west',
    customer: 'Duree Arthur',
    validation: '2 hours free',
    gatewayOutcome: 'approved',
    entervo: 'Posted',
  }),
  seedTxn({
    id: 't2',
    ref: 'SP-88215',
    transactionId: 'b91f03c4-77aa-41c0-8d12-55e09c1b4402',
    datetime: t2at,
    plate: 'HBM 882',
    amount: 42,
    method: 'Wallet',
    cardMasked: 'Wallet · Apple Pay',
    cardToken: '-',
    cardBrand: 'Apple Pay',
    paymentStatus: 'Refund pending',
    entervoStatus: 'Retrying',
    facility: 'Level 2 west',
    customer: 'Duree Arthur',
    refundPending: true,
    gatewayOutcome: 'approved',
    entervo: 'Retrying',
  }),
  seedTxn({
    id: 't3',
    ref: 'SP-88216',
    transactionId: 'c0d44ab1-12f0-4aa1-b77e-91c3d8e01566',
    datetime: t3at,
    plate: 'TAJ 4411',
    amount: 28,
    method: 'Card',
    cardMasked: '40000xxxxxxx188',
    cardToken: 'ptz_tok_guest188',
    cardBrand: 'Visa',
    paymentStatus: 'Captured',
    entervoStatus: 'Not sent',
    facility: 'Harbour mall',
    customer: 'Guest',
    customerId: 'c2',
    gatewayOutcome: 'approved',
    entervo: 'Not sent',
  }),
  seedTxn({
    id: 't4',
    ref: 'SP-88210',
    transactionId: 'd17e90aa-6b21-40de-9a11-cc84f00291ab',
    datetime: t4at,
    plate: 'PCU 900',
    amount: 42,
    cardMasked: '40000xxxxxxx002',
    cardToken: 'ptz_tok_c9aa4410',
    paymentStatus: 'Declined',
    entervoStatus: '-',
    facility: 'Level 2 west',
    customer: 'Ravi Persad',
    customerId: 'c3',
    gatewayOutcome: 'declined',
    entervo: '-',
  }),
  seedTxn({
    id: 't5',
    ref: 'SP-88204',
    transactionId: 'e2aa11c0-88b4-4f01-a9c3-17d44b90ee21',
    datetime: t5at,
    plate: 'PDE 1234',
    amount: 21,
    method: 'Prepaid credit',
    cardMasked: 'Prepaid credit',
    cardToken: '-',
    cardBrand: '-',
    paymentStatus: 'Captured',
    entervoStatus: 'Posted',
    facility: 'Airport lot B',
    customer: 'Duree Arthur',
    validation: '50% off',
    gatewayOutcome: 'approved',
    entervo: 'Posted',
  }),
  seedTxn({
    id: 't6',
    ref: 'SP-88190',
    transactionId: 'f33b2201-09c8-4aa2-b410-88e21d77c901',
    datetime: t6at,
    plate: 'HBM 882',
    amount: 96,
    cardMasked: '41112xxxxxxx456',
    paymentStatus: 'Refunded',
    entervoStatus: 'Posted',
    facility: 'Airport lot B',
    customer: 'Duree Arthur',
    gatewayOutcome: 'approved',
    entervo: 'Posted',
  }),
]

function logAt(hours, minutes, extra) {
  const d = hoursAgo(hours, minutes)
  return {
    id: extra.id,
    at: d.toISOString(),
    actorType: extra.actorType,
    actor: extra.actor,
    action: extra.action,
    category: extra.category,
    outcome: extra.outcome || 'ok',
    detail: extra.detail,
    ref: extra.ref || null,
    plate: extra.plate || null,
    customerId: extra.customerId || null,
    orgId: extra.orgId || null,
    orgUserId: extra.orgUserId || null,
    method: extra.method || null,
    cardMasked: extra.cardMasked || null,
    cardBrand: extra.cardBrand || null,
    tokenized: !!extra.tokenized,
    amount: extra.amount ?? null,
  }
}

export const SEED_ACTIVITY = [
  logAt(0, 12, { id: 'a1', actorType: 'customer', actor: 'Duree Arthur', action: 'Payment captured', category: 'payment', detail: 'Tokenized Visa · 41112xxxxxxx456 · $18.00', ref: 'SP-88214', plate: 'PDE 1234', customerId: 'c1', method: 'Tokenized card', cardMasked: '41112xxxxxxx456', cardBrand: 'Visa', tokenized: true }),
  logAt(0, 12, { id: 'a1b', actorType: 'customer', actor: 'Duree Arthur', action: 'Check-out authorised', category: 'session', detail: 'Level 2 west · exit window 15 min', ref: 'SP-88214', plate: 'PDE 1234', customerId: 'c1' }),
  logAt(0, 13, { id: 'a1c', actorType: 'customer', actor: 'Duree Arthur', action: 'Validation applied', category: 'validation', detail: 'SKY-4TXQ · 2 hours free · Anchor tenant', ref: 'SP-88214', plate: 'PDE 1234', customerId: 'c1', orgId: 'org-anchor', orgUserId: 'ou-anchor-1' }),
  logAt(0, 14, { id: 'a1d', actorType: 'customer', actor: 'Duree Arthur', action: 'Check-in', category: 'session', detail: 'Session found · Level 2 west · entered 10:42 am', plate: 'PDE 1234', customerId: 'c1' }),
  logAt(0, 19, { id: 'a2', actorType: 'customer', actor: 'Duree Arthur', action: 'Refund requested', category: 'refund', detail: 'Awaiting admin confirmation', ref: 'SP-88215', plate: 'HBM 882', customerId: 'c1', method: 'Apple Pay', cardMasked: 'Wallet · Apple Pay', cardBrand: 'Apple Pay' }),
  logAt(0, 19, { id: 'a2p', actorType: 'customer', actor: 'Duree Arthur', action: 'Payment captured', category: 'payment', detail: 'Apple Pay · $42.00', ref: 'SP-88215', plate: 'HBM 882', customerId: 'c1', method: 'Apple Pay', cardMasked: 'Wallet · Apple Pay', cardBrand: 'Apple Pay' }),
  logAt(0, 19, { id: 'a2b', actorType: 'system', actor: 'System', action: 'entervo notification retry', category: 'payment', outcome: 'fail', detail: 'Payment captured, parking system not yet posted', ref: 'SP-88215', plate: 'HBM 882', customerId: 'c1' }),
  logAt(2, 5, { id: 'a2d', actorType: 'customer', actor: 'Duree Arthur', action: 'Check-in', category: 'session', detail: 'Session found · Level 2 west · HBM 882', plate: 'HBM 882', customerId: 'c1' }),
  logAt(0, 38, { id: 'a3', actorType: 'system', actor: 'System', action: 'Payment captured, notification not sent', category: 'payment', outcome: 'fail', detail: 'Harbour mall · 40000xxxxxxx188', ref: 'SP-88216', plate: 'TAJ 4411', customerId: 'c2' }),
  logAt(1, 2, { id: 'a4', actorType: 'customer', actor: 'Ravi Persad', action: 'Payment declined', category: 'payment', outcome: 'fail', detail: 'Auth IsoResponse 05: do not honor', ref: 'SP-88210', plate: 'PCU 900', customerId: 'c3' }),
  logAt(1, 3, { id: 'a4b', actorType: 'customer', actor: 'Ravi Persad', action: 'Check-in', category: 'session', detail: 'Session found · Level 2 west', plate: 'PCU 900', customerId: 'c3' }),
  logAt(2, 10, { id: 'a5', actorType: 'customer', actor: 'Duree Arthur', action: 'Card added', category: 'card', detail: 'Tokenized Visa 54545xxxxxxx321', customerId: 'c1' }),
  logAt(2, 55, { id: 'a6', actorType: 'customer', actor: 'Duree Arthur', action: 'Payment captured', category: 'payment', detail: 'Prepaid credit · $21.00', ref: 'SP-88204', plate: 'PDE 1234', customerId: 'c1', method: 'Prepaid credit', cardMasked: 'Prepaid credit', cardBrand: '-' }),
  logAt(2, 56, { id: 'a6b', actorType: 'customer', actor: 'Duree Arthur', action: 'Check-out authorised', category: 'session', detail: 'Airport lot B · exit window 15 min', ref: 'SP-88204', plate: 'PDE 1234', customerId: 'c1' }),
  logAt(7, 5, { id: 'a6d', actorType: 'customer', actor: 'Duree Arthur', action: 'Check-in', category: 'session', detail: 'Session found · Airport lot B', plate: 'PDE 1234', customerId: 'c1' }),
  logAt(3, 0, { id: 'a7', actorType: 'customer', actor: 'Guest', action: 'Scan failed', category: 'scan', outcome: 'fail', detail: 'Barcode unreadable · Code 128' }),
  logAt(3, 1, { id: 'a7b', actorType: 'customer', actor: 'Guest', action: 'Scan succeeded', category: 'scan', detail: 'Ticket 0042 8871 22 read from barcode' }),
  logAt(20, 15, { id: 'a8', actorType: 'admin', actor: 'SkyGrid operations', action: 'Refund confirmed', category: 'refund', detail: 'PowerTranz Refund IsoResponse 00 · $96.00', ref: 'SP-88190', plate: 'HBM 882', customerId: 'c1', method: 'Tokenized card', cardMasked: '41112xxxxxxx456', cardBrand: 'Visa', tokenized: true }),
  logAt(21, 40, { id: 'a9', actorType: 'admin', actor: 'SkyGrid operations', action: 'Re-sent payment notification to entervo', category: 'admin', detail: 'SP-88190 · HBM 882', ref: 'SP-88190', plate: 'HBM 882' }),
  logAt(22, 0, { id: 'a10', actorType: 'customer', actor: 'Duree Arthur', action: 'Refund requested', category: 'refund', detail: 'Duplicate session charge', ref: 'SP-88190', plate: 'HBM 882', customerId: 'c1', method: 'Tokenized card', cardMasked: '41112xxxxxxx456', cardBrand: 'Visa', tokenized: true }),
  logAt(22, 40, { id: 'a10p', actorType: 'customer', actor: 'Duree Arthur', action: 'Payment captured', category: 'payment', detail: 'Tokenized Visa · 41112xxxxxxx456 · $96.00', ref: 'SP-88190', plate: 'HBM 882', customerId: 'c1', method: 'Tokenized card', cardMasked: '41112xxxxxxx456', cardBrand: 'Visa', tokenized: true }),
  logAt(22, 38, { id: 'a10b', actorType: 'customer', actor: 'Duree Arthur', action: 'Check-out authorised', category: 'session', detail: 'Airport lot B · exit window 15 min', ref: 'SP-88190', plate: 'HBM 882', customerId: 'c1' }),
  logAt(28, 45, { id: 'a10d', actorType: 'customer', actor: 'Duree Arthur', action: 'Check-in', category: 'session', detail: 'Session found · Airport lot B', plate: 'HBM 882', customerId: 'c1' }),
  logAt(26, 12, { id: 'a11', actorType: 'customer', actor: 'Duree Arthur', action: 'Card removed', category: 'card', detail: 'Removed token for 40000xxxxxxx188', customerId: 'c1' }),
  logAt(120, 10, { id: 'a13b', actorType: 'customer', actor: 'Duree Arthur', action: 'Check-out authorised', category: 'session', detail: 'Level 2 west · exit window 15 min', ref: 'SP-88102', plate: 'PDE 1234', customerId: 'c1' }),
  logAt(120, 12, { id: 'a13', actorType: 'customer', actor: 'Duree Arthur', action: 'Payment captured', category: 'payment', detail: 'Google Pay · $28.00', ref: 'SP-88102', plate: 'PDE 1234', customerId: 'c1', method: 'Google Pay', cardMasked: 'Wallet · Google Pay', cardBrand: 'Google Pay' }),
  logAt(121, 32, { id: 'a13d', actorType: 'customer', actor: 'Duree Arthur', action: 'Check-in', category: 'session', detail: 'Session found · Level 2 west', plate: 'PDE 1234', customerId: 'c1' }),
  logAt(216, 5, { id: 'a14b', actorType: 'customer', actor: 'Duree Arthur', action: 'Check-out authorised', category: 'session', detail: 'Harbour mall · exit window 20 min', ref: 'SP-88061', plate: 'HBM 882', customerId: 'c1' }),
  logAt(216, 8, { id: 'a14', actorType: 'customer', actor: 'Duree Arthur', action: 'Payment captured', category: 'payment', detail: 'Tokenized Mastercard · 54545xxxxxxx321 · $34.00', ref: 'SP-88061', plate: 'HBM 882', customerId: 'c1', method: 'Tokenized card', cardMasked: '54545xxxxxxx321', cardBrand: 'Mastercard', tokenized: true }),
  logAt(218, 53, { id: 'a14d', actorType: 'customer', actor: 'Duree Arthur', action: 'Check-in', category: 'session', detail: 'Session found · Harbour mall', plate: 'HBM 882', customerId: 'c1' }),
  logAt(360, 8, { id: 'a15b', actorType: 'customer', actor: 'Duree Arthur', action: 'Check-out authorised', category: 'session', detail: 'Airport lot B · exit window 15 min', ref: 'SP-87944', plate: 'HBM 882', customerId: 'c1' }),
  logAt(360, 10, { id: 'a15', actorType: 'customer', actor: 'Duree Arthur', action: 'Payment captured', category: 'payment', detail: 'Visa · 40000xxxxxxx188 · $96.00', ref: 'SP-87944', plate: 'HBM 882', customerId: 'c1', method: 'Card', cardMasked: '40000xxxxxxx188', cardBrand: 'Visa' }),
  logAt(366, 15, { id: 'a15d', actorType: 'customer', actor: 'Duree Arthur', action: 'Check-in', category: 'session', detail: 'Session found · Airport lot B', plate: 'HBM 882', customerId: 'c1' }),
  logAt(30, 0, { id: 'a12', actorType: 'org', actor: 'Maya Singh', action: 'Issued validation SKY-4TXQ', category: 'validation', detail: 'Anchor tenant · Suite 300', orgId: 'org-anchor', orgUserId: 'ou-anchor-1' }),
  logAt(0, 2, { id: 'o1x', actorType: 'org', actor: 'Maya Singh', action: 'Check-out', category: 'session', detail: 'Level 2 west · PCU 214 · 2 h 12 m', plate: 'PCU 214', orgId: 'org-anchor', orgUserId: 'ou-anchor-1' }),
  logAt(0, 13, { id: 'o1v', actorType: 'org', actor: 'Maya Singh', action: 'Validated', category: 'validation', detail: 'SKY-4TXQ · 2 hours free · tenant permit', plate: 'PCU 214', orgId: 'org-anchor', orgUserId: 'ou-anchor-1' }),
  logAt(0, 14, { id: 'o1e', actorType: 'org', actor: 'Maya Singh', action: 'Check-in', category: 'session', detail: 'Level 2 west · PCU 214', plate: 'PCU 214', orgId: 'org-anchor', orgUserId: 'ou-anchor-1' }),
  logAt(18, 40, { id: 'o2x', actorType: 'org', actor: 'Joel Ramdeen', action: 'Check-out', category: 'session', detail: 'Airport lot B · HBM 441 · 1 h 32 m', plate: 'HBM 441', orgId: 'org-anchor', orgUserId: 'ou-anchor-2' }),
  logAt(20, 10, { id: 'o2v', actorType: 'org', actor: 'Joel Ramdeen', action: 'Validated', category: 'validation', detail: 'SKY-9KLP · 2 hours free · tenant permit', plate: 'HBM 441', orgId: 'org-anchor', orgUserId: 'ou-anchor-2' }),
  logAt(20, 12, { id: 'o2e', actorType: 'org', actor: 'Joel Ramdeen', action: 'Check-in', category: 'session', detail: 'Airport lot B · HBM 441', plate: 'HBM 441', orgId: 'org-anchor', orgUserId: 'ou-anchor-2' }),
  logAt(24, 50, { id: 'o3x', actorType: 'org', actor: 'Alicia Khan', action: 'Check-out', category: 'session', detail: 'Level 2 west · PDE 908 · 1 h 18 m', plate: 'PDE 908', orgId: 'org-anchor', orgUserId: 'ou-anchor-3' }),
  logAt(26, 5, { id: 'o3v', actorType: 'org', actor: 'Alicia Khan', action: 'Validated', category: 'validation', detail: 'SKY-2NWR · 2 hours free · tenant permit', plate: 'PDE 908', orgId: 'org-anchor', orgUserId: 'ou-anchor-3' }),
  logAt(26, 8, { id: 'o3e', actorType: 'org', actor: 'Alicia Khan', action: 'Check-in', category: 'session', detail: 'Level 2 west · PDE 908', plate: 'PDE 908', orgId: 'org-anchor', orgUserId: 'ou-anchor-3' }),
  logAt(3, 18, { id: 'o4x', actorType: 'org', actor: 'Priya Mohammed', action: 'Check-out', category: 'session', detail: 'Harbour mall · TAJ 220 · 4 h 47 m', plate: 'TAJ 220', orgId: 'org-food', orgUserId: 'ou-food-1' }),
  logAt(3, 20, { id: 'o4v', actorType: 'org', actor: 'Priya Mohammed', action: 'Validated', category: 'validation', detail: 'FC-18QK · 50% off · merchant staff', plate: 'TAJ 220', orgId: 'org-food', orgUserId: 'ou-food-1' }),
  logAt(8, 5, { id: 'o4e', actorType: 'org', actor: 'Priya Mohammed', action: 'Check-in', category: 'session', detail: 'Harbour mall · TAJ 220', plate: 'TAJ 220', orgId: 'org-food', orgUserId: 'ou-food-1' }),
  logAt(2, 40, { id: 'o5e', actorType: 'org', actor: 'Daniel Chen', action: 'Check-in', category: 'session', detail: 'Harbour mall · PCU 118 · on site', plate: 'PCU 118', orgId: 'org-food', orgUserId: 'ou-food-2' }),
  logAt(1, 5, { id: 'o6x', actorType: 'org', actor: 'Kareem Ali', action: 'Check-out', category: 'session', detail: 'Level 2 west · OPS 1104 · 6 h 10 m', plate: 'OPS 1104', orgId: 'org-ops', orgUserId: 'ou-ops-1' }),
  logAt(6, 0, { id: 'o6v', actorType: 'org', actor: 'Kareem Ali', action: 'Validated', category: 'validation', detail: 'OPS-1104 · staff permit', plate: 'OPS 1104', orgId: 'org-ops', orgUserId: 'ou-ops-1' }),
  logAt(7, 15, { id: 'o6e', actorType: 'org', actor: 'Kareem Ali', action: 'Check-in', category: 'session', detail: 'Level 2 west · OPS 1104', plate: 'OPS 1104', orgId: 'org-ops', orgUserId: 'ou-ops-1' }),
]

export const AUDIT = SEED_ACTIVITY
