import type { CertificationOffering } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { Award, CreditCard, ListChecks, Pencil, Plus, RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { type Column, columnsToCsvRows, DataTable } from '@/components/shared/DataTable'
import { StatCard } from '@/components/shared/StatCard'
import { CardGridSkeleton, ErrorState } from '@/components/shared/States'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { downloadText, formatCurrency, formatDate } from '@/lib/format'
import { useAdminOfferings, useAllPurchases } from '@/queries/certification.queries'
import { toCsvText } from '../components/common'
import { OFFERING_STATUS } from './CertificationEditorPage'

type Row = NonNullable<ReturnType<typeof useAllPurchases>['data']>[number]

export function ManageCertificationsPage() {
  const { data, isLoading, error, refetch } = useAllPurchases()
  const offerings = useAdminOfferings()
  const rows = data ?? []
  const paid = rows.filter(
    (r) =>
      !['unpaid', 'checkout_cancelled', 'payment_failed', 'refunded'].includes(r.purchase.status),
  )
  const revenue = paid.reduce((n, r) => n + r.purchase.amount, 0)
  const refunds = rows.filter((r) => r.purchase.status === 'refunded')

  const columns: Column<Row>[] = [
    {
      key: 'company',
      header: 'Company',
      sortValue: (r) => r.company?.name,
      cell: (r) => (
        <span className="font-medium text-navy">{r.company?.name ?? r.purchase.companyId}</span>
      ),
    },
    {
      key: 'offering',
      header: 'Certification',
      sortValue: (r) => r.offering?.title,
      cell: (r) => r.offering?.title ?? r.purchase.offeringId,
    },
    {
      key: 'status',
      header: 'Payment / exam state',
      sortValue: (r) => r.purchase.status,
      cell: (r) => <WorkflowStatus status={r.purchase.status} />,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'end',
      sortValue: (r) => r.purchase.amount,
      cell: (r) => formatCurrency(r.purchase.amount),
    },
    {
      key: 'paid',
      header: 'Paid / reference',
      sortValue: (r) => r.purchase.paidAt,
      cell: (r) => (
        <div>
          <p>{formatDate(r.purchase.paidAt)}</p>
          <p className="text-muted-foreground text-xs">{r.purchase.paymentRef ?? '—'}</p>
        </div>
      ),
    },
  ]
  const credCols: Column<Row>[] = [
    columns[0] as Column<Row>,
    columns[1] as Column<Row>,
    {
      key: 'cred',
      header: 'Credential ID',
      sortValue: (r) => r.purchase.credentialRef,
      cell: (r) => <code className="text-xs">{r.purchase.credentialRef}</code>,
    },
    {
      key: 'issued',
      header: 'Issued',
      sortValue: (r) => r.purchase.issuedAt,
      cell: (r) => formatDate(r.purchase.issuedAt),
    },
    {
      key: 'score',
      header: 'Best score',
      align: 'end',
      cell: (r) => `${Math.max(0, ...r.purchase.attempts.map((a) => a.score))}%`,
    },
  ]

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div>
      <PageHeader
        title="Certifications and Payments"
        description="Proposed certifications, prices and exams for discussion. Certificates are issued only after a confirmed demo payment and a passed exam."
        actions={
          <Button asChild>
            <Link to="/admin/manage/certifications/$offeringId" params={{ offeringId: 'new' }}>
              <Plus aria-hidden /> New certification
            </Link>
          </Button>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Demo revenue" value={formatCurrency(revenue)} icon={CreditCard} />
        <StatCard
          label="Certificates issued"
          value={rows.filter((r) => r.purchase.status === 'certificate_issued').length}
          tone="success"
          icon={Award}
        />
        <StatCard label="Refunded" value={refunds.length} tone="coral" icon={RotateCcw} />
      </div>
      <Tabs defaultValue="offerings">
        <TabsList>
          <TabsTrigger value="offerings">Offerings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
        </TabsList>

        <TabsContent value="offerings" className="pt-3">
          {offerings.isLoading ? (
            <CardGridSkeleton count={3} />
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {(offerings.data ?? []).map((r) => (
                <li key={r.offering.id} className="min-w-0">
                  <OfferingTile {...r} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="pt-3">
          <DataTable
            caption="Transactions"
            columns={columns}
            rows={rows}
            getRowId={(r) => r.purchase.id}
            isLoading={isLoading}
            onExport={(cols, sorted) => {
              const t = columnsToCsvRows(cols, sorted)
              downloadText(
                'certification-transactions.csv',
                toCsvText(t.headers, t.rows),
                'text/csv',
              )
            }}
          />
        </TabsContent>

        <TabsContent value="credentials" className="pt-3">
          <DataTable
            caption="Credentials"
            columns={credCols}
            rows={rows.filter((r) => r.purchase.status === 'certificate_issued')}
            getRowId={(r) => r.purchase.id}
            isLoading={isLoading}
            empty="No credentials issued yet."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OfferingTile({
  offering: o,
  purchases,
  issued,
}: {
  offering: CertificationOffering
  purchases: number
  issued: number
}) {
  const status = OFFERING_STATUS[o.status]
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-lift">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {o.image ? (
          <img
            src={o.image}
            alt=""
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <span className="absolute end-3 top-3">
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-heading font-medium text-navy leading-snug">
          <Link
            to="/admin/manage/certifications/$offeringId"
            params={{ offeringId: o.id }}
            className="after:absolute after:inset-0 hover:underline focus-visible:outline-none"
          >
            {o.title}
          </Link>
        </h2>
        <p className="line-clamp-2 text-muted-foreground text-sm">{o.focus}</p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
          <span className="inline-flex items-center gap-1">
            <ListChecks className="size-3.5" aria-hidden /> {o.examQuestions} questions ·{' '}
            {o.passMark}% to pass
          </span>
          <span className="inline-flex items-center gap-1">
            <CreditCard className="size-3.5" aria-hidden /> {purchases} paid · {issued} issued
          </span>
        </p>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <span className="font-heading font-medium text-navy">
            {formatCurrency(o.price, o.currency)}
          </span>
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            className="relative z-10 ms-auto"
            aria-label={`Edit ${o.title}`}
          >
            <Link to="/admin/manage/certifications/$offeringId" params={{ offeringId: o.id }}>
              <Pencil />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
