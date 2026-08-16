/** Mock PowerTranz helpers. Full PAN never persists after tokenize. */

export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '')
}

export function maskPan(pan) {
  const d = digitsOnly(pan)
  if (d.length < 8) return 'xxxxx'
  const start = d.slice(0, 5)
  const end = d.slice(-3)
  return `${start}${'x'.repeat(Math.max(6, d.length - 8))}${end}`
}

export function cardBrand(pan) {
  const d = digitsOnly(pan)
  if (d.startsWith('4')) return 'Visa'
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return 'Mastercard'
  if (/^3[47]/.test(d)) return 'Amex'
  return 'Card'
}

export function newToken() {
  return 'ptz_tok_' + Math.random().toString(16).slice(2, 10)
}

export function newTransactionId() {
  const hex = () => Math.random().toString(16).slice(2).padEnd(8, '0').slice(0, 8)
  return `${hex()}-${hex().slice(0, 4)}-4${hex().slice(0, 3)}-${hex().slice(0, 4)}-${hex()}${hex().slice(0, 4)}`
}

export function tokenizeCard(pan, exp = '12/28') {
  const masked = maskPan(pan)
  const d = digitsOnly(pan)
  return {
    id: 'card_' + Math.random().toString(16).slice(2, 8),
    token: newToken(),
    masked,
    brand: cardBrand(pan),
    exp,
    last4: d.slice(-4),
    default: false,
  }
}

function step(atMs, payload) {
  return {
    at: new Date(atMs).toISOString(),
    request: payload.request,
    step: payload.step,
    iso: payload.iso ?? null,
    status: payload.status,
    latencyMs: payload.latencyMs ?? null,
    message: payload.message,
  }
}

export function buildGatewayTimeline({ startedAt, outcome = 'approved', entervo = 'ok' }) {
  const t0 = new Date(startedAt).getTime()
  const rows = []
  const add = (offset, payload) => rows.push(step(t0 + offset, payload))

  add(0, {
    request: 'Auth',
    step: 'Auth request',
    status: 'sent',
    message: 'PowerTranz Auth submitted (card-not-present, 3DS2)',
  })

  if (outcome === 'declined') {
    add(240, { request: 'Auth', step: 'Auth response', iso: '05', status: 'error', latencyMs: 240, message: 'Declined: do not honor (05)' })
    add(241, { request: 'Capture', step: 'Capture', status: 'skipped', message: 'Capture not sent: auth failed' })
    return rows
  }
  if (outcome === 'insufficient') {
    add(210, { request: 'Auth', step: 'Auth response', iso: '51', status: 'error', latencyMs: 210, message: 'Insufficient funds (51)' })
    add(211, { request: 'Capture', step: 'Capture', status: 'skipped', message: 'Capture not sent: auth failed' })
    return rows
  }
  if (outcome === 'threeds') {
    add(160, { request: 'Auth', step: 'Auth response', iso: '00', status: 'ok', latencyMs: 160, message: 'Auth held pending 3DS2' })
    add(980, { request: '3DS2', step: '3DS2 challenge', status: 'error', latencyMs: 820, message: 'Issuer challenge not completed. Nothing captured' })
    add(981, { request: 'Capture', step: 'Capture', status: 'skipped', message: 'Capture not sent: 3DS2 abandoned' })
    return rows
  }
  if (outcome === 'timeout') {
    add(30000, { request: 'Auth', step: 'Auth response', status: 'error', latencyMs: 30000, message: 'No IsoResponseCode: gateway timeout' })
    add(30001, { request: 'Capture', step: 'Capture', status: 'skipped', message: 'Capture not sent: auth timed out' })
    return rows
  }
  if (outcome === 'gateway') {
    add(90, { request: 'Sale', step: 'Sale request', status: 'error', latencyMs: 90, message: 'PowerTranz unavailable (HTTP 503)' })
    return rows
  }

  add(128, { request: 'Auth', step: 'Auth response', iso: '00', status: 'ok', latencyMs: 128, message: 'Approved: auth code A1B294' })
  add(940, { request: '3DS2', step: '3DS2', iso: '00', status: 'ok', latencyMs: 812, message: '3DS2 frictionless / challenge completed' })
  add(941, { request: 'Capture', step: 'Capture request', status: 'sent', message: 'PowerTranz Capture submitted against auth' })
  add(1164, { request: 'Capture', step: 'Capture response', iso: '00', status: 'ok', latencyMs: 223, message: 'Captured' })

  if (entervo === 'skip' || entervo === 'none') return rows

  if (entervo === 'ok') {
    add(1288, { request: 'entervo', step: 'Payment notify', status: 'ok', latencyMs: 96, message: 'Posted to parking system' })
  } else {
    add(9280, { request: 'entervo', step: 'Payment notify', status: 'error', latencyMs: 8000, message: 'Payment Web Service timeout, retrying' })
  }
  return rows
}

export function appendRefundTimeline(existing, { startedAt, approved }) {
  const t0 = new Date(startedAt).getTime()
  const extra = []
  extra.push(step(t0, {
    request: 'Refund',
    step: 'Refund request',
    status: 'sent',
    message: approved ? 'Admin confirmed. PowerTranz Refund submitted' : 'Refund rejected by admin, not sent to PowerTranz',
  }))
  if (approved) {
    extra.push(step(t0 + 186, {
      request: 'Refund',
      step: 'Refund response',
      iso: '00',
      status: 'ok',
      latencyMs: 186,
      message: 'Refund approved. Original sale reversed',
    }))
  }
  return [...existing, ...extra]
}

export function timelineErrors(timeline) {
  return timeline
    .filter((row) => row.status === 'error')
    .map((row) => ({
      at: row.at,
      request: row.request,
      iso: row.iso,
      message: row.message,
    }))
}

export function emptyRefund() {
  return {
    status: 'none',
    amount: 0,
    requestedBy: null,
    requestedAt: null,
    confirmedBy: null,
    confirmedAt: null,
    reason: '',
    decision: null,
  }
}
