import { ROLE_SHORT } from '@shared/reference'
import type { Invitation, User } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { Ban, Check, Copy, MailPlus, RotateCcw, Search, Send, Sparkles, UserX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoLabel, FilterBar } from '@/components/shared/Cards'
import { type Column, DataTable } from '@/components/shared/DataTable'
import { ErrorState } from '@/components/shared/States'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate } from '@/lib/format'
import {
  useInvitations,
  useInviteMentor,
  useSetInvitationStatus,
  useSetUserSuspended,
  useUsersTable,
} from '@/queries/admin.queries'
import { useAdjustPoints } from '@/queries/learning.queries'
import { Detail, Field, ReasonDialog } from '../components/common'

function UserStatus({ user }: { user: User }) {
  if (user.suspended) return <WorkflowStatus status="suspended" />
  if (user.invitationStatus === 'accepted') return <StatusBadge tone="success">Active</StatusBadge>
  return <WorkflowStatus status={user.invitationStatus} />
}

type UserRow = NonNullable<ReturnType<typeof useUsersTable>['data']>[number]
type InviteRow = NonNullable<ReturnType<typeof useInvitations>['data']>[number]

export function ManageUsersPage() {
  const users = useUsersTable({})
  const invites = useInvitations()
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <div>
      <PageHeader
        title="Users and Invitations"
        description="Manage platform users, expert invitations and points corrections."
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <MailPlus aria-hidden /> Invite mentor / trainer
          </Button>
        }
      />
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations
            {invites.data ? (
              <span className="ms-1 text-muted-foreground text-xs">({invites.data.length})</span>
            ) : null}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="pt-3">
          {users.error ? (
            <ErrorState message={users.error.message} onRetry={users.refetch} />
          ) : (
            <UsersTab rows={users.data ?? []} loading={users.isLoading} />
          )}
        </TabsContent>
        <TabsContent value="invitations" className="pt-3">
          {invites.error ? (
            <ErrorState message={invites.error.message} onRetry={invites.refetch} />
          ) : (
            <InvitationsTab rows={invites.data ?? []} loading={invites.isLoading} />
          )}
        </TabsContent>
      </Tabs>
      <InviteMentorDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}

/* ------------------------------------------------------------------ users -- */

function UsersTab({ rows, loading }: { rows: UserRow[]; loading: boolean }) {
  const [q, setQ] = useState('')
  const [role, setRole] = useState('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (role === 'all' || r.user.role === role) &&
          (!q.trim() ||
            `${r.user.firstName} ${r.user.lastName} ${r.user.email} ${r.companyName}`
              .toLowerCase()
              .includes(q.toLowerCase())),
      ),
    [rows, q, role],
  )
  const open = rows.find((r) => r.user.id === openId)

  const columns: Column<UserRow>[] = [
    {
      key: 'name',
      header: 'User',
      sortValue: (r) => `${r.user.firstName} ${r.user.lastName}`,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={`${r.user.firstName} ${r.user.lastName}`} src={r.user.avatar} />
          <div className="min-w-0">
            <p className="truncate font-medium text-navy">
              {r.user.firstName} {r.user.lastName}
            </p>
            <p className="truncate text-muted-foreground text-xs">{r.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      sortValue: (r) => r.companyName,
      cell: (r) => r.companyName,
    },
    {
      key: 'role',
      header: 'Role',
      sortValue: (r) => r.user.role,
      cell: (r) => ROLE_SHORT[r.user.role],
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => r.user.invitationStatus,
      cell: (r) => <UserStatus user={r.user} />,
    },
    {
      key: 'points',
      header: 'Points',
      align: 'end',
      sortValue: (r) => r.points,
      cell: (r) => r.points,
    },
  ]

  return (
    <>
      <FilterBar count={filtered.length}>
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search
            className="-translate-y-1/2 absolute start-3 top-1/2 size-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email or company"
            aria-label="Search users"
            className="bg-card ps-9"
          />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger aria-label="Filter by role" className="w-full bg-card sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {Object.entries(ROLE_SHORT).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable
        caption="Users"
        columns={columns}
        rows={filtered}
        getRowId={(r) => r.user.id}
        isLoading={loading}
        onRowClick={(r) => setOpenId(r.user.id)}
      />
      <Sheet open={Boolean(open)} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {open ? <UserPanel row={open} /> : null}
        </SheetContent>
      </Sheet>
    </>
  )
}

