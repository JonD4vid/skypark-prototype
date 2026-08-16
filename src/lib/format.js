export function money(n) {
  return '$' + Number(n).toFixed(2)
}

export function formatPlate(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
}

export function normalizePlate(value) {
  return String(value || '').toUpperCase().replace(/\s+/g, '')
}

export function todayLabel() {
  return new Intl.DateTimeFormat('en-TT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date())
}

export function nowIso() {
  return new Date().toISOString()
}

export function formatDateTime(iso) {
  if (!iso) return '-'
  return new Intl.DateTimeFormat('en-TT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}

export function formatShort(iso) {
  if (!iso) return '-'
  return new Intl.DateTimeFormat('en-TT', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}

export function formatTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  const pad = (n, len = 2) => String(n).padStart(len, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`
}

export function isSameDay(iso, vs = new Date()) {
  const d = new Date(iso)
  return d.toDateString() === vs.toDateString()
}
