import { useMemo } from 'react'
import { SectionCard } from '@/components/shared/Cards'
import { EmptyState } from '@/components/shared/States'
import { useAnalytics } from '@/queries/admin.queries'
import { ChartCard } from '../components/ChartCard'
import { BarsChart, HeatGrid, TrendChart } from '../components/charts'
import { useReportingFilters } from '../components/filters'
import { DefinitionsList } from '../components/MetricInfo'
import { QueryState } from '../components/QueryState'
import { ReportingShell } from '../components/ReportingShell'
import { cell, chartVal } from '../components/suppress'

export function AnalyticsPage() {
  const { filters, suppress } = useReportingFilters()
  const q = useAnalytics(filters)
  const d = q.data

  const maxSteps = Math.max(0, ...(d?.pathways.map((p) => p.steps.length) ?? [0]))
  const heat = useMemo(
    () =>
      (d?.pathways ?? []).map((p) => ({
        label: p.department,
        cells: Array.from({ length: maxSteps }, (_, i) => {
          const s = p.steps[i]
          if (!s || p.assigned === 0) return { pct: null, text: '—' }
          if (suppress && p.assigned < 5) return { pct: null, text: '<5' }
          const pct = Math.round((s.reached / p.assigned) * 100)
          return { pct, text: `${pct}%` }
        }),
      })),
    [d, maxSteps, suppress],
  )
  const stepNames = Array.from({ length: maxSteps }, (_, i) => (i === 0 ? 'Assigned' : `L${i}`))

  return (
    <ReportingShell
      title="Analytics"
      description="Learning and clinic trends, pathway drop-off, resource use, mentor engagement and department comparisons."
    >
      <QueryState isLoading={q.isLoading} isError={q.isError} refetch={q.refetch} hasData={!!d}>
        {d ? (
          <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
            <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
              <ChartCard
                title="Learning and clinic trends"
                description="Monthly lessons, path completions and confirmed attendance, April–October 2026."
                metric="path_completion"
                table={{
                  headers: ['Month', 'Lessons', 'Path completions', 'Attendance'],
                  rows: d.trend.map((r) => [r.month, r.lessons, r.completions, r.attendance]),
                }}
              >
                <TrendChart
                  data={d.trend}
                  xKey="month"
                  series={[
                    { key: 'lessons', label: 'Lessons' },
                    { key: 'completions', label: 'Path completions' },
                    { key: 'attendance', label: 'Attendance' },
                  ]}
                />
              </ChartCard>
              <ChartCard
                title="Mentor engagement"
                description="Sessions booked, completed and no-shows by month of booking."
                metric="no_show_rate"
                table={{
                  headers: ['Month', 'Booked', 'Completed', 'No-shows'],
                  rows: d.mentorEngagement.map((r) => [r.month, r.booked, r.completed, r.noShows]),
                }}
              >
                <TrendChart
                  type="line"
                  data={d.mentorEngagement}
                  xKey="month"
                  series={[
                    { key: 'booked', label: 'Booked' },
                    { key: 'completed', label: 'Completed' },
                    { key: 'noShows', label: 'No-shows' },
                  ]}
                />
              </ChartCard>
            </div>

            <ChartCard
              title="Pathway drop-off by lesson step"
              description="Share of assigned learners who completed each lesson of their department's designated course."
              metric="drop_off"
              table={{
                headers: ['Department', 'Course', 'Assigned', ...stepNames.slice(1)],
                rows: d.pathways.map((p) => [
                  p.department,
                  p.course,
                  cell(p.assigned, suppress),
                  ...p.steps
                    .slice(1)
                    .map((s) =>
                      suppress && p.assigned < 5 && p.assigned > 0
                        ? '<5 suppressed'
                        : `${s.reached} (${p.assigned ? Math.round((s.reached / p.assigned) * 100) : 0}%)`,
                    ),
                ]),
              }}
              footer="Darker cells mean more learners reached the step. Departments with fewer than 5 learners are suppressed."
            >
              <HeatGrid columns={stepNames} rows={heat} />
            </ChartCard>

            <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
              <ChartCard
                title="Resource use"
                description={`Most-opened resources (${d.resourceEvents} opens in scope).`}
                table={{
                  headers: ['Resource', 'Opens'],
                  rows: d.resourceUse.map((r) => [r.title, r.views]),
                }}
              >
                {d.resourceUse.length === 0 ? (
                  <EmptyState
                    title="No resource opens in this scope"
                    description="Try widening the filters."
                  />
                ) : (
                  <BarsChart
                    horizontal
                    labelWidth={170}
                    data={d.resourceUse.map((r) => ({
                      title: r.title.length > 26 ? `${r.title.slice(0, 25)}…` : r.title,
                      views: r.views,
                    }))}
                    xKey="title"
                    series={[{ key: 'views', label: 'Opens' }]}
                  />
                )}
              </ChartCard>
              <ChartCard
                title="Department comparison"
                description="Learners, path completions and clinic attendance. Groups under 5 are suppressed."
                metric="path_completion"
                table={{
                  headers: [
                    'Department',
                    'Learners',
                    'Completed',
                    'Completion rate',
                    'Attended clinics',
                    'Mentor bookings',
                  ],
                  rows: d.departments.map((r) => [
                    r.department,
                    cell(r.learners, suppress),
                    cell(r.completed, suppress),
                    suppress && r.learners < 5 && r.learners > 0
                      ? '<5 suppressed'
                      : `${r.completionRate}%`,
                    cell(r.attended, suppress),
                    cell(r.mentorBookings, suppress),
                  ]),
                }}
              >
                <BarsChart
                  data={d.departments.map((r) => ({
                    department: r.department,
                    learners: chartVal(r.learners, suppress),
                    completed: chartVal(r.completed, suppress),
                    attended: chartVal(r.attended, suppress),
                  }))}
                  xKey="department"
                  series={[
                    { key: 'learners', label: 'Learners' },
                    { key: 'completed', label: 'Completed' },
                    { key: 'attended', label: 'Attended' },
                  ]}
                />
              </ChartCard>
            </div>

            <SectionCard
              title="Metric definitions and denominators"
              description="Every chart above uses these definitions."
            >
              <DefinitionsList
                metrics={[
                  'path_completion',
                  'clinic_attendance',
                  'drop_off',
                  'no_show_rate',
                  'slot_utilisation',
                  'activated_users',
                ]}
              />
            </SectionCard>
          </div>
        ) : null}
      </QueryState>
    </ReportingShell>
  )
}
