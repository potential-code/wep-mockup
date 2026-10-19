import { useMemo } from 'react'
import type { Column } from '@/components/shared/DataTable'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { CompanyLogo } from '@/components/shared/UserAvatar'
import { formatDate, relativeTime } from '@/lib/format'
import { useCompaniesTable } from '@/queries/admin.queries'
import { useGoto, useReportingFilters } from '../components/filters'
import { QueryState } from '../components/QueryState'
import { ReportingShell } from '../components/ReportingShell'
import { ReportTable } from '../components/ReportTable'

type Row = NonNullable<ReturnType<typeof useCompaniesTable>['data']>[number]

const COLUMNS: Column<Row>[] = [
  {
    key: 'name',
    header: 'Signatory',
    sortValue: (r) => r.company.name,
    cell: (r) => (
      <span className="flex items-center gap-3">
        <CompanyLogo name={r.company.name} src={r.company.logo} className="size-9" />
        <span className="grid min-w-0">
          <span className="font-medium text-navy">{r.company.name}</span>
          <span className="text-muted-foreground text-xs">{r.company.country}</span>
        </span>
      </span>
    ),
    exportValue: (r) => r.company.name,
  },
  {
    key: 'status',
    header: 'Status',
    sortValue: (r) => r.company.signatoryStatus,
    cell: (r) => <WorkflowStatus status={r.company.signatoryStatus} />,
  },
  {
    key: 'since',
    header: 'Member since',
    sortValue: (r) => r.company.memberSince,
    exportValue: (r) => formatDate(r.company.memberSince),
    cell: (r) => formatDate(r.company.memberSince),
    hideOnMobile: true,
  },
  {
    key: 'teams',
    header: 'Active teams',
    sortValue: (r) => r.activeTeams,
    exportValue: (r) => r.activeTeams,
    cell: (r) => `${r.activeTeams} of 6 departments`,
  },
  {
    key: 'last',
    header: 'Last activity',
    sortValue: (r) => r.company.lastActivityAt,
    exportValue: (r) => r.company.lastActivityAt?.slice(0, 10),
    cell: (r) => (
      <span className={r.active ? '' : 'text-warning'}>
        {relativeTime(r.company.lastActivityAt)}
        {r.active ? '' : ' (inactive this month)'}
      </span>
    ),
  },
  {
    key: 'report',
    header: 'Current report',
    sortValue: (r) => r.reportStatus,
    cell: (r) => <WorkflowStatus status={r.reportStatus} />,
  },
  {
    key: 'progress',
    header: 'Company progress',
    sortValue: (r) => r.actions.completionRate,
    exportValue: (r) =>
      `${r.actions.complete}/${r.actions.total} actions complete; ${r.completionRate}% path completion`,
    cell: (r) => (
      <span className="grid gap-1">
        <span className="text-xs">
          {r.actions.complete}/{r.actions.total} actions · {r.completionRate}% learning
        </span>
        <span
          className="h-1.5 w-32 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Actions complete"
          aria-valuenow={
            r.actions.total ? Math.round((r.actions.complete / r.actions.total) * 100) : 0
          }
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span
            className="block h-full rounded-full bg-blue"
            style={{
              width: `${r.actions.total ? (r.actions.complete / r.actions.total) * 100 : 0}%`,
            }}
          />
        </span>
      </span>
    ),
  },
]

export function SignatoriesPage() {
  const { filters } = useReportingFilters()
  const q = useCompaniesTable(filters)
  const go = useGoto()
  const rows = useMemo(
    () => (q.data ?? []).filter((r) => r.company.signatoryStatus === 'approved'),
    [q.data],
  )
  return (
    <ReportingShell
      title="Signatories"
      description="Approved signatories only: status, active teams, last activity, current report status and progress."
    >
      <QueryState
        isLoading={q.isLoading}
        isError={q.isError}
        refetch={q.refetch}
        hasData={!!q.data}
      >
        <ReportTable
          title="Signatories"
          columns={COLUMNS}
          rows={rows}
          getRowId={(r) => r.company.id}
          searchText={(r) => `${r.company.name} ${r.company.country}`}
          searchLabel="Search signatories"
          onRowClick={(r) => go(`/admin/reporting/companies/${r.company.id}`)}
        />
      </QueryState>
    </ReportingShell>
  )
}
