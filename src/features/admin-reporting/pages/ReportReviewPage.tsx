import { getRouteApi, Link } from '@tanstack/react-router'
import { Building2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { CompanyLogo } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { ReadOnlySections } from '@/features/reports/components/ReadOnlySections'
import { VersionsPanel } from '@/features/reports/components/VersionsPanel'
import { formatDate } from '@/lib/format'
import { useReportForReview } from '@/queries/reports.queries'
import { DecisionPanel } from '../components/report-review/DecisionPanel'

const route = getRouteApi('/_app/admin/reporting/annual-reports/$reportId')

export function ReportReviewPage() {
  const { reportId } = route.useParams()
  const { data, isLoading, isError, error, refetch } = useReportForReview(reportId)

  if (isLoading) return <PageSkeleton />
  if (isError || !data || !data.company)
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
      />
    )

  const { report, company, previous, people } = data
  const last = report.versions[report.versions.length - 1]
  const flagged = report.changeRequests.filter((c) => !c.resolved).map((c) => c.section)

  return (
    <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Reporting', to: '/admin/reporting' },
          { label: 'Annual Reports', to: '/admin/reporting/annual-reports' },
          { label: `${company.name} · ${report.year}` },
        ]}
        title={`${company.name} · ${report.year} report`}
        description="Review the submitted report. Accepted is a review status, not independent verification."
        actions={
          <Button asChild variant="outline">
            <Link to="/admin/reporting/companies/$companyId" params={{ companyId: company.id }}>
              <Building2 /> Company record
            </Link>
          </Button>
        }
        className="mb-0 sm:mb-0"
      />

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-5 shadow-card">
        <CompanyLogo name={company.name} src={company.logo} className="size-14" />
        <div className="min-w-0 flex-1">
          <p className="font-heading font-medium text-lg text-navy">{company.name}</p>
          <p className="text-muted-foreground text-sm">
            {company.country} · {company.sector} · {company.employeeCount.toLocaleString()}{' '}
            employees
          </p>
        </div>
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="text-muted-foreground text-xs">Status</dt>
            <dd>
              <WorkflowStatus status={report.status} />
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Latest version</dt>
            <dd className="font-medium text-navy">
              {last ? `v${last.version} · ${formatDate(last.submittedAt)}` : 'Not submitted'}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Due</dt>
            <dd className="font-medium text-navy">{formatDate(report.dueDate)}</dd>
          </div>
        </dl>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="order-2 grid gap-4 lg:order-1">
          {report.changeRequests.length ? (
            <SectionCard title="Change requests">
              <ul className="grid gap-2 text-sm">
                {report.changeRequests.map((c) => (
                  <li
                    key={c.section + c.at}
                    className="flex flex-wrap justify-between gap-2 rounded-lg border p-3"
                  >
                    <span>
                      <span className="font-semibold text-navy">{c.section}</span>: {c.note}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(c.at)} · {c.resolved ? 'Resolved' : 'Open'}
                    </span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ) : null}
          <ReadOnlySections
            sections={report.sections}
            indicators={report.indicators}
            previous={previous}
            evidence={report}
            people={people}
            flagged={flagged}
          />
        </div>
        <div className="order-1 grid gap-4 lg:sticky lg:top-20 lg:order-2">
          <DecisionPanel report={report} companyName={company.name} />
          <VersionsPanel report={report} people={people} />
        </div>
      </div>
    </div>
  )
}
