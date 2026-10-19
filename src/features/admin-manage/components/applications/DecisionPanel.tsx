import type { Application } from '@shared/types'
import { CheckCircle2, MessageSquareWarning, PlayCircle, XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { celebrate } from '@/components/motion/Celebrate'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  useApproveApplication,
  useRejectApplication,
  useRequestInformation,
  useStartReview,
} from '@/queries/applications.queries'
import { EmailPreview, type EmailPreviewData } from './EmailPreview'

const DECIDABLE = ['submitted', 'under_review', 'resubmitted']

export function DecisionPanel({
  app,
  onApproved,
}: {
  app: Application
  onApproved: (companyId: string) => void
}) {
  const [dialog, setDialog] = useState<'approve' | 'info' | 'reject' | null>(null)
  const start = useStartReview()
  const approve = useApproveApplication()
  const canDecide = DECIDABLE.includes(app.status)

  return (
    <>
      {canDecide ? (
        <div className="grid gap-2">
          {app.status !== 'under_review' ? (
            <Button
              variant="outline"
              onClick={() => start.mutate(app.id)}
              disabled={start.isPending}
            >
              <PlayCircle aria-hidden /> Start review
            </Button>
          ) : null}
          <Button onClick={() => setDialog('approve')}>
            <CheckCircle2 aria-hidden /> Approve
          </Button>
          <Button variant="outline" onClick={() => setDialog('info')}>
            <MessageSquareWarning aria-hidden /> Request information
          </Button>
          <Button variant="outline" className="text-danger" onClick={() => setDialog('reject')}>
            <XCircle aria-hidden /> Not approved
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          {app.status === 'information_requested'
            ? 'Waiting for the applicant to respond. The application returns here as Resubmitted.'
            : 'A decision has been recorded for this application.'}
        </p>
      )}
      {/* Dialogs stay mounted so confirmation previews survive the status change. */}
      <ConfirmDialog
        open={dialog === 'approve'}
        onOpenChange={(o) => !o && setDialog(null)}
        title={`Approve ${app.data.company.name}?`}
        description="The company workspace will be activated and a CEO account created for the executive named in the application. They will be notified."
        confirmLabel="Approve and activate"
        pending={approve.isPending}
        onConfirm={async () => {
          const res = await approve.mutateAsync(app.id)
          setDialog(null)
          celebrate()
          onApproved(res.company.id)
        }}
      />
      <InfoDialog app={app} open={dialog === 'info'} onClose={() => setDialog(null)} />
      <RejectDialog app={app} open={dialog === 'reject'} onClose={() => setDialog(null)} />
    </>
  )
}

function InfoDialog({
  app,
  open,
  onClose,
}: {
  app: Application
  open: boolean
  onClose: () => void
}) {
  const request = useRequestInformation()
  const [item, setItem] = useState('')
  const [message, setMessage] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [tried, setTried] = useState(false)
  const [email, setEmail] = useState<EmailPreviewData | null>(null)

  const close = () => {
    onClose()
    setItem('')
    setMessage('')
    setDueDate('')
    setTried(false)
    setEmail(null)
  }
  const send = async () => {
    setTried(true)
    if (!item.trim() || !message.trim()) return
    const res = await request.mutateAsync({
      id: app.id,
      item: item.trim(),
      message: message.trim(),
      dueDate: dueDate ? new Date(`${dueDate}T23:59:00`).toISOString() : undefined,
    })
    toast.success('Information requested. The applicant has been notified.')
    setEmail(res.emailPreview)
  }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request information</DialogTitle>
          <DialogDescription>
            Name exactly what is missing. The applicant sees this on their status page.
          </DialogDescription>
        </DialogHeader>
        {email ? (
          <div className="grid gap-3">
            <EmailPreview email={email} />
            <DialogFooter>
              <Button onClick={close}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="req-item">Missing item</Label>
              <Input
                id="req-item"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                placeholder="e.g. Current legal registration document"
                aria-invalid={tried && !item.trim()}
                className="h-10"
              />
              {tried && !item.trim() ? (
                <p role="alert" className="text-danger text-xs">
                  Name the missing item
                </p>
              ) : null}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="req-msg">Message to the applicant</Label>
              <Textarea
                id="req-msg"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-invalid={tried && !message.trim()}
              />
              {tried && !message.trim() ? (
                <p role="alert" className="text-danger text-xs">
                  Add a short message
                </p>
              ) : null}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="req-due">Respond by (optional)</Label>
              <Input
                id="req-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 sm:max-w-48"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={request.isPending}>
                {request.isPending ? 'Sending…' : 'Send request'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function RejectDialog({
  app,
  open,
  onClose,
}: {
  app: Application
  open: boolean
  onClose: () => void
}) {
  const reject = useRejectApplication()
  const [reason, setReason] = useState('')
  const [tried, setTried] = useState(false)
  const close = () => {
    onClose()
    setReason('')
    setTried(false)
  }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mark as not approved</DialogTitle>
          <DialogDescription>
            A reason is required. The applicant sees it, together with reapply guidance.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="rej-reason">Reason</Label>
          <Textarea
            id="rej-reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-invalid={tried && !reason.trim()}
          />
          {tried && !reason.trim() ? (
            <p role="alert" className="text-danger text-xs">
              A reason is required
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={reject.isPending}
            onClick={async () => {
              setTried(true)
              if (!reason.trim()) return
              await reject.mutateAsync({ id: app.id, reason: reason.trim() })
              toast.success('Application marked as not approved.')
              close()
            }}
          >
            {reject.isPending ? 'Saving…' : 'Confirm not approved'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
