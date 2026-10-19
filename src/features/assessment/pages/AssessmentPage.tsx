import { Link } from '@tanstack/react-router'
import { Archive, ArrowRight, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { DemoLabel, SectionCard } from '@/components/shared/Cards'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { AnimatedBar } from '@/features/company/components/AnimatedBar'
import { useCurrentUser } from '@/hooks/use-session'
import { formatDate } from '@/lib/format'
import { useAssessment, useStartNewAssessment } from '@/queries/assessment.queries'

export function AssessmentPage() {
  const { can } = useCurrentUser()
  const { data, isLoading, isError, refetch } = useAssessment()
  const startNew = useStartNewAssessment()
  const [confirming, setConfirming] = useState(false)
  if (isLoading) return <PageSkeleton />
  if (isError || !data)
    return <ErrorState message="The assessment couldn’t load." onRetry={() => refetch()} />

  const { assessment, archive, completion, ownerName, sections } = data
  const status = assessment?.status ?? 'not_started'
  const manage = can('assessment.manage')
  const submitted = status === 'submitted'
  const answered = assessment?.answers ?? {}

  return (
    <div>
      <PageHeader
        title="Company assessment"
        description="Set a baseline, find the gaps, plan the actions."
        actions={
          submitted ? (
            <Button asChild>
              <Link to="/portal/assessment/results">
                View results <ArrowRight aria-hidden />
              </Link>
            </Button>
          ) : manage ? (
            <Button asChild>
              <Link to="/portal/assessment/take">
                {assessment && status === 'in_progress'
                  ? 'Continue assessment'
                  : 'Start assessment'}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          ) : null
        }
      />
      <Stagger className="grid gap-6 lg:grid-cols-3">
        <StaggerItem className="grid content-start gap-6 lg:col-span-2">
          <SectionCard
            title={
              <span className="flex flex-wrap items-center gap-2">
                {assessment?.name ?? 'Demo Company Assessment'}{' '}
                <DemoLabel>Illustrative demo</DemoLabel>
              </span>
            }
          >
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <Meta label="Period" value={assessment?.period ?? '2026'} />
              <Meta label="Owner" value={ownerName ?? 'Not assigned'} />
              <div>
                <dt className="text-muted-foreground text-xs">Status</dt>
                <dd className="mt-0.5">
                  <WorkflowStatus status={status} />
                </dd>
              </div>
              <Meta label="Last updated" value={formatDate(assessment?.updatedAt)} />
            </dl>
            <div className="mt-5">
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium text-navy">Completion</span>
                <span className="tabular-nums">{completion}%</span>
              </div>
              <AnimatedBar value={completion} label="Assessment completion" />
            </div>
            {submitted && manage ? (
              <div className="mt-5">
                <Button variant="outline" onClick={() => setConfirming(true)}>
                  <RotateCcw aria-hidden /> Start a new period
                </Button>
              </div>
            ) : null}
          </SectionCard>
          <SectionCard title="Sections">
            <ul className="grid gap-3">
              {sections.map((s) => {
                const done = s.questions.filter((q) => answered[q.id]).length
                return (
                  <li key={s.id} className="grid gap-1.5 rounded-xl border p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-navy text-sm">{s.title}</p>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {done}/{s.questions.length}
                      </span>
                    </div>
                    <AnimatedBar
                      value={(done / s.questions.length) * 100}
                      label={`${s.title} progress`}
                      className="h-1.5"
                    />
                  </li>
                )
              })}
            </ul>
          </SectionCard>
        </StaggerItem>
        <StaggerItem>
          <SectionCard title="Previous periods">
            {archive.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nothing archived yet.</p>
            ) : (
              <ul className="grid gap-3">
                {archive.slice(0, 3).map((a) => (
                  <li key={a.id} className="flex items-start gap-3 rounded-xl border p-3.5">
                    <Archive className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
                    <div className="text-sm">
                      <p className="font-medium text-navy">{a.period} assessment</p>
                      <p className="text-muted-foreground text-xs">
                        Submitted {formatDate(a.submittedAt)} · {Object.keys(a.answers).length}{' '}
                        answers · {a.strengths.length} strengths
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </StaggerItem>
      </Stagger>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Start the 2027 assessment?"
        description="The current assessment is archived with its answers and evidence. Open needs carry forward so you can keep tracking them."
        confirmLabel="Start new period"
        pending={startNew.isPending}
        onConfirm={() =>
          startNew.mutate(undefined, {
            onSuccess: () => {
              toast.success('2027 assessment started. The 2026 assessment is archived.')
              setConfirming(false)
            },
          })
        }
      />
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="font-medium text-navy">{value}</dd>
    </div>
  )
}
