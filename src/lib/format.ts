// Display formatting. All dates render in the viewer's timezone with the zone shown where it
// matters (clinics, bookings).

const locale = 'en-GB'

export const formatDate = (
  iso?: string,
  opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
) => (iso ? new Intl.DateTimeFormat(locale, opts).format(new Date(iso)) : '—')

export const formatDateTime = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso))
    : '—'

export const formatTime = (iso: string, timeZone?: string) =>
  new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone }).format(
    new Date(iso),
  )

export const formatWeekday = (iso: string) =>
  new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }).format(
    new Date(iso),
  )

export const viewerTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone

export const timeZoneLabel = (timeZone = viewerTimeZone()) => {
  const part = new Intl.DateTimeFormat(locale, { timeZoneName: 'short', timeZone })
    .formatToParts(new Date())
    .find((p) => p.type === 'timeZoneName')
  return `${timeZone.replace(/_/g, ' ')} (${part?.value ?? ''})`
}

const DEMO_NOW = new Date('2026-10-19T09:00:00.000Z').getTime()

export function relativeTime(iso?: string) {
  if (!iso) return '—'
  // The demo clock starts at DEMO_NOW on page load and then runs in real time (see services/api).
  // Records saved in an earlier visit can sit slightly ahead of it, so treat those as just now.
  const diff = new Date(iso).getTime() - (DEMO_NOW + performance.now())
  if (diff > 0 && diff < 864e5) return 'just now'
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (abs < 36e5) return rtf.format(Math.round(diff / 6e4), 'minute')
  if (abs < 864e5) return rtf.format(Math.round(diff / 36e5), 'hour')
  if (abs < 30 * 864e5) return rtf.format(Math.round(diff / 864e5), 'day')
  if (abs < 365 * 864e5) return rtf.format(Math.round(diff / (30 * 864e5)), 'month')
  return rtf.format(Math.round(diff / (365 * 864e5)), 'year')
}

export const daysUntil = (iso: string) => Math.ceil((new Date(iso).getTime() - DEMO_NOW) / 864e5)

export const formatNumber = (n: number) => new Intl.NumberFormat(locale).format(n)
export const formatPercent = (n: number, digits = 0) => `${n.toFixed(digits)}%`
export const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    amount,
  )

export const sentenceCase = (s: string) => {
  const t = s.replace(/_/g, ' ')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

export const plural = (n: number, one: string, many = `${one}s`) =>
  `${formatNumber(n)} ${n === 1 ? one : many}`

/** Simulate a file download (demo exports, certificates, resources). */
export function downloadText(fileName: string, content: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