function UserPanel({ row }: { row: UserRow }) {
  const u = row.user
  const name = `${u.firstName} ${u.lastName}`
  const suspend = useSetUserSuspended()
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [pointsOpen, setPointsOpen] = useState(false)

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-3">
          <UserAvatar name={name} src={u.avatar} className="size-12" />
          <div className="min-w-0">
            <SheetTitle>{name}</SheetTitle>
            <SheetDescription>{u.title}</SheetDescription>
          </div>
        </div>
      </SheetHeader>
      <div className="grid gap-6 px-4 pb-6">
        <dl className="grid grid-cols-2 gap-4">
          <Detail label="Email">
            <span className="break-all">{u.email}</span>
          </Detail>
          <Detail label="Role">{ROLE_SHORT[u.role]}</Detail>
          <Detail label="Company">{row.companyName}</Detail>
          <Detail label="Last active">{formatDate(u.lastActiveAt)}</Detail>
          <Detail label="Lifetime points">{row.points}</Detail>
          <Detail label="Status">
            <UserStatus user={u} />
          </Detail>
        </dl>
        <div className="grid gap-2">
          <Button variant="outline" onClick={() => setPointsOpen(true)}>
            <Sparkles aria-hidden /> Adjust points
          </Button>
          <Button
            variant="outline"
            className={u.suspended ? '' : 'text-danger'}
            onClick={() => setSuspendOpen(true)}
          >
            {u.suspended ? <RotateCcw aria-hidden /> : <UserX aria-hidden />}
            {u.suspended ? 'Reinstate user' : 'Suspend user'}
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          Suspending a user blocks sign-in. Their records, points and history are kept. Every change
          is written to the{' '}
          <Link to="/admin/manage/audit" className="text-blue underline">
            audit log
          </Link>
          .
        </p>
      </div>
      <ReasonDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        title={u.suspended ? `Reinstate ${name}` : `Suspend ${name}`}
        confirmLabel={u.suspended ? 'Reinstate' : 'Suspend user'}
        destructive={!u.suspended}
        pending={suspend.isPending}
        onConfirm={(reason) =>
          suspend.mutate(
            { userId: u.id, suspended: !u.suspended, reason },
            {
              onSuccess: () => {
                toast.success(u.suspended ? 'User reinstated' : 'User suspended')
                setSuspendOpen(false)
              },
            },
          )
        }
      />
      <PointsDialog
        open={pointsOpen}
        onOpenChange={setPointsOpen}
        userId={u.id}
        name={name}
        balance={row.points}
      />
    </>
  )
}

function PointsDialog({
  open,
  onOpenChange,
  userId,
  name,
  balance,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  userId: string
  name: string
  balance: number
}) {
  const adjust = useAdjustPoints()
  const [amount, setAmount] = useState('')
  const n = Number(amount)
  const valid = Number.isInteger(n) && n !== 0
  return (
    <ReasonDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setAmount('')
        onOpenChange(o)
      }}
      title={`Adjust points for ${name}`}
      description={`Current lifetime points: ${balance}. Adjustments are recorded and visible to the user.`}
      confirmLabel="Apply adjustment"
      pending={adjust.isPending}
      onConfirm={(reason) => {
        if (!valid) {
          toast.error('Enter a whole number other than zero, e.g. 25 or -25.')
          return
        }
        adjust.mutate(
          { userId, amount: n, reason },
          {
            onSuccess: () => {
              toast.success(`${n > 0 ? '+' : ''}${n} points applied`)
              setAmount('')
              onOpenChange(false)
            },
          },
        )
      }}
    >
      <Field label="Points (use a minus sign to deduct)" required>
        <Input
          type="number"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 25 or -25"
        />
      </Field>
    </ReasonDialog>
  )
}

/* ------------------------------------------------------------ invitations -- */

