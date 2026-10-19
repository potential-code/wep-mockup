import { Award, CreditCard, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoLabel, SectionCard } from '@/components/shared/Cards'
import { type Column, columnsToCsvRows, DataTable } from '@/components/shared/DataTable'
import { StatCard } from '@/components/shared/StatCard'
import { ErrorState } from '@/components/shared/States'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { downloadText, formatCurrency, formatDate } from '@/lib/format'
import { useSettings, useUpdateSettings } from '@/queries/admin.queries'
import { OFFERINGS, useAllPurchases } from '@/queries/certification.queries'
import { Field, toCsvText } from '../components/common'

type Row = NonNullable<ReturnType<typeof useAllPurchases>['data']>[number]

export function ManageCertificationsPage() {
  const { data, isLoading, error, refetch } = useAllPurchases()
  const settings = useSettings()
  const update = useUpdateSettings()
  const [config, setConfig] = useState<Record<string, { price: string; questions: string }>>(
    Object.fromEntries(
      OFFERINGS.map((o) => [o.id, { price: String(o.price), questions: String(o.examQuestions) }]),
    ),
  )
  const [passMark, setPassMark] = useState<string>()
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
      key: 'ref',
      header: 'Reference',
      hideOnMobile: true,
      sortValue: (r) => r.purchase.paymentRef,
      cell: (r) => r.purchase.paymentRef ?? '—',
    },
    {
      key: 'paid',
      header: 'Paid',
      sortValue: (r) => r.purchase.paidAt,
      cell: (r) => formatDate(r.purchase.paidAt),
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
        description="Configure offerings and pass rules, and monitor transactions and credentials."
        actions={<DemoLabel>Proposed certifications · Demo payments</DemoLabel>}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Demo revenue" value={formatCurrency(revenue)} icon={CreditCard} />
        <StatCard label="Paid purchases" value={paid.length} />
        <StatCard
          label="Certificates issued"
          value={rows.filter((r) => r.purchase.status === 'certificate_issued').length}
          tone="success"
          icon={Award}
        />
        <StatCard label="Refunded" value={refunds.length} tone="gold" icon={RotateCcw} />
      </div>
      <Tabs defaultValue="offerings">
        <TabsList>
          <TabsTrigger value="offerings">Offerings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
        </TabsList>

        <TabsContent value="offerings" className="grid gap-4 pt-3">
          <p className="rounded-xl border bg-gold-50/60 p-3 text-sm">
            Prices, exam length and pass marks are proposed values for discussion. A certificate is
            issued only after payment is confirmed and the exam is passed. No real charges are made.
          </p>
          <div className="grid gap-4 lg:grid-cols-3">
            {OFFERINGS.map((o) => (
              <SectionCard key={o.id} title={o.title} description={o.focus}>
                <div className="grid gap-3">
                  <Field label="Price (USD)">
                    <Input
                      type="number"
                      min={0}
                      value={config[o.id]?.price}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          [o.id]: {
                            ...(c[o.id] as { price: string; questions: string }),
                            price: e.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  <Field label="Exam questions">
                    <Input
                      type="number"
                      min={1}
                      value={config[o.id]?.questions}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          [o.id]: {
                            ...(c[o.id] as { price: string; questions: string }),
                            questions: e.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  <ul className="list-disc ps-5 text-muted-foreground text-xs">
                    {o.scope.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success(`${o.title} saved (demo)`)}
                  >
                    Save offering
                  </Button>
                </div>
              </SectionCard>
            ))}
          </div>
          <SectionCard title="Pass rules" description="Applies to all three exams.">
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Pass mark (%)" className="w-40">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={passMark ?? settings.data?.certificationPassMark ?? ''}
                  onChange={(e) => setPassMark(e.target.value)}
                />
              </Field>
              <Button
                disabled={
                  update.isPending ||
                  passMark === undefined ||
                  !(Number(passMark) > 0 && Number(passMark) <= 100)
                }
                onClick={() =>
                  update.mutate(
                    { certificationPassMark: Number(passMark) },
                    { onSuccess: () => toast.success('Pass mark updated') },
                  )
                }
              >
                {update.isPending ? 'Saving…' : 'Save pass mark'}
              </Button>
              <p className="text-muted-foreground text-sm">
                Retries are allowed; each attempt is recorded.
              </p>
            </div>
          </SectionCard>
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
