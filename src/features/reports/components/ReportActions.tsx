import type { AnnualReport } from '@shared/types'
import { Loader2, Send, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useRequestApproval } from '@/queries/reports.queries'

/** Role-aware primary actions for the report header. */
export function ReportActions({
  report,
  editable,
  canPrepare,
  canSubmit,
  remaining,
  onSubmit,
}: {
  report: AnnualReport
  editable: boolean
  canPrepare: boolean
  canSubmit: boolean
  remaining: number
  onSubmit: () => void
}) {
  const approval = useRequestApproval()
  if (!editable) return null
  const blocked = remaining > 0
  const hint = blocked
    ? `${remaining} section${remaining === 1 ? '' : 's'} still to complete`
    : undefined
  const showApproval = canPrepare && report.status !== 'ready_for_approval'
  return (
    <div className="grid justify-items-end gap-1.5">
      <div className="flex flex-wrap gap-2">
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
