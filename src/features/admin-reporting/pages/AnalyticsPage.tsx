import { useMemo, useState } from 'react'
import { SectionCard } from '@/components/shared/Cards'
import { EmptyState } from '@/components/shared/States'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAnalytics } from '@/queries/admin.queries'
import { ChartCard } from '../components/ChartCard'
import { BarsChart, TrendChart } from '../components/charts'
import { useReportingFilters } from '../components/filters'
import { DefinitionsList } from '../components/MetricInfo'
import { QueryState } from '../components/QueryState'
import { ReportingShell } from '../components/ReportingShell'
import { cell, chartVal } from '../components/suppress'

export function AnalyticsPage() {
  const { filters, suppress } = useReportingFilters()
  const q = useAnalytics(filters)
  const d = q.data
  const [view, setView] = useState('trends')

  const maxSteps = Math.max(0, ...(d?.pathways.map((p) => p.steps.length) ?? [0]))
  const completion = useMemo(
    () =>
      (d?.pathways ?? []).map((p) => {
        const last = p.steps[p.steps.length - 1]
        const hidden = (suppress && p.assigned < 5) || p.assigned === 0
        return {
          department: p.department,
          completion: hidden || !last ? 0 : Math.round((last.reached / p.assigned) * 100),
        }
      }),
    [d, suppress],
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
            <Tabs value={view} onValueChange={setView}>
              <TabsList
                className="max-w-full flex-wrap group-data-[orientation=horizontal]/tabs:h-auto"
                aria-label="Analytics view"
              >
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="mentors">Mentor engagement</TabsTrigger>
                <TabsTrigger value="pathways">Pathway drop-off</TabsTrigger>
                <TabsTrigger value="resources">Resource use</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
              </TabsList>
            </Tabs>
            {view === 'trends' ? (
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
            ) : null}
            {view === 'mentors' ? (
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
            ) : null}

            {view === 'pathways' ? (
              <ChartCard
                title="Pathway drop-off by department"
                description="Share of assigned learners who reached the last lesson of their path."
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
              >
                <BarsChart
                  horizontal
                  labelWidth={150}
                  data={completion}
                  xKey="department"
                  series={[{ key: 'completion', label: 'Reached last lesson (%)' }]}
                />
              </ChartCard>
            ) : null}

            {view === 'resources' ? (
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
            ) : null}
            {view === 'departments' ? (
              <ChartCard
                title="Department comparison"
                description="Groups under 5 are suppressed."
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
            ) : null}

            <SectionCard
              title="Metric definitions and denominators"
              description="Used by every view above."
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
