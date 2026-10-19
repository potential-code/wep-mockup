// Timezone-aware helpers for slot pickers, calendars and .ics files. Slots are stored in UTC.

import { viewerTimeZone } from '@/lib/format'

const LOCALE = 'en-GB'

const ymd = (day: string): [number, number, number] => {
  const [y, m, d] = day.split('-').map(Number)
  return [y ?? 1970, m ?? 1, d ?? 1]
}

export const COMMON_TIMEZONES = [
  'UTC',
  'Europe/London',
  'Europe/Berlin',
  'Africa/Lagos',
  'Africa/Nairobi',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'America/New_York',
  'America/Sao_Paulo',
]

export function timezoneOptions(extra?: string): string[] {
  const list = [viewerTimeZone(), extra, ...COMMON_TIMEZONES].filter((z): z is string => !!z)
  return [...new Set(list)]
}

export function tzAbbrev(timeZone: string, iso?: string) {
  const part = new Intl.DateTimeFormat(LOCALE, { timeZoneName: 'short', timeZone })
    .formatToParts(iso ? new Date(iso) : new Date())
    .find((p) => p.type === 'timeZoneName')
  return part?.value ?? timeZone
}

export const tzName = (timeZone: string) => timeZone.replace(/_/g, ' ')

/** Calendar day key (yyyy-mm-dd) of an instant in a timezone. */
export function dayKey(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso))
}

export const timeIn = (iso: string, timeZone: string) =>
  new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit', timeZone }).format(
    new Date(iso),
  )

export const dayLong = (iso: string, timeZone: string) =>
  new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(new Date(iso))

export const dayShort = (iso: string, timeZone: string) =>
  new Intl.DateTimeFormat(LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone,
  }).format(new Date(iso))

export const dateTimeIn = (iso: string, timeZone: string) =>
  `${dayShort(iso, timeZone)}, ${timeIn(iso, timeZone)} ${tzAbbrev(timeZone, iso)}`

/** UTC offset in minutes of a timezone at an instant. */
function offsetMinutes(at: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(at)
  const v = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  const asUtc = Date.UTC(v('year'), v('month') - 1, v('day'), v('hour'), v('minute'), v('second'))
  return Math.round((asUtc - at.getTime()) / 60000)
}

/** Wall-clock time in a timezone (yyyy-mm-dd + hour/minute) to a UTC ISO string. */
export function zonedToIso(day: string, hour: number, minute: number, timeZone: string) {
  const [y, m, d] = ymd(day)
  const guess = Date.UTC(y, m - 1, d, hour, minute)
  const first = guess - offsetMinutes(new Date(guess), timeZone) * 60000
  const second = guess - offsetMinutes(new Date(first), timeZone) * 60000
  return new Date(second).toISOString()
}

/** Adds days to a yyyy-mm-dd key. */
export function addDays(day: string, n: number) {
  const [y, m, d] = ymd(day)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

export function weekdayOf(day: string) {
  const [y, m, d] = ymd(day)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export const dayLabel = (day: string, opts: Intl.DateTimeFormatOptions) => {
  const [y, m, d] = ymd(day)
  return new Intl.DateTimeFormat(LOCALE, { timeZone: 'UTC', ...opts }).format(
    new Date(Date.UTC(y, m - 1, d)),
  )
}

const icsStamp = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '')

export function buildIcs(input: {
  uid: string
  title: string
  description: string
  startsAt: string
  durationMin: number
  location?: string
}) {
  const end = new Date(new Date(input.startsAt).getTime() + input.durationMin * 60000).toISOString()
  const esc = (s: string) => s.replace(/[;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WEPs portal mockup//Mentoring//EN',
    'BEGIN:VEVENT',
    `UID:${input.uid}@weps-mockup`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(input.startsAt)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${esc(input.title)}`,
    `DESCRIPTION:${esc(input.description)}`,
    `LOCATION:${esc(input.location ?? 'Online (demo link)')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
