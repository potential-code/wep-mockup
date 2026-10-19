import { fullName } from '@shared/permissions'
import { departmentLabel, ROLE_SHORT } from '@shared/reference'
import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { Column } from '@/components/shared/DataTable'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { relativeTime } from '@/lib/format'
import { useUsersTable } from '@/queries/admin.queries'
import { searchProp, useReportingFilters, useUrlParam } from '../components/filters'
import { QueryState } from '../components/QueryState'
import { ReportingShell } from '../components/ReportingShell'
import { ReportTable } from '../components/ReportTable'
import { TableFilter } from '../components/TableFilter'

type Row = NonNullable<ReturnType<typeof useUsersTable>['data']>[number]

export function AllUsersPage() {
  const { filters, filterSearch } = useReportingFilters()
  const q = useUsersTable(filters)
  const [query, setQuery] = useUrlParam('q')
  const [role, setRole] = useState('all')
  const [inv, setInv] = useState('all')
  const search = searchProp(filterSearch)

  const columns = useMemo<Column<Row>[]>(
    () => [
      {
        key: 'name',
        header: 'User',
        sortValue: (r) => fullName(r.user),
        cell: (r) => (
          <span className="flex items-center gap-3">
            <UserAvatar name={fullName(r.user)} src={r.user.avatar} className="size-8" />
            <span className="grid min-w-0">
              <span className="font-medium text-navy">{fullName(r.user)}</span>
              <span className="truncate text-muted-foreground text-xs">{r.user.email}</span>
            </span>
          </span>
        ),
        exportValue: (r) => `${fullName(r.user)} <${r.user.email}>`,
      },
      {
        key: 'company',
        header: 'Company',
        sortValue: (r) => r.companyName,
        cell: (r) =>
          r.user.companyId ? (
            <Link
              to="/admin/reporting/companies/$companyId"
              params={{ companyId: r.user.companyId }}
              search={search}
              className="text-blue hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {r.companyName}
            </Link>
          ) : (
            r.companyName
          ),
      },
      {
        key: 'inv',
        header: 'Invitation',
        sortValue: (r) => r.user.invitationStatus,
        exportValue: (r) => (r.user.suspended ? 'suspended' : r.user.invitationStatus),
        cell: (r) =>
          r.user.suspended ? (
            <WorkflowStatus status="suspended" />
          ) : r.user.invitationStatus === 'accepted' ? (
            <StatusBadge tone="success">Active</StatusBadge>
          ) : (
            <WorkflowStatus status={r.user.invitationStatus} />
          ),
      },
      {
        key: 'last',
        header: 'Last activity',
        sortValue: (r) => r.user.lastActiveAt,
        exportValue: (r) => r.user.lastActiveAt?.slice(0, 10),
        cell: (r) => relativeTime(r.user.lastActiveAt),
      },
      {
        key: 'learning',
        header: 'Learning completion',
        sortValue: (r) => r.learningPct,
        exportValue: (r) => `${r.learningPct}%`,
        cell: (r) =>
          r.user.role === 'mentor' || !r.user.companyId
            ? '—'
            : `${r.learningPct}%${r.completed ? ' · path complete' : ''}`,
      },
      {
        key: 'dept',
        header: 'Department',
        sortValue: (r) => r.user.department ?? '',
        exportValue: (r) => departmentLabel(r.user.department),
        cell: (r) => departmentLabel(r.user.department),
        hideOnMobile: true,
      },
      {
        key: 'role',
        header: 'Role',
        sortValue: (r) => r.user.role,
        exportValue: (r) => ROLE_SHORT[r.user.role],
        cell: (r) => ROLE_SHORT[r.user.role],
      },
      {
        key: 'points',
        header: 'Points',
        sortValue: (r) => r.points,
        exportValue: (r) => r.points,
        cell: (r) => r.points.toLocaleString('en-GB'),
        align: 'end',
      },
    ],
    [search],
  )

  const rows = useMemo(
    () =>
      (q.data ?? []).filter(
        (r) =>
          (role === 'all' || r.user.role === role) &&
          (inv === 'all' || r.user.invitationStatus === inv),
      ),
    [q.data, role, inv],
  )

  return (
    <ReportingShell
      title="All users"
      description="Search by name, email or company. More fields under Columns."
    >
      <QueryState
        isLoading={q.isLoading}
        isError={q.isError}
        refetch={q.refetch}
        hasData={!!q.data}
      >
        <ReportTable
          title="All users"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.user.id}
          query={query ?? ''}
          onQueryChange={(v) => setQuery(v || undefined)}
          searchLabel="Search name, email, company"
          searchText={(r) =>
            `${fullName(r.user)} ${r.user.email} ${r.companyName} ${departmentLabel(r.user.department)}`
          }
          filters={
            <>
              <TableFilter
                label="Role"
                value={role}
                onChange={setRole}
                options={Object.entries(ROLE_SHORT).map(([value, label]) => ({ value, label }))}
              />
              <TableFilter
                label="Invitation"
                value={inv}
                onChange={setInv}
                options={['accepted', 'pending', 'expired', 'revoked'].map((v) => ({
                  value: v,
                  label: v,
                }))}
              />
            </>
          }
        />
      </QueryState>
    </ReportingShell>
  )
}
