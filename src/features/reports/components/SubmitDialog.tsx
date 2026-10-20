import { Loader2, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { DECLARATION_TEXT } from '../lib'

/** CEO or delegated submitter: review summary, declaration and explicit confirmation. */
export function SubmitDialog({
  open,
  onOpenChange,
  year,
  nextVersion,
  completeCount,
  indicatorCount,
  evidenceCount,
  pending,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  year: number
  nextVersion: number
  completeCount: number
  indicatorCount: number
  evidenceCount: number
  pending: boolean
  onSubmit: (declaration: string) => void
}) {
  const [confirmed, setConfirmed] = useState(false)
  return (
    <Dialog open={open} onOpenChange={(o) => (!pending ? onOpenChange(o) : null)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review and submit the {year} report</DialogTitle>
          <DialogDescription>
            This creates a dated version {nextVersion} snapshot and sends it to UN Women for review.
          </DialogDescription>
        </DialogHeader>
        <ul className="grid grid-cols-3 gap-2 text-center text-xs">
          {[
            [`${completeCount}/7`, 'sections complete'],
            [String(indicatorCount), 'indicators'],
            [String(evidenceCount), 'evidence files'],
          ].map(([n, l]) => (
            <li key={l} className="rounded-lg bg-surface p-3">
              <p className="font-heading font-medium text-lg text-navy">{n}</p>
              <p className="text-muted-foreground">{l}</p>
            </li>
          ))}
        </ul>
        <div className="rounded-xl border bg-blue-50/60 p-4 text-sm">
          <p className="mb-1 flex items-center gap-2 font-semibold text-navy">
            <ShieldCheck className="size-4 text-blue" aria-hidden /> Declaration
          </p>
          <p className="text-navy">{DECLARATION_TEXT}</p>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox
            id="declare"
            checked={confirmed}
            onCheckedChange={(c) => setConfirmed(c === true)}
            className="mt-0.5"
          />
          <Label htmlFor="declare" className="font-normal leading-snug">
            I confirm the declaration above on behalf of the company.
          </Label>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!confirmed || pending}
            onClick={() => onSubmit(DECLARATION_TEXT)}
          >
            {pending ? <Loader2 className="animate-spin" /> : null}
            {pending ? 'Submitting…' : `Submit version ${nextVersion}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
