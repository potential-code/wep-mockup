import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { viewerTimeZone } from '@/lib/format'
import { cn } from '@/lib/utils'
import { addDays, dayKey, dayLabel } from '../lib/time'

const START = '2026-10-19'

/** Two-week availability overview; each day links into the booking flow. */
export function AvailabilityPreview({
  slots,
  mentorId,
  bookable,
}: {
  slots: { startsAt: string; status: string }[]
  mentorId: string
  bookable: boolean
}) {
  const tz = viewerTimeZone()
  // 19 Oct 2026 (demo date) is a Monday, so the grid starts on the current week.
  const grid = useMemo(() => {
    const open = new Map<string, number>()
    for (const s of slots)
      if (s.status === 'open') {
        const k = dayKey(s.startsAt, tz)
        open.set(k, (open.get(k) ?? 0) + 1)
      }
    return Array.from({ length: 14 }, (_, i) => {
      const key = addDays(START, i)
      return { key, open: open.get(key) ?? 0 }
    })
  }, [slots, tz])

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-muted-foreground text-xs">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <ol className="mt-1.5 grid grid-cols-7 gap-1.5">
        {grid.map((d) => {
          const past = d.key < START
          const cell = (
            <span
              className={cn(
                'grid h-14 place-items-center rounded-lg border text-center text-sm',
                d.open > 0 && !past
                  ? 'border-blue/30 bg-blue-50 text-navy hover:border-blue'
                  : 'bg-muted/40 text-muted-foreground',
              )}
            >
              <span className="font-medium leading-none">
                {dayLabel(d.key, { day: 'numeric' })}
              </span>
              <span className="text-[11px] leading-none">
                {past ? '' : d.open > 0 ? `${d.open} open` : '—'}
              </span>
            </span>
          )
          return (
            <li
              key={d.key}
              aria-label={`${dayLabel(d.key, { weekday: 'long', day: 'numeric', month: 'long' })}: ${d.open} open slots`}
            >
              {bookable && d.open > 0 && !past ? (
                <Link to="/portal/mentorship/book/$mentorId" params={{ mentorId }}>
                  {cell}
                </Link>
              ) : (
                cell
              )}
            </li>
          )
        })}
      </ol>
      <p className="mt-3 text-muted-foreground text-xs">
        Times are shown in your timezone. You choose the exact time when you book.
      </p>
    </div>
  )
}
