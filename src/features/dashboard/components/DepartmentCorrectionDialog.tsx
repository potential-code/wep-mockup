import { DEPARTMENTS } from '@shared/reference'
import type { DepartmentId } from '@shared/types'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/features/company/components/FormField'
import { useRequestDepartmentCorrection } from '@/queries/company.queries'

/** Employees ask their focal point to correct a department rather than editing it silently. */
export function DepartmentCorrectionDialog({
  open,
  onOpenChange,
  current,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  current?: DepartmentId
}) {
  const [dept, setDept] = useState<DepartmentId | ''>('')
  const [note, setNote] = useState('')
  const request = useRequestDepartmentCorrection()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a department correction</DialogTitle>
          <DialogDescription>
            Your department sets your learning path and the company’s reporting structure, so your
            WEPs focal point reviews changes.
          </DialogDescription>
        </DialogHeader>
        <FormField id="dc-dept" label="Correct department" required>
          <Select value={dept} onValueChange={(v) => setDept(v as DepartmentId)}>
            <SelectTrigger id="dc-dept" className="w-full">
              <SelectValue placeholder="Choose a department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.filter((d) => d.id !== current).map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField id="dc-note" label="Reason (optional)">
          <Textarea id="dc-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </FormField>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!dept || request.isPending}
            onClick={() =>
              dept &&
              request.mutate(
                { department: dept, note },
                {
                  onSuccess: () => {
                    toast.success('Request sent to your WEPs focal point')
                    setDept('')
                    setNote('')
                    onOpenChange(false)
                  },
                },
              )
            }
          >
            {request.isPending ? 'Sending…' : 'Send request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
