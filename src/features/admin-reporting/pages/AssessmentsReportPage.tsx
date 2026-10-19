import { PRINCIPLES } from '@shared/reference'
import { AlertTriangle } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Column } from '@/components/shared/DataTable'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate, formatPercent } from '@/lib/format'
import { useAssessmentsReport } from '@/queries/admin.queries'
import { ChartCard } from '../components/ChartCard'
import { BarsChart } from '../components/charts'
import { useGoto, useReportingFilters } from '../components/filters'
import { QueryState, Stat } from '../components/QueryState'
import { ReportingShell } from '../components/ReportingShell'
import { ReportTable } from '../components/ReportTable'
import { TableFilter } from '../components/TableFilter'

type Data = NonNullable<ReturnType<typeof useAssessmentsReport>['data']>
type ActionRow = Data['actions'][number]
type BaseRow = Data['baseline'][number]

export function AssessmentsReportPage() {
  const { filters } = useReportingFilters()
  const q = useAssessmentsReport(filters)
  const go = useGoto()
  const d = q.data
  const [od, setOd] = useState('all')
  const [view, setView] = useState('actions')

  const actionCols = useMemo<Column<ActionRow>[]>(
    () => [
      {
        key: 'a',
        header: 'Action',
        sortValue: (r) => r.action.title,
        cell: (r) => <span className="font-medium text-navy">{r.action.title}</span>,
      },
      { key: 'c', header: 'Company', sortValue: (r) => r.companyName, cell: (r) => r.companyName },
      {
        key: 'due',
        header: 'Deadline',
        sortValue: (r) => r.action.dueDate,
        exportValue: (r) => r.action.dueDate.slice(0, 10),
        cell: (r) => (
          <span className={r.overdue ? 'font-semibold text-danger' : ''}>
            {r.overdue ? <AlertTriangle className="me-1 inline size-3.5" aria-hidden /> : null}
            {formatDate(r.action.dueDate)}
            {r.overdue ? ' · overdue' : ''}
          </span>
        ),
      },
      {
        key: 's',
        header: 'Status',
        sortValue: (r) => r.action.status,
        cell: (r) => <WorkflowStatus status={r.action.status} />,
      },
      {
        key: 'e',
        header: 'Evidence files',
        sortValue: (r) => r.evidenceCount,
        cell: (r) => r.evidenceCount,
      },
      {
        key: 'p',
        header: 'Principle',
        sortValue: (r) => r.action.principle,
        exportValue: (r) => `P${r.action.principle}`,
        cell: (r) => <PrincipleTag id={r.action.principle} linked={false} />,
        hideOnMobile: true,
      },
      {
        key: 'o',
        header: 'Owner',
        sortValue: (r) => r.ownerName,
        cell: (r) => r.ownerName,
        hideOnMobile: true,
      },
    ],
    [],
  )
  const baseCols = useMemo<Column<BaseRow>[]>(
    () => [
      {
        key: 'c',
        header: 'Company',
        sortValue: (r) => r.company.name,
        exportValue: (r) => r.company.name,
        cell: (r) => <span className="font-medium text-navy">{r.company.name}</span>,
      },
      {
        key: 'b',
        header: 'Baseline',
        sortValue: (r) => (r.assessed ? 1 : 0),
        exportValue: (r) => (r.assessed ? 'Submitted' : 'Not submitted'),
        cell: (r) =>
          r.assessed ? (
            <StatusBadge tone="success">Submitted</StatusBadge>
          ) : (
            <StatusBadge tone="warning">Not submitted</StatusBadge>
          ),
      },
      {
        key: 'a',
        header: 'Actions',
        sortValue: (r) => r.actions.total,
        cell: (r) => r.actions.total,
      },
      {
        key: 'x',
        header: 'Complete',
        sortValue: (r) => r.actions.complete,
        cell: (r) => r.actions.complete,
      },
      {
        key: 'o',
        header: 'Overdue',
        sortValue: (r) => r.actions.overdue,
        cell: (r) => r.actions.overdue,
      },
      {
        key: 'm',
        header: 'Missing evidence',
        sortValue: (r) => r.actions.missingEvidence,
        cell: (r) => r.actions.missingEvidence,
      },
    ],
    [],
  )
  const actionRows = useMemo(
    () => (d?.actions ?? []).filter((r) => od === 'all' || (od === 'yes') === r.overdue),
    [d, od],
  )
  const t = d?.totals
  const assessed = d?.baseline.filter((b) => b.assessed).length ?? 0

  return (
    <ReportingShell
      showPrinciple
      title="Assessments and actions"
      description="Baseline, priority themes, deadlines and evidence."
    >
      <QueryState isLoading={q.isLoading} isError={q.isError} refetch={q.refetch} hasData={!!d}>
        {d && t ? (
          <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat
                label="Baseline completed"
                value={`${assessed} of ${d.baseline.length}`}
                hint="Approved companies"
              />
              <Stat
                label="Overdue actions"
                value={t.overdue}
                hint={`of ${t.total} actions (${t.active} active)`}
              />
              <Stat
                label="Evidence coverage"
                value={formatPercent(t.active ? (t.withEvidence / t.active) * 100 : 0)}
                hint={`${t.withEvidence} of ${t.active} active actions have evidence`}
              />
              <Stat
                label="Accepted contributions"
                value={t.acceptedContributions}
                hint="Complete, evidence accepted"
              />
            </div>
            <ChartCard
              title="Priority themes by principle"
              description="Actions by principle: complete, overdue and other."
              metric="action_completion"
              table={{
                headers: ['Principle', 'Actions', 'Complete', 'Overdue', 'Companies prioritising'],
                rows: d.themes.map((r) => [
                  `${r.principle}. ${PRINCIPLES[r.principle - 1]?.short}`,
                  r.actions,
                  r.complete,
                  r.overdue,
                  r.priorityCompanies,
                ]),
              }}
            >
              <BarsChart
                stacked
                data={d.themes.map((r) => ({
                  name: `P${r.principle} ${PRINCIPLES[r.principle - 1]?.short ?? ''}`,
                  complete: r.complete,
                  overdue: r.overdue,
                  other: Math.max(0, r.actions - r.complete - r.overdue),
                }))}
                xKey="name"
                series={[
                  { key: 'complete', label: 'Complete' },
                  { key: 'overdue', label: 'Overdue', color: 'var(--chart-3)' },
                  { key: 'other', label: 'In progress / draft', color: 'var(--chart-5)' },
                ]}
              />
            </ChartCard>
            <Tabs value={view} onValueChange={setView}>
              <TabsList aria-label="Assessment records">
                <TabsTrigger value="actions">Action deadlines and evidence</TabsTrigger>
                <TabsTrigger value="baseline">Baseline by company</TabsTrigger>
              </TabsList>
            </Tabs>
            {view === 'actions' ? (
              <ReportTable
                title="Actions"
                columns={actionCols}
                rows={actionRows}
                getRowId={(r) => r.action.id}
                searchText={(r) => `${r.action.title} ${r.companyName} ${r.ownerName}`}
                searchLabel="Search actions"
                initialSort={{ key: 'due', dir: 'asc' }}
                onRowClick={(r) => go(`/admin/reporting/companies/${r.action.companyId}`)}
                filters={
                  <TableFilter
                    label="Overdue"
                    value={od}
                    onChange={setOd}
                    options={[
                      { value: 'yes', label: 'Overdue only' },
                      { value: 'no', label: 'Not overdue' },
                    ]}
                  />
                }
              />
            ) : (
              <ReportTable
                title="Baseline completion"
                columns={baseCols}
                rows={d.baseline}
                getRowId={(r) => r.company.id}
                searchText={(r) => r.company.name}
                searchLabel="Search companies"
                onRowClick={(r) => go(`/admin/reporting/companies/${r.company.id}`)}
              />
            )}
          </div>
        ) : null}
      </QueryState>
    </ReportingShell>
  )
}
