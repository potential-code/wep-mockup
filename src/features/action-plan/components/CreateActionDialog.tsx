import { fullName } from '@shared/permissions'
import { DEPARTMENTS, PRINCIPLES } from '@shared/reference'
import type { DepartmentId, PrincipleId } from '@shared/types'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/features/company/components/FormField'
import { useCurrentUser } from '@/hooks/use-session'
import { useCreateAction } from '@/queries/assessment.queries'
import { useTeam } from '@/queries/company.queries'

const EMPTY = {
  title: '',
  purpose: '',
  principle: '' as PrincipleId | '',
  ownerId: '',
  department: '' as DepartmentId | '',
  baseline: '',
  target: '',
  dueDate: '',
  evidenceRequired: '',
}

/** Create and assign an action. CEO review is optional and sends it straight to the CEO. */
export function CreateActionDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { user, company } = useCurrentUser()
  const team = useTeam(company?.id)
  const create = useCreateAction()
  const [form, setForm] = useState(EMPTY)
  const [review, setReview] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const owners = (team.data ?? []).filter((m) => m.invitationStatus === 'accepted' && !m.suspended)
  const set = (k: keyof typeof EMPTY) => (v: string) => setForm((f) => ({ ...f, [k]: v }))
  const isCeo = user?.role === 'ceo'

  const submit = () => {
    const req: [keyof typeof EMPTY, string][] = [
      ['title', 'Give the action a title.'],
      ['purpose', 'Explain the purpose.'],
      ['principle', 'Choose a principle.'],
      ['ownerId', 'Choose an owner.'],
      ['department', 'Choose a department.'],
      ['baseline', 'Describe the baseline.'],
      ['target', 'Describe the target.'],
      ['dueDate', 'Set a due date.'],
      ['evidenceRequired', 'Say what evidence is needed.'],
    ]
    const next: Record<string, string> = {}
    for (const [k, msg] of req) if (!String(form[k]).trim()) next[k] = msg
    setErrors(next)
    if (Object.keys(next).length) return
    create.mutate(
      {
        title: form.title.trim(),
        purpose: form.purpose.trim(),
        principle: form.principle as PrincipleId,
        ownerId: form.ownerId,
        department: form.department as DepartmentId,
        baseline: form.baseline.trim(),
        target: form.target.trim(),
        dueDate: new Date(form.dueDate).toISOString(),
        evidenceRequired: form.evidenceRequired.trim(),
        contributorIds: [form.ownerId],
        linkedCourseIds: [],
        linkedResourceIds: [],
        requestCeoReview: review,
      },
      {
        onSuccess: () => {
          toast.success(
            review ? 'Action created and sent for CEO review' : 'Action saved as a draft',
          )
          setForm(EMPTY)
          setReview(false)
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create an action</DialogTitle>
          <DialogDescription>
            Actions start as drafts. Learning can support an action, but only accepted evidence
            marks it complete.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <div className="sm:col-span-2">
            <FormField id="ca-title" label="Title" required error={errors.title}>
              <Input
                id="ca-title"
                value={form.title}
                onChange={(e) => set('title')(e.target.value)}
              />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField id="ca-purpose" label="Purpose" required error={errors.purpose}>
              <Textarea
                id="ca-purpose"
                rows={2}
                value={form.purpose}
                onChange={(e) => set('purpose')(e.target.value)}
              />
            </FormField>
          </div>
          <FormField id="ca-principle" label="Principle" required error={errors.principle}>
            <Select value={String(form.principle)} onValueChange={set('principle')}>
              <SelectTrigger id="ca-principle" className="w-full">
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                {PRINCIPLES.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    P{p.id} · {p.short}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="ca-dept" label="Department" required error={errors.department}>
            <Select value={form.department} onValueChange={set('department')}>
              <SelectTrigger id="ca-dept" className="w-full">
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="ca-owner" label="Owner" required error={errors.ownerId}>
            <Select value={form.ownerId} onValueChange={set('ownerId')}>
              <SelectTrigger id="ca-owner" className="w-full">
                <SelectValue placeholder="Choose a colleague" />
              </SelectTrigger>
              <SelectContent>
                {owners.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {fullName(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="ca-due" label="Due date" required error={errors.dueDate}>
            <Input
              id="ca-due"
              type="date"
              value={form.dueDate}
              onChange={(e) => set('dueDate')(e.target.value)}
            />
          </FormField>
          <FormField id="ca-base" label="Baseline" required error={errors.baseline}>
            <Input
              id="ca-base"
              value={form.baseline}
              onChange={(e) => set('baseline')(e.target.value)}
            />
          </FormField>
          <FormField id="ca-target" label="Target" required error={errors.target}>
            <Input
              id="ca-target"
              value={form.target}
              onChange={(e) => set('target')(e.target.value)}
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField
              id="ca-evidence"
              label="Evidence required"
              required
              error={errors.evidenceRequired}
            >
              <Input
                id="ca-evidence"
                value={form.evidenceRequired}
                onChange={(e) => set('evidenceRequired')(e.target.value)}
              />
            </FormField>
          </div>
          {!isCeo ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border p-3 sm:col-span-2">
              <label htmlFor="ca-review" className="text-navy text-sm">
                Request CEO review
                <span className="block text-muted-foreground text-xs">
                  The CEO approves before work starts.
                </span>
              </label>
              <Switch id="ca-review" checked={review} onCheckedChange={setReview} />
            </div>
          ) : null}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Creating…' : 'Create action'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
