import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { addDays, dayKey, dayLabel, timeIn, tzAbbrev } from '../lib/time'

export interface PickableSlot {
  id: string
  startsAt: string
  status: string
}

const WEEK_START = '2026-10-19' // Monday of the demo week
const WEEKS = 4

/** Week strip + time chips. Slot times are rendered in the chosen timezone. */
export function SlotPicker({
  slots,
  timeZone,
  selectedId,
  onSelect,
}: {
  slots: PickableSlot[]
  timeZone: string
  selectedId?: string
  onSelect: (slot: PickableSlot) => void
}) {
  const byDay = useMemo(() => {
    const map = new Map<string, PickableSlot[]>()
    for (const s of slots) {
      if (s.status !== 'open') continue
      const k = dayKey(s.startsAt, timeZone)
      map.set(k, [...(map.get(k) ?? []), s])
    }
    return map
  }, [slots, timeZone])

  const firstDay = useMemo(() => [...byDay.keys()].sort()[0], [byDay])
  const selected = slots.find((s) => s.id === selectedId)
  const [week, setWeek] = useState(0)
  const [day, setDay] = useState<string | undefined>(undefined)

  // Keep the visible day valid when the timezone or slot list changes.
  const dayRef = useRef(day)
  dayRef.current = day
  const selectedRef = useRef(selected)
  selectedRef.current = selected
  useEffect(() => {
    const sel = selectedRef.current
    const selDay = sel ? dayKey(sel.startsAt, timeZone) : undefined
    const cur = dayRef.current
    const next = selDay ?? (cur && byDay.has(cur) ? cur : firstDay)
    if (!next || next === cur) return
    setDay(next)
    const ms =
      new Date(`${next}T00:00:00Z`).getTime() - new Date(`${WEEK_START}T00:00:00Z`).getTime()
    setWeek(Math.min(Math.max(Math.floor(ms / (7 * 864e5)), 0), WEEKS - 1))
  }, [timeZone, byDay, firstDay])

  const days = Array.from({ length: 7 }, (_, i) => addDays(WEEK_START, week * 7 + i))
  const first = days[0] ?? WEEK_START
  const last = days[6] ?? WEEK_START
  const times = (day ? (byDay.get(day) ?? []) : []).sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  )

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-navy text-sm" aria-live="polite">
          {dayLabel(first, { day: 'numeric', month: 'short' })} –{' '}
          {dayLabel(last, { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous week"
            disabled={week === 0}
            onClick={() => setWeek((w) => w - 1)}
          >
            <ChevronLeft aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next week"
            disabled={week >= WEEKS - 1}
            onClick={() => setWeek((w) => w + 1)}
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const count = byDay.get(d)?.length ?? 0
          const active = d === day
          return (
            <button
              key={d}
              type="button"
              disabled={count === 0}
              aria-pressed={active}
              aria-label={`${dayLabel(d, { weekday: 'long', day: 'numeric', month: 'long' })}, ${count} times available`}
              onClick={() => setDay(d)}
              className={cn(
                'grid min-h-16 place-items-center gap-0.5 rounded-xl border px-1 py-2 text-center transition-colors focus-visible:outline-2',
                active
                  ? 'border-blue bg-blue text-white'
                  : count > 0
                    ? 'bg-card hover:border-blue hover:bg-blue-50'
                    : 'cursor-not-allowed bg-muted/40 text-muted-foreground/60',
              )}
            >
              <span className="text-[11px] uppercase tracking-wide">
                {dayLabel(d, { weekday: 'short' })}
              </span>
              <span className="font-heading font-semibold text-lg leading-none">
                {dayLabel(d, { day: 'numeric' })}
              </span>
              <span className="text-[10px] leading-none">{count > 0 ? `${count} free` : '—'}</span>
            </button>
          )
        })}
      </div>

      <div>
        <p className="mb-2 text-muted-foreground text-sm">
          {day
            ? `${dayLabel(day, { weekday: 'long', day: 'numeric', month: 'long' })} · times in ${tzAbbrev(timeZone)}`
            : 'Pick a day with free times.'}
        </p>
        {times.length === 0 ? (
          <p className="rounded-xl border border-dashed p-4 text-muted-foreground text-sm">
            No free times this day. Choose another day in the strip above.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {times.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  aria-pressed={s.id === selectedId}
                  onClick={() => onSelect(s)}
                  className={cn(
                    'min-h-10 min-w-24 rounded-lg border px-4 font-medium text-sm tabular-nums transition-colors focus-visible:outline-2',
                    s.id === selectedId
                      ? 'border-blue bg-blue text-white'
                      : 'bg-card text-navy hover:border-blue hover:bg-blue-50',
                  )}
                >
                  {timeIn(s.startsAt, timeZone)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
