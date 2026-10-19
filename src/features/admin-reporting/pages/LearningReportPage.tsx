import { useMemo } from 'react'
import { SectionCard } from '@/components/shared/Cards'
import type { Column } from '@/components/shared/DataTable'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate, formatPercent } from '@/lib/format'
import { useLearningReport } from '@/queries/admin.queries'
import { ChartCard } from '../components/ChartCard'
import { BarsChart, FunnelBars, TrendChart } from '../components/charts'
import { DetailSheet } from '../components/DetailSheet'
import { useReportingFilters, useUrlParam } from '../components/filters'
import { QueryState, Stat } from '../components/QueryState'
import { ReportingShell } from '../components/ReportingShell'
import { ReportTable } from '../components/ReportTable'
import { cell } from '../components/suppress'

type Data = NonNullable<ReturnType<typeof useLearningReport>['data']>
type CourseRow = Data['courses'][number]
type EventRow = Data['events'][number]
type DeptRow = Data['departments'][number]

const rate = (n: number, d: number) => (d ? formatPercent((n / d) * 100) : '—')

export function LearningReportPage() {
  const { filters, suppress } = useReportingFilters()
  const q = useLearningReport(filters)
  const [eventId, setEventId] = useUrlParam('event')
  const [courseId, setCourseId] = useUrlParam('course')
  const [tab, setTab] = useUrlParam('tab')
  const d = q.data

  const courseCols = useMemo<Column<CourseRow>[]>(
    () => [
      {
        key: 'c',
        header: 'Course',
        sortValue: (r) => r.course.title,
        cell: (r) => <span className="font-medium text-navy">{r.course.title}</span>,
      },
      {
        key: 'enrolled',
        header: 'Enrolled',
        sortValue: (r) => r.enrolled,
        cell: (r) => r.enrolled,
      },
      { key: 'done', header: 'Completed', sortValue: (r) => r.completed, cell: (r) => r.completed },
      {
        key: 'rate',
        header: 'Completion rate',
        sortValue: (r) => (r.enrolled ? r.completed / r.enrolled : 0),
        exportValue: (r) => rate(r.completed, r.enrolled),
        cell: (r) => rate(r.completed, r.enrolled),
      },
      {
        key: 'lessons',
        header: 'Lessons',
        sortValue: (r) => r.course.lessons.length,
        cell: (r) => r.course.lessons.length,
        hideOnMobile: true,
      },
    ],
    [],
  )
  const eventCols = useMemo<Column<EventRow>[]>(
    () => [
      {
        key: 'e',
        header: 'Event',
        sortValue: (r) => r.event.title,
        cell: (r) => <span className="font-medium text-navy">{r.event.title}</span>,
      },
      {
        key: 'date',
        header: 'Date',
        sortValue: (r) => r.event.startsAt,
        exportValue: (r) => r.event.startsAt.slice(0, 10),
        cell: (r) => formatDate(r.event.startsAt),
      },
      {
        key: 'reg',
        header: 'Registered',
        sortValue: (r) => r.registered,
        cell: (r) => r.registered,
      },
      { key: 'att', header: 'Attended', sortValue: (r) => r.attended, cell: (r) => r.attended },
      {
        key: 'rating',
        header: 'Feedback',
        sortValue: (r) => r.rating ?? 0,
        exportValue: (r) => r.rating?.toFixed(1),
        cell: (r) => (r.rating ? `${r.rating.toFixed(1)} / 5 (${r.feedbackCount})` : '—'),
      },
      {
        key: 'st',
        header: 'Status',
        sortValue: (r) => r.event.status,
        cell: (r) => <WorkflowStatus status={r.event.status} />,
      },
      {
        key: 'ns',
        header: 'No-shows',
        sortValue: (r) => r.noShow,
        cell: (r) => r.noShow,
        hideOnMobile: true,
      },
    ],
    [],
  )
  const deptCols = useMemo<Column<DeptRow>[]>(
    () => [
      { key: 'd', header: 'Department', sortValue: (r) => r.department, cell: (r) => r.department },
      {
        key: 'l',
        header: 'Learners',
        sortValue: (r) => r.learners,
        exportValue: (r) => cell(r.learners, suppress),
        cell: (r) => cell(r.learners, suppress),
      },
      {
        key: 'c',
        header: 'Completed path',
        sortValue: (r) => r.completed,
        exportValue: (r) => cell(r.completed, suppress),
        cell: (r) => cell(r.completed, suppress),
      },
      {
        key: 'r',
        header: 'Clinic ready',
        sortValue: (r) => r.ready,
        exportValue: (r) => cell(r.ready, suppress),
        cell: (r) => cell(r.ready, suppress),
      },
      {
        key: 'g',
        header: 'Registered',
        sortValue: (r) => r.registered,
        exportValue: (r) => cell(r.registered, suppress),
        cell: (r) => cell(r.registered, suppress),
      },
    ],
    [suppress],
  )

  const course = d?.courses.find((c) => c.course.id === courseId)
  const event = d?.events.find((e) => e.event.id === eventId)
  const t = d?.totals

  return (
    <ReportingShell
      title="Learning and clinics"
      description="Open a course or event for the breakdown."
    >
      <QueryState isLoading={q.isLoading} isError={q.isError} refetch={q.refetch} hasData={!!d}>
        {d && t ? (
          <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Activated learners" value={t.learners} />
              <Stat
                label="Completed path"
                value={t.completed}
                hint={rate(t.completed, t.learners)}
              />
              <Stat label="Clinic ready" value={t.ready} hint={rate(t.ready, t.learners)} />
              <Stat
                label="Attendance rate"
                value={rate(t.attended, t.attendanceBase)}
                hint={`${t.attended} of ${t.attendanceBase} registered, completed events`}
              />
            </div>

            <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-5">
              <ChartCard
                className="lg:col-span-3"
                title="Monthly learning and clinic activity"
                description="Lessons, path completions and attendance."
                metric="path_completion"
                table={{
                  headers: ['Month', 'Lessons completed', 'Path completions', 'Attendance'],
                  rows: d.trend.map((r) => [r.month, r.lessons, r.completions, r.attendance]),
                }}
              >
                <TrendChart
                  data={d.trend}
                  xKey="month"
                  series={[
                    { key: 'lessons', label: 'Lessons completed' },
                    { key: 'completions', label: 'Path completions' },
                    { key: 'attendance', label: 'Attendance' },
                  ]}
                />
              </ChartCard>
              <ChartCard
                className="lg:col-span-2"
                title="Learner to attendee funnel"
                description="Distinct learners at each stage."
                metric="readiness"
                table={{
                  headers: ['Stage', 'Count'],
                  rows: [
                    ['Activated learners', t.learners],
                    ['Completed path', t.completed],
                    ['Clinic ready', t.ready],
                    ['Registrations (all events)', t.registered],
                    ['Attended', t.attended],
                  ],
                }}
              >
                <FunnelBars
                  stages={[
                    { label: 'Activated learners', value: t.learners },
                    { label: 'Completed path', value: t.completed },
                    { label: 'Clinic ready', value: t.ready },
                    { label: 'Registrations (all events, not a subset)', value: t.registered },
                    { label: 'Attended', value: t.attended },
                  ]}
                />
              </ChartCard>
            </div>

            <Tabs
              value={tab ?? 'courses'}
              onValueChange={(v) => setTab(v === 'courses' ? undefined : v)}
            >
              <TabsList>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="events">Events and clinics</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
              </TabsList>
              <TabsContent value="courses" className="mt-4">
                <ReportTable
                  title="Courses"
                  columns={courseCols}
                  rows={d.courses}
                  getRowId={(r) => r.course.id}
                  searchText={(r) => r.course.title}
                  searchLabel="Search courses"
                  onRowClick={(r) => setCourseId(r.course.id)}
                />
              </TabsContent>
              <TabsContent value="events" className="mt-4">
                <ReportTable
                  title="Events and clinics"
                  columns={eventCols}
                  rows={d.events}
                  getRowId={(r) => r.event.id}
                  searchText={(r) => r.event.title}
                  searchLabel="Search events"
                  onRowClick={(r) => setEventId(r.event.id)}
                />
              </TabsContent>
              <TabsContent value="departments" className="mt-4">
                <ReportTable
                  title="Departments"
                  columns={deptCols}
                  rows={d.departments}
                  getRowId={(r) => r.department}
                />
              </TabsContent>
            </Tabs>

            <DetailSheet
              open={!!course}
              onClose={() => setCourseId(undefined)}
              title={course?.course.title ?? ''}
              description={
                course ? `${course.enrolled} enrolled · ${course.completed} completed` : undefined
              }
            >
              {course ? (
                <>
                  <SectionCard
                    title="Lesson steps"
                    description="Learners who completed each lesson."
                  >
                    <BarsChart
                      horizontal
                      labelWidth={40}
                      height={Math.max(160, course.steps.length * 40)}
                      data={course.steps}
                      xKey="step"
                      series={[{ key: 'reached', label: 'Completed lesson' }]}
                    />
                    <ol className="mt-3 grid gap-1 text-muted-foreground text-xs">
                      {course.steps.map((s) => (
                        <li key={s.step}>
                          {s.step}: {s.title} ({s.reached})
                        </li>
                      ))}
                    </ol>
                  </SectionCard>
                  <SectionCard title="By department">
                    <ul className="grid gap-1.5 text-sm">
                      {course.byDepartment.map((r) => (
                        <li key={r.department} className="flex justify-between">
                          <span>{r.department}</span>
                          <span className="tabular-nums">
                            {cell(r.enrolled, suppress)} enrolled · {cell(r.completed, suppress)}{' '}
                            completed
                          </span>
                        </li>
                      ))}
                      {course.byDepartment.length === 0 ? (
                        <li className="text-muted-foreground">No enrolments in this scope.</li>
                      ) : null}
                    </ul>
                  </SectionCard>
                </>
              ) : null}
            </DetailSheet>
            <DetailSheet
              open={!!event}
              onClose={() => setEventId(undefined)}
              title={event?.event.title ?? ''}
              description={
                event
                  ? `${formatDate(event.event.startsAt)} · ${event.registered} registered · ${event.attended} attended`
                  : undefined
              }
            >
              {event ? (
                <SectionCard title="Registrants and feedback">
                  {event.registrants.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No registrations in this scope.</p>
                  ) : (
                    <ul className="divide-y">
                      {event.registrants.map((r) => (
                        <li key={r.id} className="grid gap-0.5 py-2.5 text-sm">
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-medium text-navy">{r.name}</span>
                            <WorkflowStatus status={r.status} />
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {r.companyName}
                            {r.rating ? ` · rated ${r.rating}/5` : ''}
                          </span>
                          {r.comment ? <span className="text-xs">“{r.comment}”</span> : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </SectionCard>
              ) : null}
            </DetailSheet>
          </div>
        ) : null}
      </QueryState>
    </ReportingShell>
  )
}
