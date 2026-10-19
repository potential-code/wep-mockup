import type { ClinicEvent } from '@shared/types'
import { CalendarDays, ChevronLeft, ChevronRight, List, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { type Column, DataTable } from '@/components/shared/DataTable'
import { ErrorState } from '@/components/shared/States'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatDateTime } from '@/lib/format'
import { useAdminCourses, useUsersTable } from '@/queries/admin.queries'
import { useEvents } from '@/queries/clinics.queries'
import { useResources } from '@/queries/resources.queries'
import { Attendance, blankEvent, ChangeTime, EventForm } from '../components/EventPanels'

type Row = NonNullable<ReturnType<typeof useEvents>['data']>[number]

export function ManageEventsPage() {
  const events = useEvents()
  const users = useUsersTable({})
  const courses = useAdminCourses()
  const resources = useResources()
  const [view, setView] = useState<'list' | 'month'>('list')
  const [selected, setSelected] = useState<ClinicEvent | null>(null)
  const rows = events.data ?? []

  const facilitators = useMemo(
    () =>
      (users.data ?? [])
        .filter((r) => r.user.role === 'mentor' || r.user.role === 'global_admin')
        .map((r) => ({ id: r.user.id, name: `${r.user.firstName} ${r.user.lastName}` })),
    [users.data],
  )

  const columns: Column<Row>[] = [
    {
      key: 'title',
      header: 'Event',
      sortValue: (r) => r.event.title,
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-navy">{r.event.title}</p>
          <p className="text-muted-foreground text-xs">
            {r.event.type === 'clinic' ? 'Clinic' : 'Webinar'} · {r.facilitatorName}
          </p>
        </div>
      ),
    },
    {
      key: 'when',
      header: 'Starts',
      sortValue: (r) => r.event.startsAt,
      cell: (r) => formatDateTime(r.event.startsAt),
    },
    {
      key: 'cap',
      header: 'Registered',
      align: 'end',
      sortValue: (r) => r.registered,
      cell: (r) => `${r.registered} / ${r.event.capacity}`,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => r.event.status,
      cell: (r) =>
        r.event.status === 'scheduled' && r.placesLeft === 0 ? (
          <StatusBadge tone="warning">Full</StatusBadge>
        ) : (
          <WorkflowStatus status={r.event.status} />
        ),
    },
  ]

  if (events.error) return <ErrorState message={events.error.message} onRetry={events.refetch} />

  return (
    <div>
      <PageHeader
        title="Clinics and Events"
        description="Schedule clinics and webinars, track attendance and notify participants of changes."
        actions={
          <>
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => v && setView(v as 'list' | 'month')}
              variant="outline"
              aria-label="Schedule view"
            >
              <ToggleGroupItem value="list" aria-label="List view">
                <List aria-hidden /> List
              </ToggleGroupItem>
              <ToggleGroupItem value="month" aria-label="Month view">
                <CalendarDays aria-hidden /> Month
              </ToggleGroupItem>
            </ToggleGroup>
            <Button onClick={() => setSelected(blankEvent())}>
              <Plus aria-hidden /> New event
            </Button>
          </>
        }
      />
      {view === 'list' ? (
        <DataTable
          caption="Events"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.event.id}
          isLoading={events.isLoading}
          onRowClick={(r) => setSelected(r.event)}
          initialSort={{ key: 'when', dir: 'asc' }}
        />
      ) : (
        <MonthView rows={rows} onPick={setSelected} />
      )}
      <Sheet open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.id ? selected.title : 'New event'}</SheetTitle>
                <SheetDescription>
                  {selected.id
                    ? formatDateTime(selected.startsAt)
                    : 'Set the schedule, facilitator and eligibility.'}
                </SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6">
                {selected.id ? (
                  <Tabs defaultValue="edit">
                    <TabsList>
                      <TabsTrigger value="edit">Details</TabsTrigger>
                      <TabsTrigger value="attendance">Attendance</TabsTrigger>
                      <TabsTrigger value="change">Time and cancel</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit" className="pt-3">
                      <Form
                        selected={selected}
                        facilitators={facilitators}
                        courses={courses.data ?? []}
                        resources={resources.data?.resources ?? []}
                        onDone={() => setSelected(null)}
                      />
                    </TabsContent>
                    <TabsContent value="attendance" className="pt-3">
                      <Attendance eventId={selected.id} />
                    </TabsContent>
                    <TabsContent value="change" className="pt-3">
                      <ChangeTime event={selected} onDone={() => setSelected(null)} />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <Form
                    selected={selected}
                    facilitators={facilitators}
                    courses={courses.data ?? []}
                    resources={resources.data?.resources ?? []}
                    onDone={() => setSelected(null)}
                  />
                )}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Form({
  selected,
  facilitators,
  courses,
  resources,
  onDone,
}: {
  selected: ClinicEvent
  facilitators: { id: string; name: string }[]
  courses: { course: { id: string; title: string } }[]
  resources: { id: string; title: string }[]
  onDone: () => void
}) {
  return (
    <EventForm
      key={selected.id || 'new'}
      initial={selected}
      facilitators={facilitators}
      courses={courses.map((c) => c.course)}
      resources={resources}
      onSaved={onDone}
    />
  )
}

function MonthView({ rows, onPick }: { rows: Row[]; onPick: (e: ClinicEvent) => void }) {
  const [cursor, setCursor] = useState({ y: 2026, m: 10 })
  const first = new Date(Date.UTC(cursor.y, cursor.m, 1))
  const lead = (first.getUTCDay() + 6) % 7
  const days = new Date(Date.UTC(cursor.y, cursor.m + 1, 0)).getUTCDate()
  const cells = Array.from({ length: Math.ceil((lead + days) / 7) * 7 }, (_, i) => i - lead + 1)
  const label = first.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  const step = (d: number) =>
    setCursor((c) => {
      const n = new Date(Date.UTC(c.y, c.m + d, 1))
      return { y: n.getUTCFullYear(), m: n.getUTCMonth() }
    })
  const on = (day: number) =>
    rows.filter((r) => {
      const d = new Date(r.event.startsAt)
      return (
        d.getUTCFullYear() === cursor.y && d.getUTCMonth() === cursor.m && d.getUTCDate() === day
      )
    })

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading font-semibold text-navy">{label}</h2>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous month"
            onClick={() => step(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Next month" onClick={() => step(1)}>
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border text-xs">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="bg-surface p-2 text-center font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {cells.map((day) => {
          const evs = day >= 1 && day <= days ? on(day) : []
          return (
            <div key={day} className="min-h-16 bg-card p-1 sm:min-h-24 sm:p-1.5">
              {day >= 1 && day <= days ? (
                <span className="text-muted-foreground">{day}</span>
              ) : null}
              {evs.map((r) => (
                <button
                  key={r.event.id}
                  type="button"
                  onClick={() => onPick(r.event)}
                  className="mt-1 block w-full truncate rounded bg-blue-50 px-1 py-0.5 text-start text-[11px] text-blue-600 hover:bg-blue-100"
                  title={r.event.title}
                >
                  {r.event.title}
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
