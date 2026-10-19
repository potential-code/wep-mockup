import { fullName } from '@shared/permissions'
import { DEPARTMENTS, departmentLabel, ROLE_SHORT } from '@shared/reference'
import type { DepartmentId } from '@shared/types'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Search, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { FilterBar } from '@/components/shared/Cards'
import { type Column, DataTable } from '@/components/shared/DataTable'
import { EmptyState, ErrorState } from '@/components/shared/States'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrentUser } from '@/hooks/use-session'
import { relativeTime } from '@/lib/format'
import { type TeamMember, useTeam } from '@/queries/company.queries'
import { AnimatedBar } from '../components/AnimatedBar'
import { InviteDialog } from '../components/InviteDialog'
import { TeamRowActions } from '../components/TeamRowActions'
import { TeamTabs } from '../components/TeamTabs'

const STATUSES = [
  ['accepted', 'Active'],
  ['pending', 'Invitation pending'],
  ['expired', 'Expired'],
  ['revoked', 'Access removed'],
] as const

function MemberStatus({ m }: { m: TeamMember }) {
  if (m.suspended || m.invitationStatus === 'revoked')
    return <StatusBadge tone="neutral">Access removed</StatusBadge>
  if (m.invitationStatus === 'accepted') return <StatusBadge tone="success">Active</StatusBadge>
  return <WorkflowStatus status={m.invitationStatus} />
}

function useTeamFilters() {
  const search = useSearch({ strict: false }) as { department?: string; status?: string }
  const navigate = useNavigate()
  const setParam = (key: 'department' | 'status', value?: string) =>
    navigate({
      to: '/portal/company/team',
      search: ((prev: Record<string, unknown>) => ({ ...prev, [key]: value })) as never,
      replace: true,
    })
  const clear = () => navigate({ to: '/portal/company/team', search: {} as never, replace: true })
  return { department: search.department, status: search.status, setParam, clear }
}

export function TeamPage() {
  const { company, can } = useCurrentUser()
  const team = useTeam(company?.id)
  const { department, status, setParam, clear } = useTeamFilters()
  const [query, setQuery] = useState('')
  const [inviting, setInviting] = useState(false)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (team.data ?? []).filter((m) => {
      const state = m.suspended ? 'revoked' : m.invitationStatus
      return (
        (!department || m.department === department) &&
        (!status || state === status) &&
        (!q || `${fullName(m)} ${m.email}`.toLowerCase().includes(q))
      )
    })
  }, [team.data, query, department, status])

  const columns: Column<TeamMember>[] = [
    {
      key: 'name',
      header: 'Name',
      sortValue: (m) => fullName(m),
      cell: (m) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={fullName(m)} src={m.avatar} />
          <div className="min-w-0">
            <p className="truncate font-medium text-navy">{fullName(m)}</p>
            <p className="truncate text-muted-foreground text-xs">{m.title}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortValue: (m) => m.email,
      cell: (m) => <span className="text-sm">{m.email}</span>,
    },
    {
      key: 'department',
      header: 'Department',
      sortValue: (m) => departmentLabel(m.department),
      cell: (m) => <span className="text-sm">{departmentLabel(m.department)}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      sortValue: (m) => ROLE_SHORT[m.role],
      cell: (m) => <span className="text-sm">{ROLE_SHORT[m.role]}</span>,
    },
    { key: 'status', header: 'Invitation', cell: (m) => <MemberStatus m={m} /> },
    {
      key: 'last',
      header: 'Last activity',
      sortValue: (m) => m.lastActiveAt ?? '',
      cell: (m) => (
        <span className="text-sm">{m.lastActiveAt ? relativeTime(m.lastActiveAt) : 'Not yet'}</span>
      ),
    },
    {
      key: 'learning',
      header: 'Learning',
      sortValue: (m) => m.learningProgress,
      className: 'min-w-28',
      cell: (m) => (
        <div className="grid gap-1">
          <span className="text-xs tabular-nums">{m.learningProgress}%</span>
          <AnimatedBar
            value={m.learningProgress}
            label={`${fullName(m)} learning progress`}
            className="h-1.5"
          />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'end',
      cell: (m) => <TeamRowActions member={m} />,
    },
  ]

  return (
    <div className="grid gap-1">
      <TeamTabs active="team" />
      <PageHeader
        title="Team"
        description="Everyone invited to your company workspace, with their department and learning progress."
        actions={
          can('company.manage_team') ? (
            <Button onClick={() => setInviting(true)}>
              <UserPlus aria-hidden /> Invite user
            </Button>
          ) : null
        }
      />
      <FilterBar count={rows.length}>
        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            aria-label="Search team by name or email"
            placeholder="Search name or email"
            className="ps-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select
          value={department ?? 'all'}
          onValueChange={(v) => setParam('department', v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="w-full sm:w-52" aria-label="Filter by department">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d.id} value={d.id satisfies DepartmentId}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status ?? 'all'}
          onValueChange={(v) => setParam('status', v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="w-full sm:w-48" aria-label="Filter by invitation status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(department || status || query) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('')
              clear()
            }}
          >
            Clear filters
          </Button>
        )}
      </FilterBar>
      {team.isError ? (
        <ErrorState message="The team couldn’t load." onRetry={() => team.refetch()} />
      ) : (
        <DataTable
          caption="Company team"
          columns={columns}
          rows={rows}
          getRowId={(m) => m.id}
          isLoading={team.isLoading}
          initialSort={{ key: 'name', dir: 'asc' }}
          empty={
            <EmptyState
              title="No one matches these filters"
              description="Try a different department or status, or invite someone new."
            />
          }
        />
      )}
      <InviteDialog open={inviting} onOpenChange={setInviting} />
    </div>
  )
}
