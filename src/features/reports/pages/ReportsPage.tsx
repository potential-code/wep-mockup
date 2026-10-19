import { ChevronDown, FileText } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { AccessNotice, EmptyState, ErrorState, PageSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { useCurrentUser } from '@/hooks/use-session'
import { useCompanyReports } from '@/queries/reports.queries'
import { CurrentReportCard } from '../components/CurrentReportCard'
import { HistoryTable } from '../components/HistoryTable'
import { ProgressOverTime } from '../components/ProgressOverTime'
import { YearComparison } from '../components/YearComparison'

const REPORTING_YEAR = 2026

export function ReportsPage() {
  const { can, company } = useCurrentUser()
  const [comparing, setComparing] = useState(false)
  const { data, isLoading, isError, error, refetch } = useCompanyReports()

  if (!can('reports.view'))
    return (
      <AccessNotice
        title="Annual reports are limited to authorised people"
        message="Reports are available to the CEO and administrators with reporting access. If you have a supporting task, open it from your action plan."
      />
    )
  if (isLoading) return <PageSkeleton />
  if (isError || !data)
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
      />
    )

  const year = data.current?.year ?? REPORTING_YEAR
  const past = data.history.filter((r) => r.year !== year)
  const submittedOnly = data.history.filter((r) => r.versions.length > 0)

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <PageHeader
        title="Annual reports"
        description="Prepare your yearly report and keep every submitted version."
      />
      <CurrentReportCard
        year={year}
        report={data.current}
        dueDate={data.dueDate}
        preparer={data.current?.preparerId ? data.people[data.current.preparerId] : undefined}
      />
      <SectionCard title="Report history">
        {past.length ? (
          <HistoryTable rows={past} company={company?.name ?? 'Company'} />
        ) : (
          <EmptyState
            icon={FileText}
            title="No earlier reports"
            description="Your first submitted report will appear here."
          />
        )}
      </SectionCard>
      {submittedOnly.length ? (
        <Collapsible open={comparing} onOpenChange={setComparing} className="grid gap-6">
          <Button
            variant="outline"
            className="w-fit"
            aria-expanded={comparing}
            onClick={() => setComparing((v) => !v)}
          >
            Compare years <ChevronDown className={comparing ? 'rotate-180' : ''} aria-hidden />
          </Button>
          <CollapsibleContent className="grid gap-6">
            <YearComparison reports={submittedOnly} />
            <ProgressOverTime reports={submittedOnly} />
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </div>
  )
}
