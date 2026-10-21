import {
  Building2,
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/format'
import { useExecutiveDashboard } from '@/queries/admin.queries'
import { ChartCard } from '../components/ChartCard'
import { BarsChart, DonutChart, FunnelBars } from '../components/charts'
import { AttentionQueue } from '../components/dashboard/AttentionQueue'
import { GlobalNetworkCard } from '../components/dashboard/GlobalNetworkCard'
import { InsightPanel } from '../components/dashboard/InsightPanel'
import { KpiTile } from '../components/dashboard/KpiTile'
import { searchProp, useReportingFilters } from '../components/filters'
import { LayerBadge } from '../components/LayerBadge'
import { ReportingShell } from '../components/ReportingShell'
import { cell, chartVal } from '../components/suppress'

const STATUS_LABEL: Record<string, string> = {
  accepted: 'Accepted',
  under_review: 'Under review',
  changes_requested: 'Changes requested',
  submitted: 'Submitted',
  resubmitted: 'Resubmitted',
  draft: 'Draft',
  not_started: 'Not started',
}
const STATUS_COLOR: Record<string, string> = {
  accepted: 'var(--chart-1)',
  under_review: 'var(--chart-4)',
  changes_requested: 'var(--chart-3)',
  submitted: 'var(--chart-2)',
  resubmitted: 'var(--chart-5)',
  draft: '#b9c7d3',
  not_started: '#dde5ec',
}

export function ExecutiveDashboardPage() {
  const { filters, filterSearch, suppress } = useReportingFilters()
  const q = useExecutiveDashboard(filters)
  const search = searchProp(filterSearch)
  const d = q.data
  const [more, setMore] = useState(false)

  const demand = useMemo(
    () =>
      (d?.demand ?? []).map((r) => ({
        department: r.department,
        clinic: chartVal(r.clinic, suppress),
        mentoring: chartVal(r.mentoring, suppress),
      })),
    [d, suppress],
  )

  return (
    <ReportingShell
      title="Executive dashboard"
      eyebrow={d?.period ?? `Reporting year ${filters.year}`}
      description={
        d
          ? `${formatNumber(d.cards.approvedSignatories)} approved signatories, ${formatNumber(d.cards.activatedUsers)} of ${formatNumber(d.cards.invitedUsers)} invited users activated, and ${formatNumber(d.cards.reportsAccepted)} of ${formatNumber(d.cards.reportsRequired)} ${filters.year} annual reports accepted.`
          : 'Programme-wide view of participation, learning and reporting.'
      }
    >
      {q.isLoading ? (
        <PageSkeleton />
      ) : q.isError || !d ? (
        <ErrorState message="Executive metrics could not be loaded." onRetry={() => q.refetch()} />
      ) : (
        <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
          <section aria-labelledby="kpi-heading">
            <h2 id="kpi-heading" className="sr-only">
              Headline metrics
            </h2>
            <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <KpiTile
                metric="approved_signatories"
                label="Approved signatories"
                value={d.cards.approvedSignatories}
                hint="Distinct approved companies."
                icon={ShieldCheck}
                to="/admin/reporting/signatories"
                search={search}
              />
              <KpiTile
                metric="active_companies"
                label="Active companies"
                value={d.cards.activeCompanies}
                hint={`of ${formatNumber(d.cards.approvedSignatories)} approved, active this month.`}
                icon={Building2}
                to="/admin/reporting/companies"
                search={search}
                tone="navy"
              />
              <KpiTile
                metric="activated_users"
                label="Activated users"
                value={d.cards.activatedUsers}
                hint={`${formatNumber(d.cards.activatedUsers)} of ${formatNumber(d.cards.invitedUsers)} invited users`}
                icon={UserCheck}
                to="/admin/reporting/users"
                search={search}
                progress={Math.round(
                  (d.cards.activatedUsers / Math.max(1, d.cards.invitedUsers)) * 100,
                )}
              />
              <KpiTile
                metric="path_completion"
                label="Learning completion"
                value={d.cards.learningCompletion}
                suffix="%"
                decimals={1}
                hint={`${formatNumber(d.cards.completedPaths)} of ${formatNumber(d.cards.activatedUsers)} activated users`}
                icon={GraduationCap}
                to="/admin/reporting/learning"
                search={search}
                progress={d.cards.learningCompletion}
                tone="coral"
              />
              <KpiTile
                metric="clinic_attendance"
                label="Confirmed clinic attendance"
                value={d.cards.clinicAttendance}
                suffix="%"
                decimals={1}
                hint={`${formatNumber(d.cards.clinicAttended)} of ${formatNumber(d.cards.clinicRegistered)} registered`}
                icon={CalendarCheck}
                to="/admin/reporting/learning"
                search={search}
                progress={d.cards.clinicAttendance}
                tone="success"
              />
              <KpiTile
                metric="reporting_completion"
                label="Annual reporting completion"
                value={d.cards.reportingCompletion}
                suffix="%"
                decimals={1}
                hint={`${formatNumber(d.cards.reportsAccepted)} of ${formatNumber(d.cards.reportsRequired)} required ${filters.year} reports accepted`}
                icon={ClipboardCheck}
                to="/admin/reporting/annual-reports"
                search={search}
                progress={d.cards.reportingCompletion}
              />
            </div>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
              Read in layers:
              <LayerBadge layer="activity" />
              <LayerBadge layer="evidence" />
              <LayerBadge layer="outcomes" />
            </p>
          </section>

          <GlobalNetworkCard />

          <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-3">
            <ChartCard
              className="lg:col-span-2"
              title="Company progression funnel"
              description="One cohort, approved companies only after “Approved”."
              metric="funnel"
              table={{
                headers: ['Stage', 'Companies', '% of previous stage'],
                rows: d.funnel.map((s, i) => [
                  s.stage,
                  s.value,
                  i === 0 || !d.funnel[i - 1]?.value
                    ? '—'
                    : `${Math.round((s.value / (d.funnel[i - 1]?.value || 1)) * 100)}%`,
                ]),
              }}
            >
              <FunnelBars
                stages={d.funnel.map((s) => ({ label: s.stage, value: s.value, to: s.to, search }))}
              />
            </ChartCard>
            <ChartCard
              title="Reporting status"
              description={`${filters.year} report status.`}
              metric="reporting_completion"
              table={{
                headers: ['Status', 'Companies'],
                rows: d.statusDist.map((s) => [STATUS_LABEL[s.status] ?? s.status, s.count]),
              }}
            >
              <DonutChart
                data={d.statusDist.map((s) => ({
                  name: STATUS_LABEL[s.status] ?? s.status,
                  value: s.count,
                  color: STATUS_COLOR[s.status],
                }))}
                centerValue={`${d.cards.reportingCompletion}%`}
                centerLabel="accepted"
              />
            </ChartCard>
          </div>

          <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
            <AttentionQueue items={d.attention} search={search} />
            <InsightPanel insights={d.insights} search={search} />
          </div>

          <Button
            variant="outline"
            className="w-fit"
            aria-expanded={more}
            onClick={() => setMore((v) => !v)}
          >
            {more ? 'Hide' : 'Show'} geography and support demand
          </Button>
          {more ? (
            <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
              <ChartCard
                title="Geographic distribution"
                description="Approved signatories by UN Women region."
                metric="approved_signatories"
                table={{
                  headers: ['Region', 'Approved signatories'],
                  rows: d.regions.map((r) => [r.region, r.count]),
                }}
              >
                <BarsChart
                  horizontal
                  labelWidth={150}
                  data={[...d.regions].sort((a, b) => b.count - a.count)}
                  xKey="region"
                  series={[{ key: 'count', label: 'Approved signatories' }]}
                />
              </ChartCard>
              <ChartCard
                title="Support demand by department"
                description="Groups under 5 are suppressed."
                metric="clinic_attendance"
                table={{
                  headers: ['Department', 'Clinic registrations', 'Mentoring bookings'],
                  rows: d.demand.map((r) => [
                    r.department,
                    cell(r.clinic, suppress),
                    cell(r.mentoring, suppress),
                  ]),
                }}
              >
                <BarsChart
                  data={demand}
                  xKey="department"
                  series={[
                    { key: 'clinic', label: 'Clinic registrations' },
                    { key: 'mentoring', label: 'Mentoring bookings' },
                  ]}
                />
              </ChartCard>
            </div>
          ) : null}
        </div>
      )}
    </ReportingShell>
  )
}
