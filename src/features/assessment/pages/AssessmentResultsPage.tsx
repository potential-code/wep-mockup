import { Link } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { SectionCard } from '@/components/shared/Cards'
import { STAT_TONES } from '@/components/shared/StatCard'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useAssessment } from '@/queries/assessment.queries'
import { NeedCard } from '../components/NeedCard'

export function AssessmentResultsPage() {
  const [allNeeds, setAllNeeds] = useState(false)
  const { data, isLoading, isError, refetch } = useAssessment()
  if (isLoading) return <PageSkeleton />
  if (isError || !data)
    return <ErrorState message="Results couldn’t load." onRetry={() => refetch()} />
  const a = data.assessment
  if (a?.status !== 'submitted')
    return (
      <EmptyState
        title="No results yet"
        description="Submit the assessment to see your strengths, gaps and suggested support."
        action={
          <Button asChild>
            <Link to="/portal/assessment/take">Continue assessment</Link>
          </Button>
        }
      />
    )
  const evidenceFiles = Object.values(a.evidence).reduce((n, f) => n + f.length, 0)
  const inPlan = data.needs.filter((n) => n.inPlan).length

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: 'Assessment', to: '/portal/assessment' }, { label: 'Results' }]}
        title="Assessment results"
        description={`${a.name} · ${a.period} · submitted ${formatDate(a.submittedAt)} · needs summary, no maturity score`}
        actions={
          <Button asChild>
            <Link to="/portal/action-plan">Open action plan</Link>
          </Button>
        }
      />
      <Stagger className="grid grid-cols-[minmax(0,1fr)] gap-6">
        <StaggerItem>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Strengths', a.strengths.length],
              ['Needs identified', data.needs.length],
              ['In the action plan', inPlan],
              ['Evidence files', evidenceFiles],
            ].map(([l, v], i) => {
              const t = STAT_TONES[(['navy', 'blue', 'gold', 'success'] as const)[i % 4] ?? 'navy']
              return (
                <div key={l} className={cn('rounded-2xl p-4 shadow-card', t.surface, t.text)}>
                  <dt className={cn('text-xs', t.muted)}>{l}</dt>
                  <dd className="font-bold font-heading text-2xl tabular-nums">{v}</dd>
                </div>
              )
            })}
          </dl>
        </StaggerItem>
        <StaggerItem>
          <SectionCard title="Strengths">
            <ul className="grid gap-3">
              {a.strengths.slice(0, 3).map((s) => (
                <li key={s} className="flex gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </SectionCard>
        </StaggerItem>
        <StaggerItem>
          <h2 className="mb-4 font-heading font-semibold text-lg text-navy">
            Gaps and recommended next actions
          </h2>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
            {(allNeeds ? data.needs : data.needs.slice(0, 4)).map((n) => (
              <NeedCard key={n.id} need={n} />
            ))}
          </ul>
          {data.needs.length > 4 ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setAllNeeds((v) => !v)}
            >
              {allNeeds ? 'Show fewer needs' : `View all ${data.needs.length} needs`}
            </Button>
          ) : null}
        </StaggerItem>
      </Stagger>
    </div>
  )
}
