import { Info } from 'lucide-react'
import { useMemo } from 'react'
import { DemoLabel } from '@/components/shared/Cards'
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
      { key: 'i', header: 'Checkouts', sortValue: (r) => r.initiated, cell: (r) => r.initiated },
      {
        key: 'c',
        header: 'Confirmed payments',
        sortValue: (r) => r.confirmed,
        cell: (r) => r.confirmed,
      },
      { key: 'a', header: 'Exam attempts', sortValue: (r) => r.attempts, cell: (r) => r.attempts },
      { key: 'p', header: 'Passed', sortValue: (r) => r.passed, cell: (r) => r.passed },
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
        key: 'at',
        header: 'Attempts',
        sortValue: (r) => r.purchase.attempts.length,
        cell: (r) => r.purchase.attempts.length,
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
      description="Purchases, confirmed payments, exam attempts, pass outcomes, issued company credentials and refunds."
      actions={<DemoLabel>Demo payments</DemoLabel>}
    >
      <QueryState isLoading={q.isLoading} isError={q.isError} refetch={q.refetch} hasData={!!d}>
        {d ? (
          <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
              <Stat label="Checkouts started" value={d.totals.initiated} />
              <Stat label="Confirmed payments" value={d.totals.confirmed} />
              <Stat label="Exam attempts" value={d.totals.attempts} />
              <Stat label="Passed" value={d.totals.passed} />
              <Stat label="Credentials issued" value={d.totals.issued} />
              <Stat label="Refunds" value={d.totals.refunded} />
              <Stat
                label="Confirmed revenue"
                value={formatCurrency(d.totals.confirmedRevenue)}
                hint="Demo, non-refunded"
              />
            </div>
            <div className="flex gap-2 rounded-xl border border-gold/40 bg-gold-50 p-3 text-sm">
              <Info className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden />
              <p>
                Each purchase is one payment record and is counted once per stage: revenue is the
                sum of confirmed, non-refunded payments only. Failed, cancelled and refunded
                checkouts never add revenue. Demo payment, no real transactions. Certification
                payments earn no points.
              </p>
            </div>
            <ChartCard
              title="Purchase to credential funnel"
              description="Distinct purchase records reaching each stage. Stages are nested, not added together."
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
                <h2 className="font-heading font-semibold text-lg text-navy">By offering</h2>
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
              <h2 className="font-heading font-semibold text-lg text-navy">Purchase records</h2>
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
