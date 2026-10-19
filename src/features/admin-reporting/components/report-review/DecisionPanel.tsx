import type { AnnualReport } from '@shared/types'
import { CheckCircle2, Flag, Play } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SectionCard } from '@/components/shared/Cards'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { ACCEPTED_NOTE } from '@/features/reports/lib'
import { useAcceptReport, useStartReportReview } from '@/queries/reports.queries'
import { RequestChangesDialog } from './RequestChangesDialog'

/** Reviewer decisions: start review, request changes (per section) or accept. */
export function DecisionPanel({
  report,
  companyName,
}: {
  report: AnnualReport
  companyName: string
}) {
  const start = useStartReportReview()
  const accept = useAcceptReport()
  const [changesOpen, setChangesOpen] = useState(false)
  const [acceptOpen, setAcceptOpen] = useState(false)
  const awaiting = report.status === 'submitted' || report.status === 'resubmitted'
  const reviewing = report.status === 'under_review'
  const unresolved = report.changeRequests.filter((c) => !c.resolved)

  return (
    <SectionCard title="Review decision" description={`${companyName} · ${report.year}`}>
      <div className="grid gap-3">
        {awaiting ? (
          <>
            <p className="text-muted-foreground text-sm">
              {report.status === 'resubmitted' ? 'Resubmitted' : 'Submitted'} and waiting for
              review.
            </p>
            <Button
              type="button"
              disabled={start.isPending}
              onClick={() =>
                start.mutate(report.id, { onSuccess: () => toast.success('Review started') })
              }
            >
              <Play /> {start.isPending ? 'Starting…' : 'Start review'}
            </Button>
          </>
        ) : null}
        {reviewing ? (
          <>
            <Button type="button" onClick={() => setAcceptOpen(true)}>
              <CheckCircle2 /> Accept report
            </Button>
            <Button type="button" variant="outline" onClick={() => setChangesOpen(true)}>
              <Flag /> Request changes
            </Button>
          </>
        ) : null}
        {report.status === 'changes_requested' ? (
          <p className="text-muted-foreground text-sm">
            Waiting for {companyName} to revise {unresolved.length} section
            {unresolved.length === 1 ? '' : 's'} and resubmit.
          </p>
        ) : null}
        {report.status === 'accepted' ? (
          <p className="text-muted-foreground text-sm">{ACCEPTED_NOTE}</p>
        ) : null}
        {['draft', 'ready_for_approval', 'not_started'].includes(report.status) ? (
          <p className="text-muted-foreground text-sm">
            Not submitted yet. No review action is available.
          </p>
        ) : null}
        <p className="text-muted-foreground text-xs">
          Accepting records a review status. It is not independent verification of reported
          outcomes.
        </p>
      </div>

      <RequestChangesDialog open={changesOpen} onOpenChange={setChangesOpen} reportId={report.id} />
      <ConfirmDialog
        open={acceptOpen}
        onOpenChange={setAcceptOpen}
        title={`Accept the ${report.year} report?`}
        description={`${companyName} will be notified and can then approve a public summary. ${ACCEPTED_NOTE}`}
        confirmLabel="Accept report"
        pending={accept.isPending}
        onConfirm={() =>
          accept.mutate(report.id, {
            onSuccess: () => {
              setAcceptOpen(false)
              toast.success('Report accepted')
            },
          })
        }
      />
    </SectionCard>
  )
}
