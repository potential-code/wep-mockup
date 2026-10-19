import { Link } from '@tanstack/react-router'
import { CheckCircle2, Paperclip } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { DemoLabel, SectionCard } from '@/components/shared/Cards'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { useAssessment } from '@/queries/assessment.queries'
import { NeedCard } from '../components/NeedCard'

export function AssessmentResultsPage() {
  const { data, isLoading, isError, refetch } = useAssessment()
  if (isLoading) return <PageSkeleton />
  if (isError || !data)
    return <ErrorState message="Results couldn’t load." onRetry={() => refetch()} />
  const a = data.assessment
  if (!a || a.status !== 'submitted')
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
  const withEvidence = Object.keys(a.evidence).length
  const inPlan = data.needs.filter((n) => n.inPlan).length

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: 'Assessment', to: '/portal/assessment' }, { label: 'Results' }]}
        title="Assessment results"
        description={`${a.name} · ${a.period} · submitted ${formatDate(a.submittedAt)}`}
        actions={
          <Button asChild>
            <Link to="/portal/action-plan">Open action plan</Link>
          </Button>
        }
      />
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border bg-secondary/60 p-4 text-sm">
        <DemoLabel>Illustrative demo</DemoLabel>
        <p className="text-muted-foreground">
          This is a plain needs summary. No maturity score is shown because no scoring methodology
          has been approved.
        </p>
      </div>
      <Stagger className="grid grid-cols-[minmax(0,1fr)] gap-6">
        <StaggerItem>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Strengths', a.strengths.length],
              ['Needs identified', data.needs.length],
              ['In the action plan', inPlan],
              ['Evidence files', evidenceFiles],
            ].map(([l, v]) => (
              <div key={l} className="rounded-2xl border bg-card p-4 shadow-card">
                <dt className="text-muted-foreground text-xs">{l}</dt>
                <dd className="font-bold font-heading text-2xl text-navy tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 flex items-center gap-1.5 text-muted-foreground text-xs">
            <Paperclip className="size-3.5" aria-hidden /> Evidence attached to {withEvidence} of{' '}
            {Object.keys(a.answers).length} answers.
          </p>
        </StaggerItem>
        <StaggerItem>
          <SectionCard title="Strengths" description="What is already working well">
            <ul className="grid gap-3">
              {a.strengths.map((s) => (
                <li key={s} className="flex gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </SectionCard>
        </StaggerItem>
        <StaggerItem>
          <h2 className="mb-1 font-heading font-semibold text-lg text-navy">
            Gaps and recommended next actions
          </h2>
          <p className="mb-4 text-muted-foreground text-sm">
            Each need links to support. Add it to the action plan to assign an owner and a deadline.
          </p>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
            {data.needs.map((n) => (
              <NeedCard key={n.id} need={n} />
            ))}
          </ul>
        </StaggerItem>
      </Stagger>
    </div>
  )
}
