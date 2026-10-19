import { POINTS_RULES } from '@shared/rules'
import type { PlatformSettings } from '@shared/types'
import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoLabel, SectionCard } from '@/components/shared/Cards'
import { type Column, DataTable } from '@/components/shared/DataTable'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDateTime } from '@/lib/format'
import { useAudit, useSettings, useUpdateSettings, useUsersTable } from '@/queries/admin.queries'
import { Field } from '../components/common'

type NumKey = keyof Pick<
  PlatformSettings,
  | 'qualifyingPointsForClinic'
  | 'mentorSessionCost'
  | 'communityDailyCap'
  | 'actionMonthlyCap'
  | 'cancellationWindowHours'
  | 'quizPassMark'
>

const FIELDS: { key: NumKey; label: string; hint: string; min: number; max: number }[] = [
  {
    key: 'qualifyingPointsForClinic',
    label: 'Qualifying milestone (points)',
    hint: 'Qualifying points needed, with the designated course, to unlock a clinic.',
    min: 1,
    max: 5000,
  },
  {
    key: 'mentorSessionCost',
    label: 'Mentoring session price (points)',
    hint: 'Redeemed when a 30-minute session is booked.',
    min: 1,
    max: 5000,
  },
  {
    key: 'communityDailyCap',
    label: 'Community contribution cap (per day)',
    hint: 'Maximum points from community contributions each day.',
    min: 0,
    max: 500,
  },
  {
    key: 'actionMonthlyCap',
    label: 'Action contribution cap (per month)',
    hint: 'Maximum points from accepted action contributions each month.',
    min: 0,
    max: 1000,
  },
  {
    key: 'cancellationWindowHours',
    label: 'Cancellation window (hours)',
    hint: 'Cancelling earlier than this refunds the points.',
    min: 0,
    max: 168,
  },
  {
    key: 'quizPassMark',
    label: 'Quiz pass mark (%)',
    hint: 'Applies to course quizzes.',
    min: 1,
    max: 100,
  },
]

const REASONS = [
  'Technical error',
  'Attendance confirmed manually',
  'Duplicate award removed',
  'Goodwill after service issue',
  'Policy exception approved',
]

type Rule = { key: string; amount: number; label: string; control: string; qualifying: boolean }
const RULES: Rule[] = Object.entries(POINTS_RULES).map(([key, r]) => ({ key, ...r }))

export function GamificationPage() {
  const { data, isLoading, error, refetch } = useSettings()
  const audit = useAudit()
  const update = useUpdateSettings()
  const users = useUsersTable({})
  const nameOf = (id: string) => {
    const u = users.data?.find((r) => r.user.id === id)?.user
    return u ? `${u.firstName} ${u.lastName}` : id
  }
  const [vals, setVals] = useState<Record<NumKey, string> | null>(null)

  useEffect(() => {
    if (data)
      setVals(
        Object.fromEntries(FIELDS.map((f) => [f.key, String(data[f.key])])) as Record<
          NumKey,
          string
        >,
      )
  }, [data])

  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (isLoading || !data || !vals) return <PageSkeleton />

  const invalid = (f: (typeof FIELDS)[number]) => {
    const n = Number(vals[f.key])
    return !Number.isFinite(n) || vals[f.key] === '' || n < f.min || n > f.max
  }
  const dirty = FIELDS.some((f) => String(data[f.key]) !== vals[f.key])
  const hasErrors = FIELDS.some(invalid)

  const rulesCols: Column<Rule>[] = [
    {
      key: 'label',
      header: 'Action',
      cell: (r) => (
        <div>
          <p className="font-medium text-navy">{r.label}</p>
          <p className="text-muted-foreground text-xs">{r.control}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Points',
      align: 'end',
      sortValue: (r) => r.amount,
      cell: (r) => (r.amount > 0 ? `+${r.amount}` : r.amount),
    },
    {
      key: 'q',
      header: 'Qualifying',
      cell: (r) =>
        r.qualifying ? (
          <StatusBadge tone="success">Counts</StatusBadge>
        ) : (
          <StatusBadge tone="neutral" icon={null}>
            No
          </StatusBadge>
        ),
    },
  ]
  const adjustments = (audit.data ?? []).filter((a) => a.action === 'Points adjustment')
  const adjCols: Column<(typeof adjustments)[number]>[] = [
    { key: 'at', header: 'When', sortValue: (a) => a.at, cell: (a) => formatDateTime(a.at) },
    { key: 'actor', header: 'By', cell: (a) => a.actorName },
    { key: 'target', header: 'User', cell: (a) => nameOf(a.target) },
    { key: 'detail', header: 'Amount and reason', cell: (a) => a.detail ?? '—' },
  ]

  return (
    <div>
      <PageHeader
        title="Gamification"
        description="Points rules, thresholds and adjustment records."
        actions={<DemoLabel>Proposed rules</DemoLabel>}
      />
      <Tabs defaultValue="thresholds">
        <TabsList>
          <TabsTrigger value="thresholds">Thresholds and caps</TabsTrigger>
          <TabsTrigger value="rules">Points rules</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
        </TabsList>
        <TabsContent value="thresholds" className="pt-3">
          <SectionCard description="Changes apply immediately to new awards and bookings.">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {FIELDS.map((f) => (
                <Field key={f.key} label={f.label} hint={invalid(f) ? undefined : f.hint}>
                  <Input
                    type="number"
                    min={f.min}
                    max={f.max}
                    value={vals[f.key]}
                    aria-invalid={invalid(f)}
                    onChange={(e) => setVals((v) => (v ? { ...v, [f.key]: e.target.value } : v))}
                  />
                  {invalid(f) ? (
                    <span role="alert" className="text-danger text-xs">
                      Enter a number from {f.min} to {f.max}.
                    </span>
                  ) : null}
                </Field>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <Button
                disabled={!dirty || hasErrors || update.isPending}
                onClick={() =>
                  update.mutate(
                    Object.fromEntries(
                      FIELDS.map((f) => [f.key, Number(vals[f.key])]),
                    ) as Partial<PlatformSettings>,
                    { onSuccess: () => toast.success('Gamification settings saved') },
                  )
                }
              >
                <Save aria-hidden /> {update.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </SectionCard>
        </TabsContent>
        <TabsContent value="rules" className="pt-3">
          <section aria-labelledby="rules">
            <h2 id="rules" className="mb-1 font-heading font-semibold text-lg text-navy">
              Points rules
            </h2>
            <p className="mb-3 text-muted-foreground text-sm">
              Each award is idempotent: one award per unique source event. Starting values from the
              proposal.
            </p>
            <DataTable
              caption="Points rules"
              columns={rulesCols}
              rows={RULES}
              getRowId={(r) => r.key}
            />
          </section>
        </TabsContent>
        <TabsContent value="adjustments" className="grid gap-6 pt-3">
          <SectionCard
            title="Adjustment reasons"
            description="Every manual adjustment needs a written reason. Suggested categories:"
          >
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <StatusBadge key={r} tone="neutral" icon={null}>
                  {r}
                </StatusBadge>
              ))}
            </div>
          </SectionCard>

          <section aria-labelledby="adj">
            <h2 id="adj" className="mb-3 font-heading font-semibold text-lg text-navy">
              Adjustment audit
            </h2>
            <DataTable
              caption="Points adjustments"
              columns={adjCols}
              rows={adjustments}
              getRowId={(a) => a.id}
              isLoading={audit.isLoading}
              empty="No manual adjustments yet. Adjust points from Users and Invitations."
              initialSort={{ key: 'at', dir: 'desc' }}
            />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
