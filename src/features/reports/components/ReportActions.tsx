import type { AnnualReport } from '@shared/types'
import { FlaskConical, Loader2, Send, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useFillSampleReport, useRequestApproval } from '@/queries/reports.queries'

/** Role-aware primary actions for the report header. */
export function ReportActions({
  report,
  editable,
  canPrepare,
  canSubmit,
  remaining,
  onSubmit,
  onFilled,
}: {
  report: AnnualReport
  editable: boolean
  canPrepare: boolean
  canSubmit: boolean
  remaining: number
  onSubmit: () => void
  onFilled: () => void
}) {
  const approval = useRequestApproval()
  const fill = useFillSampleReport()
  if (!editable) return null
  const blocked = remaining > 0
  const hint = blocked
    ? `${remaining} section${remaining === 1 ? '' : 's'} still to complete`
    : undefined
  const showApproval = canPrepare && report.status !== 'ready_for_approval'
  return (
    <div className="grid justify-items-end gap-1.5">
      <div className="flex flex-wrap justify-end gap-2">
        {blocked && canPrepare ? (
          <Button
            type="button"
            variant="outline"
            className="hover:border-gold/60"
            disabled={fill.isPending}
            onClick={() =>
              fill.mutate(report.year, {
                onSuccess: () => {
                  onFilled()
                  toast.success('Sample answers added. Review them, then submit.')
                },
              })
            }
          >
            {fill.isPending ? <Loader2 className="animate-spin" /> : <FlaskConical />}
            Fill with sample answers
          </Button>
        ) : null}
        {showApproval ? (
          <Button
            type="button"
            variant={canSubmit ? 'outline' : 'default'}
            disabled={blocked || approval.isPending}
            onClick={() =>
              approval.mutate(report.year, {
                onSuccess: () => toast.success('Sent to the CEO for approval'),
              })
            }
          >
            {approval.isPending ? <Loader2 className="animate-spin" /> : <UserCheck />}
            {approval.isPending ? 'Sending…' : 'Request CEO approval'}
          </Button>
        ) : null}
        {canSubmit ? (
          <Button type="button" disabled={blocked} onClick={onSubmit}>
            <Send /> Review and submit
          </Button>
        ) : null}
      </div>
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      {report.status === 'ready_for_approval' && !canSubmit ? (
        <p className="text-muted-foreground text-xs">Waiting for the CEO to review and submit.</p>
      ) : null}
    </div>
  )
}
