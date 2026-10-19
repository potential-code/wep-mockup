import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAttachResource } from '@/queries/resources.queries'

export function AttachActionDialog({
  open,
  onOpenChange,
  resourceId,
  actions,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  resourceId: string
  actions: { id: string; title: string; linkedResourceIds: string[] }[]
}) {
  const [actionId, setActionId] = useState('')
  const attach = useAttachResource()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach as a reference</DialogTitle>
          <DialogDescription>
            Choose a company action to link this resource to. It appears under the action’s
            references.
          </DialogDescription>
        </DialogHeader>
        {actions.length === 0 ? (
          <p className="text-muted-foreground text-sm">Your company has no actions yet.</p>
        ) : (
          <RadioGroup
            value={actionId}
            onValueChange={setActionId}
            className="max-h-72 gap-2 overflow-y-auto"
          >
            {actions.map((a) => (
              <Label
                key={a.id}
                htmlFor={`act-${a.id}`}
                className="flex items-start gap-3 rounded-lg border p-3 font-normal has-[[data-state=checked]]:border-blue has-[[data-state=checked]]:bg-blue-50"
              >
                <RadioGroupItem id={`act-${a.id}`} value={a.id} className="mt-0.5" />
                <span className="grid gap-0.5">
                  <span className="font-medium text-navy">{a.title}</span>
                  {a.linkedResourceIds.includes(resourceId) ? (
                    <span className="text-muted-foreground text-xs">Already attached</span>
                  ) : null}
                </span>
              </Label>
            ))}
          </RadioGroup>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!actionId || attach.isPending}
            onClick={() =>
              attach.mutate(
                { resourceId, actionId },
                {
                  onSuccess: () => {
                    toast.success('Reference attached to the action')
                    onOpenChange(false)
                    setActionId('')
                  },
                },
              )
            }
          >
            {attach.isPending ? 'Attaching…' : 'Attach reference'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
