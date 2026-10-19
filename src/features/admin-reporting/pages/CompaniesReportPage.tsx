import { useMemo, useState } from 'react'
import type { Column } from '@/components/shared/DataTable'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { CompanyLogo } from '@/components/shared/UserAvatar'
import { useCompaniesTable } from '@/queries/admin.queries'
import { useGoto, useReportingFilters } from '../components/filters'
import { QueryState } from '../components/QueryState'
import { ReportingShell } from '../components/ReportingShell'
import { ReportTable } from '../components/ReportTable'
import { TableFilter } from '../components/TableFilter'

type Row = NonNullable<ReturnType<typeof useCompaniesTable>['data']>[number]

export const COMPANY_COLUMNS: Column<Row>[] = [
  {
    key: 'name',
    header: 'Company',
    sortValue: (r) => r.company.name,
    cell: (r) => (
      <span className="flex items-center gap-3">
        <CompanyLogo name={r.company.name} src={r.company.logo} className="size-9" />
        <span className="min-w-0 font-medium text-navy">{r.company.name}</span>
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Application status',
    sortValue: (r) => r.application?.status ?? r.company.signatoryStatus,
    cell: (r) => <WorkflowStatus status={r.application?.status ?? r.company.signatoryStatus} />,
  },
  {
    key: 'size',
    header: 'Size',
    sortValue: (r) => r.company.employeeCount,
    exportValue: (r) => r.company.size,
    cell: (r) => `${r.company.size} staff`,
  },
  {
    key: 'country',
    header: 'Country',
    sortValue: (r) => r.company.country,
    cell: (r) => r.company.country,
  },
  {
    key: 'sector',
    header: 'Sector',
    sortValue: (r) => r.company.sector,
    cell: (r) => r.company.sector,
    hideOnMobile: true,
  },
  {
    key: 'activation',
    header: 'Activation',
    sortValue: (r) => r.activationRate,
    exportValue: (r) => `${r.activated}/${r.invited} (${r.activationRate}%)`,
    cell: (r) => (r.invited ? `${r.activated}/${r.invited} · ${r.activationRate}%` : '—'),
  },
  {
    key: 'contacts',
    header: 'Assigned contacts',
    sortValue: (r) => r.contacts,
    cell: (r) => r.contacts || '—',
    hideOnMobile: true,
  },
  {
    key: 'report',
    header: 'Report status',
    sortValue: (r) => r.reportStatus,
    cell: (r) =>
      r.company.signatoryStatus === 'approved' ? <WorkflowStatus status={r.reportStatus} /> : '—',
  },
  {
    key: 'overdue',
    header: 'Overdue actions',
    sortValue: (r) => r.actions.overdue,
    cell: (r) =>
      r.actions.overdue > 0 ? (
        <span className="font-semibold text-danger">{r.actions.overdue} overdue</span>
      ) : (
        <span className="text-muted-foreground">None</span>
      ),
  },
]

export function CompaniesReportPage() {
  const { filters } = useReportingFilters()
  const q = useCompaniesTable(filters)
  const go = useGoto()
  const [status, setStatus] = useState('all')
  const [overdue, setOverdue] = useState('all')

  const rows = useMemo(
    () =>
      (q.data ?? []).filter(
        (r) =>
          (status === 'all' || (r.application?.status ?? r.company.signatoryStatus) === status) &&
          (overdue === 'all' ||
            (overdue === 'yes' ? r.actions.overdue > 0 : r.actions.overdue === 0)),
      ),
    [q.data, status, overdue],
  )

  return (
    <ReportingShell
      title="Companies"
      description="Every company record, pending and approved, with application status, activation and assigned contacts."
    >
      <QueryState
        isLoading={q.isLoading}
        isError={q.isError}
        refetch={q.refetch}
        hasData={!!q.data}
      >
        <ReportTable
          title="Companies"
          columns={COMPANY_COLUMNS}
          rows={rows}
          getRowId={(r) => r.company.id}
          searchText={(r) =>
            `${r.company.name} ${r.company.country} ${r.company.sector} ${r.contacts}`
          }
          searchLabel="Search companies, countries, contacts"
          onRowClick={(r) => go(`/admin/reporting/companies/${r.company.id}`)}
          filters={
            <>
              <TableFilter
                label="Status"
                value={status}
                onChange={setStatus}
                options={[
                  { value: 'approved', label: 'Approved' },
                  { value: 'under_review', label: 'Under review' },
                  { value: 'information_requested', label: 'Information requested' },
                  { value: 'submitted', label: 'Submitted' },
                  { value: 'not_approved', label: 'Not approved' },
                ]}
              />
              <TableFilter
                label="Overdue actions"
                value={overdue}
                onChange={setOverdue}
                options={[
                  { value: 'yes', label: 'Has overdue' },
                  { value: 'no', label: 'None overdue' },
                ]}
              />
            </>
          }
        />
      </QueryState>
    </ReportingShell>
  )
}
