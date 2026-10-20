import { useMemo } from 'react'
import type { Column } from '@/components/shared/DataTable'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/format'
import { useCertificationReport } from '@/queries/admin.queries'
import { ChartCard } from '../components/ChartCard'
import { FunnelBars } from '../components/charts'
import { useReportingFilters } from '../components/filters'
import { MetricInfo } from '../components/MetricInfo'
import { QueryState, Stat } from '../components/QueryState'
import { ReportingShell } from '../components/ReportingShell'
import { ReportTable } from '../components/ReportTable'

type Data = NonNullable<ReturnType<typeof useCertificationReport>['data']>
type OfferRow = Data['offerings'][number]
type Row = Data['rows'][number]

export function CertificationReportPage() {
  const { filters } = useReportingFilters()
  const q = useCertificationReport(filters)
  const d = q.data

  const offerCols = useMemo<Column<OfferRow>[]>(
    () => [
      {
        key: 'o',
        header: 'Offering',
        sortValue: (r) => r.offering.title,
        cell: (r) => <span className="font-medium text-navy">{r.offering.title}</span>,
      },
      {
        key: 'c',
        header: 'Confirmed payments',
        sortValue: (r) => r.confirmed,
        cell: (r) => r.confirmed,
      },
      {
        key: 'is',
        header: 'Credentials issued',
        sortValue: (r) => r.issued,
        cell: (r) => r.issued,
      },
      { key: 'rf', header: 'Refunds', sortValue: (r) => r.refunds, cell: (r) => r.refunds },
      {
        key: 'rev',
        header: 'Confirmed revenue (demo)',
        sortValue: (r) => r.confirmedRevenue,
        exportValue: (r) => r.confirmedRevenue,
        cell: (r) => formatCurrency(r.confirmedRevenue),
        align: 'end',
      },
      { key: 'i', header: 'Checkouts', sortValue: (r) => r.initiated, cell: (r) => r.initiated },
      { key: 'a', header: 'Exam attempts', sortValue: (r) => r.attempts, cell: (r) => r.attempts },
      { key: 'p', header: 'Passed', sortValue: (r) => r.passed, cell: (r) => r.passed },
    ],
    [],
  )
  const rowCols = useMemo<Column<Row>[]>(
    () => [
      {
        key: 'co',
        header: 'Company',
        sortValue: (r) => r.companyName,
        cell: (r) => <span className="font-medium text-navy">{r.companyName}</span>,
      },
      {
        key: 'of',
        header: 'Offering',
        sortValue: (r) => r.offering?.title ?? '',
        cell: (r) => r.offering?.title ?? r.purchase.offeringId,
        hideOnMobile: true,
      },
      {
        key: 'st',
        header: 'Status',
        sortValue: (r) => r.purchase.status,
        cell: (r) => <WorkflowStatus status={r.purchase.status} />,
      },
      {
        key: 'pd',
        header: 'Payment date',
        sortValue: (r) => r.purchase.paidAt,
        exportValue: (r) => r.purchase.paidAt?.slice(0, 10),
        cell: (r) => (r.purchase.paidAt ? formatDate(r.purchase.paidAt) : '—'),
      },
      {
        key: 'am',
        header: 'Amount (demo)',
        sortValue: (r) => r.purchase.amount,
        exportValue: (r) => r.purchase.amount,
        cell: (r) => formatCurrency(r.purchase.amount),
        align: 'end',
      },
      {
        key: 'at',
        header: 'Attempts',
        sortValue: (r) => r.purchase.attempts.length,
        cell: (r) => r.purchase.attempts.length,
      },
      {
        key: 'cr',
        header: 'Credential',
        sortValue: (r) => r.purchase.credentialRef ?? '',
        cell: (r) => r.purchase.credentialRef ?? '—',
        hideOnMobile: true,
      },
    ],
    [],
  )

  return (
    <ReportingShell
      title="Certification and payments"
      description="Demo payments only. Refunds, failed and cancelled checkouts never add revenue."
    >
      <QueryState isLoading={q.isLoading} isError={q.isError} refetch={q.refetch} hasData={!!d}>
        {d ? (
          <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat label="Purchases confirmed" value={d.totals.confirmed} />
              <Stat label="Credentials issued" value={d.totals.issued} />
              <Stat
                label="Confirmed demo revenue"
                value={formatCurrency(d.totals.confirmedRevenue)}
                hint="Non-refunded, no points earned"
              />
            </div>
            <ChartCard
              title="Purchase to credential funnel"
              description="Purchase records reaching each stage (nested)."
              metric="confirmed_payments"
              table={{
                headers: ['Stage', 'Purchases'],
                rows: d.funnel.map((s) => [s.stage, s.value]),
              }}
            >
              <FunnelBars stages={d.funnel.map((s) => ({ label: s.stage, value: s.value }))} />
            </ChartCard>
            <section className="grid gap-3">
              <div className="flex items-center gap-1">
                <h2 className="font-heading font-medium text-lg text-navy">By offering</h2>
                <MetricInfo metric="confirmed_revenue" />
              </div>
              <ReportTable
                title="Certification offerings"
                columns={offerCols}
                rows={d.offerings}
                getRowId={(r) => r.offering.id}
              />
            </section>
            <section className="grid gap-3">
              <h2 className="font-heading font-medium text-lg text-navy">Purchase records</h2>
              <ReportTable
                title="Certification purchases"
                columns={rowCols}
                rows={d.rows}
                getRowId={(r) => r.purchase.id}
                searchText={(r) => `${r.companyName} ${r.offering?.title ?? ''}`}
                searchLabel="Search company or offering"
              />
            </section>
          </div>
        ) : null}
      </QueryState>
    </ReportingShell>
  )
}