function InvitationsTab({ rows, loading }: { rows: InviteRow[]; loading: boolean }) {
  const [scope, setScope] = useState('all')
  const [revoke, setRevoke] = useState<Invitation | null>(null)
  const resend = useSetInvitationStatus()
  const filtered = rows.filter(
    (r) =>
      scope === 'all' ||
      (scope === 'company' ? Boolean(r.invitation.companyId) : !r.invitation.companyId),
  )

  const columns: Column<InviteRow>[] = [
    {
      key: 'who',
      header: 'Invitee',
      sortValue: (r) => r.invitation.email,
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-navy">
            {r.invitation.firstName} {r.invitation.lastName}
          </p>
          <p className="truncate text-muted-foreground text-xs">{r.invitation.email}</p>
        </div>
      ),
    },
    { key: 'role', header: 'Role', cell: (r) => ROLE_SHORT[r.invitation.role] },
    {
      key: 'source',
      header: 'Managed by',
      sortValue: (r) => r.companyName,
      cell: (r) => (
        <span>
          {r.companyName}{' '}
          {r.invitation.companyId ? (
            <StatusBadge tone="neutral" icon={null}>
              Company-managed
            </StatusBadge>
          ) : null}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => r.invitation.status,
      cell: (r) => <WorkflowStatus status={r.invitation.status} />,
    },
    {
      key: 'expires',
      header: 'Expires',
      sortValue: (r) => r.invitation.expiresAt,
      cell: (r) => formatDate(r.invitation.expiresAt),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (r) => {
        const s = r.invitation.status
        if (s === 'accepted') return <span className="text-muted-foreground text-xs">Accepted</span>
        return (
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={resend.isPending}
              onClick={(e) => {
                e.stopPropagation()
                resend.mutate(
                  { id: r.invitation.id, status: 'pending' },
                  { onSuccess: () => toast.success(`Invitation re-sent to ${r.invitation.email}`) },
                )
              }}
            >
              <Send aria-hidden /> {s === 'pending' ? 'Resend' : 'Re-issue'}
            </Button>
            {s === 'pending' ? (
              <Button
                size="sm"
                variant="ghost"
                className="text-danger"
                onClick={(e) => {
                  e.stopPropagation()
                  setRevoke(r.invitation)
                }}
              >
                <Ban aria-hidden /> Revoke
              </Button>
            ) : null}
          </div>
        )
      },
    },
  ]

  return (
    <>
      <FilterBar count={filtered.length}>
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger aria-label="Filter invitations" className="w-full bg-card sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All invitations</SelectItem>
            <SelectItem value="company">Company-managed</SelectItem>
            <SelectItem value="expert">Mentors and trainers</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable
        caption="Invitations"
        columns={columns}
        rows={filtered}
        getRowId={(r) => r.invitation.id}
        isLoading={loading}
        empty="No invitations match this filter."
      />
      <ReasonDialog
        open={Boolean(revoke)}
        onOpenChange={(o) => !o && setRevoke(null)}
        title={`Revoke invitation for ${revoke?.email ?? ''}`}
        description="The link stops working immediately. The invitee is not notified automatically."
        confirmLabel="Revoke invitation"
        destructive
        pending={resend.isPending}
        onConfirm={(reason) =>
          revoke &&
          resend.mutate(
            { id: revoke.id, status: 'revoked', reason },
            {
              onSuccess: () => {
                toast.success('Invitation revoked')
                setRevoke(null)
              },
            },
          )
        }
      />
    </>
  )
}

function InviteMentorDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const invite = useInviteMentor()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' })
  const [touched, setTouched] = useState(false)
  const [created, setCreated] = useState<Invitation | null>(null)
  const emailOk = /^\S+@\S+\.\S+$/.test(form.email)
  const valid = form.firstName.trim() && form.lastName.trim() && emailOk
  const link = created ? `${window.location.origin}/invite/${created.token}` : ''

  const close = (o: boolean) => {
    if (!o) {
      setForm({ firstName: '', lastName: '', email: '' })
      setTouched(false)
      setCreated(null)
    }
    onOpenChange(o)
  }
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{created ? 'Invitation created' : 'Invite a mentor or trainer'}</DialogTitle>
          <DialogDescription>
            {created
              ? 'No email is sent in this demo. Share the link below to open the invitation.'
              : 'Experts join the network by invitation and set up their own profile and availability.'}
          </DialogDescription>
        </DialogHeader>
        {created ? (
          <div className="grid gap-3">
            <DemoLabel>Simulated — no email sent</DemoLabel>
            <div className="flex items-center gap-2 rounded-lg border bg-surface p-3">
              <code className="min-w-0 flex-1 break-all text-xs">{`/invite/${created.token}`}</code>
              <Button
                size="icon-sm"
                variant="outline"
                aria-label="Copy invitation link"
                onClick={() => {
                  navigator.clipboard?.writeText(link)
                  toast.success('Link copied')
                }}
              >
                <Copy />
              </Button>
            </div>
            <Button asChild variant="outline">
              <a href={`/invite/${created.token}`} target="_blank" rel="noreferrer">
                Open invitation page
              </a>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name" required>
                <Input
                  value={form.firstName}
                  onChange={set('firstName')}
                  aria-invalid={touched && !form.firstName.trim()}
                />
              </Field>
              <Field label="Last name" required>
                <Input
                  value={form.lastName}
                  onChange={set('lastName')}
                  aria-invalid={touched && !form.lastName.trim()}
                />
              </Field>
            </div>
            <Field label="Email" required>
              <Input
                type="email"
                value={form.email}
                onChange={set('email')}
                aria-invalid={touched && !emailOk}
              />
              {touched && !emailOk ? (
                <span role="alert" className="text-danger text-xs">
                  Enter a valid email address.
                </span>
              ) : null}
            </Field>
          </div>
        )}
        <DialogFooter>
          {created ? (
            <Button onClick={() => close(false)}>
              <Check aria-hidden /> Done
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button
                disabled={invite.isPending}
                onClick={() => {
                  setTouched(true)
                  if (!valid) return
                  invite.mutate(form, {
                    onSuccess: (inv) => {
                      setCreated(inv)
                      toast.success('Invitation created')
                    },
                  })
                }}
              >
                {invite.isPending ? 'Creating…' : 'Create invitation'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
