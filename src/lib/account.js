const SCAN_IN = new Set(['Check-in', 'Scanned in'])
const SCAN_OUT = new Set(['Check-out authorised', 'Check-out', 'Scanned out'])

export function paymentMethodLabel(entry = {}) {
  const method = entry.method || ''
  if (method === 'Apple Pay' || method === 'Google Pay') return method
  if (method === 'Prepaid credit' || method === 'Fully validated') return method
  if (entry.tokenized || method === 'Tokenized card') {
    const brand = entry.cardBrand && entry.cardBrand !== '-' ? entry.cardBrand : 'card'
    return entry.cardMasked ? `Tokenized ${brand} · ${entry.cardMasked}` : `Tokenized ${brand}`
  }
  if (method === 'Card' || entry.cardMasked) {
    const brand = entry.cardBrand && entry.cardBrand !== '-' ? entry.cardBrand : 'Card'
    return entry.cardMasked && entry.cardMasked !== brand ? `${brand} · ${entry.cardMasked}` : method || brand
  }
  return method || 'Payment'
}

export function paymentStatusClass(status) {
  if (status === 'Captured') return 'pill-ok'
  if (status === 'Declined') return 'pill-bad'
  if (status === 'Refund pending') return 'pill-warn'
  if (status === 'Refunded') return 'pill-mute'
  return 'pill-mute'
}

export function isCustomerActivity(event) {
  if (SCAN_IN.has(event.action) || SCAN_OUT.has(event.action)) return true
  if (event.category === 'payment' || event.category === 'refund') {
    if (event.actorType === 'system') return false
    if (event.action === 'Payment started' || event.action === 'Credit top-up started') return false
    return true
  }
  return false
}

export function customerActivityTitle(event) {
  if (SCAN_IN.has(event.action)) return 'Scanned in'
  if (SCAN_OUT.has(event.action)) return 'Scanned out'
  if (event.action === 'Payment captured' || event.action === 'Credit top-up captured') return 'Payment'
  if (event.action === 'Session settled with validation') return 'Payment'
  if (event.action === 'Payment failed' || event.action === 'Payment declined' || event.action === 'Credit top-up failed') {
    return 'Payment declined'
  }
  if (event.action === 'Refund requested') return 'Refund requested'
  if (event.action === 'Refund confirmed') return 'Refund completed'
  return event.action
}

export function enrichCustomerActivity(events, history, customerId) {
  return events
    .filter((event) => event.customerId === customerId && isCustomerActivity(event))
    .map((event) => {
      const payment = event.ref ? history.find((row) => row.ref === event.ref) : null
      const methodSource = payment || event
      const methodLabel =
        (event.category === 'payment' || event.category === 'refund') &&
        (methodSource.method || methodSource.cardMasked)
          ? paymentMethodLabel(methodSource)
          : null
      return {
        ...event,
        title: customerActivityTitle(event),
        methodLabel,
        amount: payment?.amount ?? event.amount ?? null,
        where: payment?.where || null,
      }
    })
}
