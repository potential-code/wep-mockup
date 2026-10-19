import { Link } from '@tanstack/react-router'
import { CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  addDays,
  dayKey,
  dayLabel,
  timeIn,
  tzAbbrev,
  tzName,
  weekdayOf,
} from '@/features/mentorship/lib/time'
import { cn } from '@/lib/utils'
import { type ExpertScheduleItem, useExpertSchedule } from '@/queries/mentorship.queries'
import { ScheduleItemCard } from '../components/ScheduleItemCard'

const TODAY = '2026-10-19'
type View = 'week' | 'month'

const mondayOf = (day: string) => addDays(day, -((weekdayOf(day) + 6) % 7))

export function ExpertCalendarPage() {
  const schedule = useExpertSchedule()
  const [view, setView] = useState<View>('week')
  const [anchor, setAnchor] = useState(TODAY)
  const [picked, setPicked] = useState<string>()
  const tz = schedule.data?.timezone ?? 'UTC'

  const byDay = useMemo(() => {
    const map = new Map<string, ExpertScheduleItem[]>()
    for (const i of schedule.data?.items ?? [])
      map.set(dayKey(i.startsAt, tz), [...(map.get(dayKey(i.startsAt, tz)) ?? []), i])
    return map
  }, [schedule.data, tz])

  const firstUpcoming = [...byDay.keys()].sort().find((k) => k >= TODAY)
  const selected = picked ?? firstUpcoming ?? TODAY

  if (schedule.isLoading) return <PageSkeleton />
  if (schedule.isError || !schedule.data)
    return <ErrorState message={schedule.error?.message} onRetry={() => schedule.refetch()} />

  const weekStart = mondayOf(anchor)
  const monthStart = `${anchor.slice(0, 7)}-01`
  const gridStart = mondayOf(monthStart)
  const monthDays = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  const step = (dir: 1 | -1) => {
    if (view === 'week') setAnchor(addDays(anchor, 7 * dir))
    else {
      const [y = 2026, m = 1] = anchor.split('-').map(Number)
      const d = new Date(Date.UTC(y, m - 1 + dir, 1))
      setAnchor(d.toISOString().slice(0, 10))
    }
  }
  const title =
    view === 'week'
      ? `${dayLabel(weekStart, { day: 'numeric', month: 'short' })} – ${dayLabel(addDays(weekStart, 6), { day: 'numeric', month: 'short', year: 'numeric' })}`
      : dayLabel(monthStart, { month: 'long', year: 'numeric' })
  const selectedItems = byDay.get(selected) ?? []

  return (
    <div>
      <PageHeader
        title="Calendar"
        description={`Times in ${tzName(tz)} (${tzAbbrev(tz)})`}
        actions={
          <Button asChild variant="outline">
            <Link to="/expert/availability">
              <CalendarClock aria-hidden /> Manage availability
            </Link>
          </Button>
        }
      />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Previous" onClick={() => step(-1)}>
            <ChevronLeft aria-hidden />
          </Button>
          <Button variant="outline" size="icon" aria-label="Next" onClick={() => step(1)}>
            <ChevronRight aria-hidden />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setAnchor(TODAY)
              setPicked(undefined)
            }}
          >
            Today
          </Button>
          <h2 className="ms-2 font-heading font-semibold text-lg text-navy" aria-live="polite">
            {title}
          </h2>
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          value={view}
          onValueChange={(v) => v && setView(v as View)}
          aria-label="Calendar view"
        >
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {view === 'week' ? (
        <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((d) => {
            const items = byDay.get(d) ?? []
            return (
              <li
                key={d}
                className={cn(
                  'grid content-start gap-2 rounded-2xl border bg-card p-3',
                  d === TODAY && 'border-blue ring-1 ring-blue/30',
                )}
              >
                <h3 className="font-semibold text-navy text-sm">
                  {dayLabel(d, { weekday: 'short', day: 'numeric', month: 'short' })}
                  {d === TODAY ? <span className="ms-1 text-blue text-xs">Today</span> : null}
                </h3>
                {items.length === 0 ? (
                  <p className="text-muted-foreground text-xs">No sessions</p>
                ) : (
                  items.map((i) => <WeekChip key={i.id} item={i} onOpen={() => setPicked(d)} />)
                )}
              </li>
            )
          })}
        </ol>
      ) : (
        <div className="rounded-2xl border bg-card p-3 shadow-card sm:p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-muted-foreground text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {monthDays.map((d) => {
              const count = byDay.get(d)?.length ?? 0
              const inMonth = d.slice(0, 7) === anchor.slice(0, 7)
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={d === selected}
                  aria-label={`${dayLabel(d, { weekday: 'long', day: 'numeric', month: 'long' })}, ${count} sessions`}
                  onClick={() => setPicked(d)}
                  className={cn(
                    'grid min-h-14 content-start justify-items-center gap-1 rounded-lg border p-1.5 text-sm focus-visible:outline-2 sm:min-h-20',
                    inMonth ? 'bg-card' : 'bg-muted/40 text-muted-foreground',
                    d === selected && 'border-blue bg-blue-50',
                    d === TODAY && 'font-bold text-blue',
                  )}
                >
                  {dayLabel(d, { day: 'numeric' })}
                  {count > 0 ? (
                    <span className="rounded-full bg-blue px-1.5 text-[11px] text-white">
                      {count}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {view === 'month' ? (
        <section className="mt-6" aria-label="Selected day">
          <h2 className="mb-3 font-heading font-semibold text-lg text-navy">
            {dayLabel(selected, { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          {selectedItems.length === 0 ? (
            <EmptyState title="No sessions this day" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {selectedItems.map((i) => (
                <ScheduleItemCard key={i.id} item={i} />
              ))}
            </div>
          )}
        </section>
      ) : selectedItems.length > 0 ? (
        <section className="mt-6" aria-label="Selected day">
          <h2 className="mb-3 font-heading font-semibold text-lg text-navy">
            {dayLabel(selected, { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {selectedItems.map((i) => (
              <ScheduleItemCard key={i.id} item={i} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function WeekChip({ item, onOpen }: { item: ExpertScheduleItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="grid gap-0.5 rounded-lg bg-blue-50 p-2 text-left text-xs hover:bg-blue-100 focus-visible:outline-2"
    >
      <span className="font-semibold text-navy">
        {timeIn(item.startsAt, item.timezone)} · {item.format}
      </span>
      <span className="line-clamp-2 text-navy">{item.title}</span>
    </button>
  )
}
