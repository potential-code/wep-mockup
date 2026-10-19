import { PRINCIPLES } from '@shared/reference'
import { CalendarDays, ChevronDown, List, SearchX, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { FilterBar } from '@/components/shared/Cards'
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { timeZoneLabel } from '@/lib/format'
import { useEvents } from '@/queries/clinics.queries'
import { ClinicCalendar } from '../components/ClinicCalendar'
import { ClinicCard } from '../components/ClinicCard'
import { FilterSelect } from '../components/ClinicFilters'
import { FORMAT_LABEL } from '../components/clinic-utils'

type View = 'list' | 'calendar'
const INITIAL = {
  topic: 'all',
  principle: 'all',
  format: 'all',
  date: 'upcoming',
  language: 'all',
  eligibility: 'all',
}

export function ClinicsPage() {
  const { data, isLoading, isError, refetch } = useEvents()
  const [view, setView] = useState<View>('list')
  const [f, setF] = useState(INITIAL)
  const [more, setMore] = useState(false)
  const [shown, setShown] = useState(6)
  const set = (k: keyof typeof INITIAL) => (v: string) => {
    setShown(6)
    setF((s) => ({ ...s, [k]: v }))
  }

  const rows = data ?? []
  const topics = [...new Set(rows.map((r) => r.event.topic))].sort()
  const languages = [...new Set(rows.map((r) => r.event.language))].sort()

  const filtered = useMemo(
    () =>
      rows.filter(({ event: e, status }) => {
        const upcoming = e.status === 'scheduled'
        if (f.date === 'upcoming' && !upcoming) return false
        if (f.date === 'past' && upcoming) return false
        if (f.topic !== 'all' && e.topic !== f.topic) return false
        if (f.principle !== 'all' && String(e.principle) !== f.principle) return false
        if (f.format !== 'all' && e.format !== f.format) return false
        if (f.language !== 'all' && e.language !== f.language) return false
        if (f.eligibility === 'open')
          return upcoming && (status === 'eligible' || status === 'full')
        if (f.eligibility === 'registered')
          return status === 'registered' || status === 'waitlisted'
        if (f.eligibility === 'locked') return status === 'locked'
        return true
      }),
    [rows, f],
  )
  const dirty = JSON.stringify(f) !== JSON.stringify(INITIAL)

  return (
    <>
      <PageHeader
        title="Clinics and webinars"
        description={`Live expert-led sessions. Times shown in ${timeZoneLabel()}.`}
        actions={
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as View)}
            variant="outline"
            aria-label="View"
          >
            <ToggleGroupItem value="list" aria-label="List view">
              <List aria-hidden /> List
            </ToggleGroupItem>
            <ToggleGroupItem value="calendar" aria-label="Calendar view">
              <CalendarDays aria-hidden /> Calendar
            </ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <FilterBar count={filtered.length}>
        <FilterSelect
          label="Topic"
          value={f.topic}
          onChange={set('topic')}
          options={topics.map((t) => ({ value: t, label: t }))}
        />
        <FilterSelect
          label="Date"
          value={f.date}
          onChange={set('date')}
          options={[
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'past', label: 'Past sessions' },
          ]}
        />
        <FilterSelect
          label="Eligibility"
          value={f.eligibility}
          onChange={set('eligibility')}
          options={[
            { value: 'open', label: 'I can register' },
            { value: 'registered', label: 'I am registered' },
            { value: 'locked', label: 'Locked for me' },
          ]}
        />
        <Button variant="outline" size="sm" aria-expanded={more} onClick={() => setMore((v) => !v)}>
          <SlidersHorizontal aria-hidden /> More filters
          <ChevronDown aria-hidden className={more ? 'rotate-180' : ''} />
        </Button>
        {dirty ? (
          <Button variant="ghost" size="sm" onClick={() => setF(INITIAL)}>
            Clear filters
          </Button>
        ) : null}
      </FilterBar>
      {more ? (
        <div className="-mt-2 mb-5 flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Principle"
            value={f.principle}
            onChange={set('principle')}
            options={PRINCIPLES.map((p) => ({
              value: String(p.id),
              label: `P${p.id} · ${p.short}`,
            }))}
          />
          <FilterSelect
            label="Format"
            value={f.format}
            onChange={set('format')}
            options={Object.entries(FORMAT_LABEL).map(([value, label]) => ({ value, label }))}
          />
          <FilterSelect
            label="Language"
            value={f.language}
            onChange={set('language')}
            options={languages.map((t) => ({ value: t, label: t }))}
          />
        </div>
      ) : null}

      {isLoading ? (
        <CardGridSkeleton />
      ) : isError ? (
        <ErrorState message="We couldn’t load sessions." onRetry={() => refetch()} />
      ) : view === 'calendar' ? (
        <ClinicCalendar rows={filtered} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No sessions match these filters"
          description="Try a different topic or show past sessions."
          action={
            <Button variant="outline" onClick={() => setF(INITIAL)}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.slice(0, shown).map((r) => (
            <ClinicCard key={r.event.id} row={r} />
          ))}
        </div>
      )}
      {view === 'list' && filtered.length > shown ? (
        <div className="mt-5 flex justify-center">
          <Button variant="outline" onClick={() => setShown((n) => n + 6)}>
            Show more sessions ({filtered.length - shown} more)
          </Button>
        </div>
      ) : null}
    </>
  )
}
