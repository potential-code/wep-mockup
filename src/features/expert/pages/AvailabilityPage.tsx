import { CalendarOff, ChevronLeft, ChevronRight, Lock, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addDays, dayLabel, tzAbbrev, tzName, zonedToIso } from '@/features/mentorship/lib/time'
import { useCurrentUser } from '@/hooks/use-session'
import { cn } from '@/lib/utils'
import {
  type AvailabilityPrefs,
  useAvailabilityPrefs,
  useMyAvailability,
  useSaveAvailabilityPrefs,
  useToggleSlot,
} from '@/queries/mentorship.queries'

const WEEK0 = '2026-10-19'
const HOURS = Array.from({ length: 12 }, (_, i) => 7 + i)

export function AvailabilityPage() {
  const { user } = useCurrentUser()
  const slots = useMyAvailability()
  const prefsQ = useAvailabilityPrefs()
  const toggle = useToggleSlot()
  const savePrefs = useSaveAvailabilityPrefs()
  const [week, setWeek] = useState(0)
  const [prefs, setPrefs] = useState<AvailabilityPrefs>()
  const [period, setPeriod] = useState({ from: '', to: '', reason: '' })
  const tz = user?.timezone ?? 'UTC'

  useEffect(() => {
    if (prefsQ.data && !prefs) setPrefs(prefsQ.data)
  }, [prefsQ.data, prefs])

  if (slots.isLoading || prefsQ.isLoading) return <PageSkeleton />
  if (slots.isError || !slots.data || !prefs)
    return <ErrorState message={slots.error?.message} onRetry={() => slots.refetch()} />

  const bySlot = new Map(slots.data.map((s) => [s.startsAt, s]))
  const start = addDays(WEEK0, week * 7)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const off = (d: string) => prefs.unavailable.find((p) => d >= p.from && d <= p.to)

  const addPeriod = () => {
    if (!period.from || !period.to || period.to < period.from) {
      toast.error('Choose a start date and an end date on or after it.')
      return
    }
    setPrefs({
      ...prefs,
      unavailable: [
        ...prefs.unavailable,
        { id: `un-${Date.now()}`, ...period, reason: period.reason || 'Unavailable' },
      ],
    })
    setPeriod({ from: '', to: '', reason: '' })
  }
  const num = (k: 'maxPerDay' | 'maxPerWeek' | 'noticeHours', v: string) =>
    setPrefs({ ...prefs, [k]: Math.max(0, Number(v) || 0) })

  return (
    <div>
      <PageHeader
        title="Availability"
        description={`Click a time to open or close it. Times in ${tzName(tz)} (${tzAbbrev(tz)}). Booked slots are locked.`}
      />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[1.6fr_1fr]">
        <SectionCard
          title="Weekly slots"
          action={
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Previous week"
                disabled={week === 0}
                onClick={() => setWeek(week - 1)}
              >
                <ChevronLeft aria-hidden />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Next week"
                disabled={week >= 2}
                onClick={() => setWeek(week + 1)}
              >
                <ChevronRight aria-hidden />
              </Button>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-separate border-spacing-1 text-center text-xs">
              <caption className="sr-only">Weekly availability grid</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-12" />
                  {days.map((d) => (
                    <th key={d} scope="col" className="pb-1 font-medium text-navy">
                      {dayLabel(d, { weekday: 'short', day: 'numeric' })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((h) => (
                  <tr key={h}>
                    <th
                      scope="row"
                      className="pe-1 text-right font-normal text-muted-foreground tabular-nums"
                    >
                      {String(h).padStart(2, '0')}:00
                    </th>
                    {days.map((d) => {
                      const iso = zonedToIso(d, h, 0, tz)
                      const slot = bySlot.get(iso)
                      const weekend = [0, 6].includes(new Date(`${d}T12:00:00Z`).getUTCDay())
                      const away = off(d)
                      const label = `${dayLabel(d, { weekday: 'long', day: 'numeric', month: 'long' })} ${h}:00`
                      if (slot?.status === 'booked')
                        return (
                          <td key={d}>
                            <span
                              title="Booked: cancel the booking to free this slot"
                              role="img"
                              aria-label={`${label}, booked and locked`}
                              className="grid h-9 place-items-center rounded-md bg-navy text-white"
                            >
                              <Lock className="size-3.5" aria-hidden />
                            </span>
                          </td>
                        )
                      return (
                        <td key={d}>
                          <button
                            type="button"
                            disabled={Boolean(away) || weekend || toggle.isPending}
                            aria-pressed={slot?.status === 'open'}
                            aria-label={`${label}, ${slot?.status === 'open' ? 'open' : 'closed'}`}
                            onClick={() => toggle.mutate(iso)}
                            className={cn(
                              'h-9 w-full rounded-md border text-[11px] transition-colors focus-visible:outline-2 disabled:cursor-not-allowed',
                              slot?.status === 'open'
                                ? 'border-blue bg-blue text-white hover:bg-blue-600'
                                : 'border-dashed bg-card text-muted-foreground hover:border-blue hover:bg-blue-50',
                              (away || weekend) && 'bg-muted/50 opacity-50',
                            )}
                          >
                            {away ? 'Away' : slot?.status === 'open' ? 'Open' : ''}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-muted-foreground text-xs">
            <span>
              <span className="me-1 inline-block size-2.5 rounded-sm bg-blue" />
              Open
            </span>
            <span>
              <span className="me-1 inline-block size-2.5 rounded-sm border border-dashed" />
              Closed
            </span>
            <span>
              <span className="me-1 inline-block size-2.5 rounded-sm bg-navy" />
              Booked (locked)
            </span>
          </p>
        </SectionCard>

        <div className="grid content-start gap-6">
          <SectionCard title="Session limits">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {(
                [
                  ['maxPerDay', 'Max sessions per day'],
                  ['maxPerWeek', 'Max sessions per week'],
                  ['noticeHours', 'Minimum notice (hours)'],
                ] as const
              ).map(([k, label]) => (
                <div key={k} className="grid gap-1.5">
                  <Label htmlFor={k}>{label}</Label>
                  <Input
                    id={k}
                    type="number"
                    min={0}
                    value={prefs[k]}
                    onChange={(e) => num(k, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard
            title="Unavailable periods"
            description="No bookings are offered on these dates."
          >
            <ul className="mb-4 grid gap-2">
              {prefs.unavailable.length === 0 ? (
                <li className="text-muted-foreground text-sm">None added.</li>
              ) : null}
              {prefs.unavailable.map((p) => (
                <li key={p.id} className="flex items-center gap-2 rounded-lg border p-2.5 text-sm">
                  <CalendarOff className="size-4 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <strong className="text-navy">
                      {dayLabel(p.from, { day: 'numeric', month: 'short' })} –{' '}
                      {dayLabel(p.to, { day: 'numeric', month: 'short' })}
                    </strong>
                    <br />
                    {p.reason}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${p.reason}`}
                    onClick={() =>
                      setPrefs({
                        ...prefs,
                        unavailable: prefs.unavailable.filter((x) => x.id !== p.id),
                      })
                    }
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="p-from">From</Label>
                <Input
                  id="p-from"
                  type="date"
                  value={period.from}
                  onChange={(e) => setPeriod({ ...period, from: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="p-to">To</Label>
                <Input
                  id="p-to"
                  type="date"
                  value={period.to}
                  onChange={(e) => setPeriod({ ...period, to: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="p-reason">Reason (private)</Label>
                <Input
                  id="p-reason"
                  value={period.reason}
                  onChange={(e) => setPeriod({ ...period, reason: e.target.value })}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="justify-self-start"
                onClick={addPeriod}
              >
                <Plus aria-hidden /> Add period
              </Button>
            </div>
          </SectionCard>
          <Button
            disabled={savePrefs.isPending}
            onClick={async () => {
              await savePrefs.mutateAsync(prefs)
              toast.success('Availability settings saved.')
            }}
            className="justify-self-start"
          >
            {savePrefs.isPending ? 'Saving…' : 'Save limits and periods'}
          </Button>
        </div>
      </div>
    </div>
  )
}
