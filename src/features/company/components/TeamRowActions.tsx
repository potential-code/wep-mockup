import { fullName } from '@shared/permissions'
import { DEPARTMENTS } from '@shared/reference'
import type { DepartmentId } from '@shared/types'
import { Link, useNavigate } from '@tanstack/react-router'
import { MoreHorizontal, Pencil, RefreshCw, ShieldPlus, UserMinus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrentUser } from '@/hooks/use-session'
import {
  type TeamMember,
  useRemoveAccess,
  useResendInvitation,
  useUpdateDepartment,
} from '@/queries/company.queries'

/** Per-person management actions: resend, edit department, assign administrator, remove access. */
export function TeamRowActions({ member }: { member: TeamMember }) {
  const { user, company, can } = useCurrentUser()
  const navigate = useNavigate()
  const resend = useResendInvitation()
  const remove = useRemoveAccess()
  const [editing, setEditing] = useState(false)
  const [removing, setRemoving] = useState(false)
  const name = fullName(member)
  const isSelf = member.id === user?.id
  const removed = member.suspended || member.invitationStatus === 'revoked'
  if (member.role === 'ceo' || removed) return null

  const canResend = member.invitationStatus === 'pending' || member.invitationStatus === 'expired'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${name}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canResend ? (
            <DropdownMenuItem
              onSelect={() =>
                resend.mutate(member.id, {
                  onSuccess: (inv) =>
                    toast.success(`Invitation resent to ${member.email}`, {
                      action: {
                        label: 'Open invitation (demo)',
                        onClick: () =>
                          navigate({ to: '/invite/$token', params: { token: inv.token } }),
                      },
                    }),
                })
              }
            >
              <RefreshCw /> Resend invitation
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onSelect={() => setEditing(true)}>
            <Pencil /> Edit department
          </DropdownMenuItem>
          {can('company.delegate') && member.invitationStatus === 'accepted' ? (
            <DropdownMenuItem asChild>
              <Link to="/portal/company/permissions" search={{ user: member.id }}>
                <ShieldPlus /> Assign administrator
              </Link>
            </DropdownMenuItem>
          ) : null}
          {!isSelf ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setRemoving(true)}>
                <UserMinus /> Remove company access
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <EditDepartmentDialog member={member} open={editing} onOpenChange={setEditing} />
      <ConfirmDialog
        open={removing}
        onOpenChange={setRemoving}
        title={`Remove ${name}’s company access?`}
        description={
          <p>
            {name} will no longer be able to open the {company?.name} workspace. Their past
            contributions, evidence and activity are kept for reporting history.
          </p>
        }
        confirmLabel="Remove access"
        destructive
        pending={remove.isPending}
        onConfirm={() =>
          remove.mutate(member.id, {
            onSuccess: () => {
              toast.success(`${name}’s access was removed. History is kept.`)
              setRemoving(false)
            },
          })
        }
      />
    </>
  )
}

function EditDepartmentDialog({
  member,
  open,
  onOpenChange,
}: {
  member: TeamMember
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [dept, setDept] = useState<DepartmentId | undefined>(member.department)
  const update = useUpdateDepartment()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit department for {fullName(member)}</DialogTitle>
          <DialogDescription>
            Department changes the learning path and clinics recommended to this person.
          </DialogDescription>
        </DialogHeader>
        <Select value={dept} onValueChange={(v) => setDept(v as DepartmentId)}>
          <SelectTrigger className="w-full" aria-label="Department">
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
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!dept || update.isPending}
            onClick={() =>
              dept &&
              update.mutate(
                { userId: member.id, department: dept },
                {
                  onSuccess: () => {
                    toast.success('Department updated')
                    onOpenChange(false)
                  },
                },
              )
            }
          >
            {update.isPending ? 'Saving…' : 'Save department'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
