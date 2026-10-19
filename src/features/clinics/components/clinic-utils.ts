import type { ClinicEvent } from '@shared/types'
import { formatDate, formatTime } from '@/lib/format'

export const FORMAT_LABEL: Record<ClinicEvent['format'], string> = {
  online: 'Online',
  hybrid: 'Hybrid',
  in_person: 'In person',
}

export const clinicDateLabel = (iso: string) =>
  formatDate(iso, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

export const clinicTimeRange = (iso: string, durationMin: number) =>
  `${formatTime(iso)} – ${formatTime(new Date(new Date(iso).getTime() + durationMin * 60000).toISOString())}`

const icsStamp = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')

/** Demo calendar file for an event. */
export function buildIcs(e: ClinicEvent) {
  const start = new Date(e.startsAt)
  const end = new Date(start.getTime() + e.durationMin * 60000)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WEPs Portal Demo//EN',
    'BEGIN:VEVENT',
    `UID:${e.id}@weps-portal-demo`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${e.title}`,
    `DESCRIPTION:${e.summary} (Demo event: joining details are simulated.)`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
