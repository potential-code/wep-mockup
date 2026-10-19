import type { ActionItem } from '@shared/types'
import { CheckCircle2, RotateCcw, Send, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { celebrate } from '@/components/motion/Celebrate'
import { SectionCard } from '@/components/shared/Cards'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useSetActionStatus } from '@/queries/assessment.queries'

const GUIDE: Record<ActionItem['status'], string> = {
  draft: 'A draft is only visible to managers. Send it for CEO review or start work.',
  ceo_review: 'Waiting for the CEO to approve this action before work begins.',
  in_progress: 'Work is underway. Upload evidence to submit it for review.',
  evidence_submitted: 'Evidence is waiting for a manager to accept it or return it.',
  needs_revision: 'Changes were requested. Update the evidence and resubmit.',
  complete: 'Evidence was accepted. This action is complete.',
}

/** Status card with the transitions the signed-in person is allowed to make. */
export function ActionWorkflow({
  action,
  isCeo,
  canManage,
  isAssignee,
}: {
  action: ActionItem
  isCeo: boolean
  canManage: boolean
  isAssignee: boolean
}) {
  const set = useSetActionStatus()
  const [returning, setReturning] = useState(false)
  const [note, setNote] = useState('')
  const move = (status: ActionItem['status'], msg: string, n?: string) =>
    set.mutate(
      { id: action.id, status, note: n },
      {
        onSuccess: () => {
          toast.success(msg)
          if (status === 'complete') celebrate()
          setReturning(false)
          setNote('')
        },
      },
    )
  const s = action.status
  const hasEvidence = action.evidence.length > 0

  return (
    <SectionCard title="Status">
      <div className="grid gap-3">
        <WorkflowStatus status={s} className="w-fit" />
        <p className="text-muted-foreground text-sm">{GUIDE[s]}</p>
        <div className="grid gap-2">
          {s === 'draft' && canManage ? (
            <>
              <Button
                disabled={set.isPending}
                onClick={() => move('ceo_review', 'Sent for CEO review')}
              >
                <Send aria-hidden /> Send for CEO review
              </Button>
              <Button
                variant="outline"
                disabled={set.isPending}
                onClick={() => move('in_progress', 'Work started')}
              >
                Start work
              </Button>
            </>
          ) : null}
          {s === 'ceo_review' && isCeo ? (
            <>
              <Button
                disabled={set.isPending}
                onClick={() => move('in_progress', 'Action approved')}
              >
                <ThumbsUp aria-hidden /> Approve action
              </Button>
              <Button variant="outline" disabled={set.isPending} onClick={() => setReturning(true)}>
                <RotateCcw aria-hidden /> Return for changes
              </Button>
            </>
          ) : null}
          {(s === 'in_progress' || s === 'needs_revision') && (isAssignee || canManage) ? (
            <>
              <Button
                disabled={set.isPending || !hasEvidence}
                onClick={() => move('evidence_submitted', 'Evidence submitted for review')}
              >
                <Send aria-hidden />{' '}
                {s === 'needs_revision' ? 'Resubmit evidence' : 'Submit evidence'}
              </Button>
              {!hasEvidence ? (
                <p className="text-muted-foreground text-xs">Upload at least one file first.</p>
              ) : null}
            </>
          ) : null}
          {s === 'evidence_submitted' && canManage ? (
            <>
              <Button
                disabled={set.isPending}
                onClick={() => move('complete', 'Evidence accepted. Action complete.')}
              >
                <CheckCircle2 aria-hidden /> Accept evidence
              </Button>
              <Button variant="outline" disabled={set.isPending} onClick={() => setReturning(true)}>
                <RotateCcw aria-hidden /> Return for revision
              </Button>
            </>
          ) : null}
          {s === 'needs_revision' && canManage ? (
            <Button
              variant="outline"
              disabled={set.isPending}
              onClick={() => move('in_progress', 'Action reopened')}
            >
              Reopen for work
            </Button>
          ) : null}
        </div>
      </div>
      <Dialog open={returning} onOpenChange={setReturning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return for revision</DialogTitle>
            <DialogDescription>
              Tell the owner what needs to change. This is recorded in the history.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            aria-label="What needs to change"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReturning(false)}>
              Cancel
            </Button>
            <Button
              disabled={set.isPending || !note.trim()}
              onClick={() => move('needs_revision', 'Returned for revision', note.trim())}
            >
              {set.isPending ? 'Sending…' : 'Return action'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionCard>
  )
}
