import { DEFAULT_ADMIN_PERMISSIONS, DEPARTMENTS } from '@shared/reference'
import type { CompanyPermission, DepartmentId } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, Copy, ExternalLink, Mail } from 'lucide-react'
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
import { useCurrentUser } from '@/hooks/use-session'
import { useInviteUser } from '@/queries/company.queries'
import { FormField } from './FormField'
import { PermissionToggles } from './PermissionToggles'

interface Sent {
  token: string
  email: string
  name: string
}

const EMPTY = { firstName: '', lastName: '', email: '', department: '' as DepartmentId | '' }

/**
 * Invite a colleague. Once sent, the simulated invitation link is shown so the demo can continue
 * by accepting it. Only the CEO can also make the invitee an administrator.
 */
export function InviteDialog({
  open,
  onOpenChange,
  adminByDefault = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  adminByDefault?: boolean
}) {
  const { can } = useCurrentUser()
  const invite = useInviteUser()
  const [form, setForm] = useState(EMPTY)
  const [asAdmin, setAsAdmin] = useState(adminByDefault)
  const [perms, setPerms] = useState<CompanyPermission[]>(DEFAULT_ADMIN_PERMISSIONS)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [sent, setSent] = useState<Sent | null>(null)

  const close = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      setTimeout(() => {
        setSent(null)
        setForm(EMPTY)
        setErrors({})
        setServerError('')
        setAsAdmin(adminByDefault)
        setPerms(DEFAULT_ADMIN_PERMISSIONS)
      }, 200)
    }
  }

  const submit = async () => {
    const next: Record<string, string> = {}
    if (!form.firstName.trim()) next.firstName = 'Enter a first name.'
    if (!form.lastName.trim()) next.lastName = 'Enter a last name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid work email.'
    if (!form.department) next.department = 'Choose a department.'
    setErrors(next)
    setServerError('')
    if (Object.keys(next).length) return
    try {
      const res = await invite.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        department: form.department as DepartmentId,
        asAdmin,
        permissions: asAdmin ? perms : undefined,
      })
      setSent({
        token: res.invitation.token,
        email: res.invitation.email,
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      })
      toast.success(`Invitation sent to ${form.email}`)
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'The invitation couldn’t be sent.')
    }
  }

  const link = sent ? `${window.location.origin}/invite/${sent.token}` : ''

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {sent ? (
          <>
            <DialogHeader>
              <span className="mb-1 grid size-11 place-items-center rounded-full bg-success-soft text-success">
                <CheckCircle2 aria-hidden />
              </span>
              <DialogTitle>Invitation sent to {sent.name}</DialogTitle>
              <DialogDescription>
                A simulated email went to {sent.email}. In this demo you can open the invitation
                yourself to continue as the new colleague.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 rounded-xl border bg-surface p-3 text-sm">
              <p className="flex items-center gap-2 font-medium text-navy">
                <Mail className="size-4" aria-hidden /> Invitation link
              </p>
              <code className="break-all rounded-md bg-card p-2 text-xs">{link}</code>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link to="/invite/$token" params={{ token: sent.token }}>
                    <ExternalLink aria-hidden /> Open invitation (demo)
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(link)
                    toast.success('Link copied')
                  }}
                >
                  <Copy aria-hidden /> Copy link
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => close(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form
            className="grid gap-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              void submit()
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {adminByDefault ? 'Invite a new administrator' : 'Invite a colleague'}
              </DialogTitle>
              <DialogDescription>
                They receive an email to join your company on the portal. Their department drives
                learning recommendations.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="inv-first" label="First name" required error={errors.firstName}>
                <Input
                  id="inv-first"
                  autoComplete="off"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </FormField>
              <FormField id="inv-last" label="Last name" required error={errors.lastName}>
                <Input
                  id="inv-last"
                  autoComplete="off"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </FormField>
            </div>
            <FormField id="inv-email" label="Work email" required error={errors.email}>
              <Input
                id="inv-email"
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>
            <FormField id="inv-dept" label="Department" required error={errors.department}>
              <Select
                value={form.department}
                onValueChange={(v) => setForm({ ...form, department: v as DepartmentId })}
              >
                <SelectTrigger id="inv-dept" className="w-full">
                  <SelectValue placeholder="Choose a department" />
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
            {can('company.delegate') ? (
              <div className="grid gap-3 rounded-xl border p-3">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="inv-admin" className="font-medium text-navy text-sm">
                    Make administrator
                    <span className="block font-normal text-muted-foreground text-xs">
                      Give them company management rights you choose below.
                    </span>
                  </label>
                  <Switch id="inv-admin" checked={asAdmin} onCheckedChange={setAsAdmin} />
                </div>
                {asAdmin ? (
                  <PermissionToggles value={perms} onChange={setPerms} idPrefix="inv" />
                ) : null}
              </div>
            ) : null}
            {serverError ? (
              <p role="alert" className="rounded-lg bg-danger-soft p-3 text-danger text-sm">
                {serverError}
              </p>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={invite.isPending}>
                {invite.isPending ? 'Sending…' : 'Send invitation'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
