import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ClinicRow } from './ClinicCard'
import type { ClinicRowData } from './clinic-types'

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Month grid with event dots on desktop; an agenda list on mobile. */
export function ClinicCalendar({ rows }: { rows: ClinicRowData[] }) {
  const [month, setMonth] = useState(() => new Date(2026, 9, 1))
  const [selected, setSelected] = useState<string | null>(null)

  const byDay = new Map<string, ClinicRowData[]>()
  for (const r of rows) {
    const k = dayKey(new Date(r.event.startsAt))
    byDay.set(k, [...(byDay.get(k) ?? []), r])
  }
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const lead = (first.getDay() + 6) % 7
  const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((lead + daysIn) / 7) * 7 }, (_, i) => {
    const n = i - lead + 1
    return n >= 1 && n <= daysIn ? new Date(month.getFullYear(), month.getMonth(), n) : null
  })
  const inMonth = rows
    .filter((r) => {
      const d = new Date(r.event.startsAt)
      return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear()
    })
    .sort((a, b) => a.event.startsAt.localeCompare(b.event.startsAt))
  const shown = selected ? (byDay.get(selected) ?? []) : inMonth
  const shift = (n: number) => {
    setSelected(null)
    setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1))
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-medium text-lg text-navy" aria-live="polite">
          {month.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous month"
            onClick={() => shift(-1)}
          >
            <ChevronLeft aria-hidden />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Next month" onClick={() => shift(1)}>
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-card md:block">
        <div className="grid grid-cols-7 border-b bg-muted/50 text-center text-muted-foreground text-xs">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2 font-medium">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            const evs = d ? (byDay.get(dayKey(d)) ?? []) : []
            const k = d ? dayKey(d) : `blank-${i}`
            return d ? (
              <button
                type="button"
                key={k}
                onClick={() => setSelected(evs.length ? k : null)}
                aria-label={`${d.getDate()} ${month.toLocaleString('en-GB', { month: 'long' })}${evs.length ? `, ${evs.length} session` : ''}`}
                aria-pressed={selected === k}
                className={cn(
                  'flex min-h-24 flex-col items-start gap-1 border-b border-e p-2 text-start text-sm transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-blue',
                  selected === k && 'bg-blue-50',
                )}
              >
                <span className="font-medium text-navy">{d.getDate()}</span>
                {evs.map((r) => (
                  <span
                    key={r.event.id}
                    className="flex w-full items-center gap-1.5 truncate rounded bg-blue-50 px-1.5 py-0.5 text-blue-600 text-xs"
                  >
                    <span className="size-1.5 shrink-0 rounded-full bg-blue" aria-hidden />
                    <span className="truncate">{r.event.title.split(':')[0]}</span>
                  </span>
                ))}
              </button>
            ) : (
              <div key={k} className="min-h-24 border-b border-e bg-muted/20" />
            )
          })}
        </div>
      </div>

      <div className="grid gap-2">
        <h3 className="font-medium text-navy text-sm">
          {selected ? 'Sessions on this day' : 'Agenda for this month'}
        </h3>
        {shown.length ? (
          shown.map((r) => <ClinicRow key={r.event.id} row={r} />)
        ) : (
          <p className="rounded-xl border border-dashed p-4 text-muted-foreground text-sm">
            No sessions this month. Try the next month or use the{' '}
            <Link to="/portal/clinics" className="text-blue underline">
              list view
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}
