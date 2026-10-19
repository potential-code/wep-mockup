import type { AssessmentSection } from '@shared/types'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, CloudCheck, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { celebrate } from '@/components/motion/Celebrate'
import { DemoLabel, SectionCard } from '@/components/shared/Cards'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { AnimatedBar } from '@/features/company/components/AnimatedBar'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'
import {
  useAddAssessmentEvidence,
  useAssessment,
  useSaveAnswers,
  useSubmitAssessment,
} from '@/queries/assessment.queries'
import { QuestionCard } from '../components/QuestionCard'

type Saved = 'idle' | 'saving' | 'saved'

export function AssessmentTakePage() {
  const { data, isLoading, isError, refetch } = useAssessment()
  if (isLoading) return <PageSkeleton />
  if (isError || !data)
    return <ErrorState message="The assessment couldn’t load." onRetry={() => refetch()} />
  if (data.assessment?.status === 'submitted')
    return (
      <EmptyState
        title="This assessment has been submitted"
        description="Your answers are locked for the period. See the results, or start a new period from the assessment page."
        action={
          <Button asChild>
            <Link to="/portal/assessment/results">View results</Link>
          </Button>
        }
      />
    )
  return (
    <Wizard
      sections={data.sections}
      initial={data.assessment?.answers ?? {}}
      evidence={data.assessment?.evidence ?? {}}
    />
  )
}

function Wizard({
  sections,
  initial,
  evidence,
}: {
  sections: AssessmentSection[]
  initial: Record<string, string>
  evidence: Record<string, string[]>
}) {
  const navigate = useNavigate()
  const reduced = usePrefersReducedMotion()
  const [answers, setAnswers] = useState(initial)
  const [step, setStep] = useState(0)
  const [saved, setSaved] = useState<Saved>('idle')
  const save = useSaveAnswers()
  const addEvidence = useAddAssessmentEvidence()
  const submit = useSubmitAssessment()
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const dirty = useRef(false)

  const review = step === sections.length
  const section = sections[step]
  const total = sections.reduce((n, s) => n + s.questions.length, 0)
  const done = sections.reduce((n, s) => n + s.questions.filter((q) => answers[q.id]).length, 0)
  const missing = total - done

  const persist = useCallback(
    (next: Record<string, string>) => {
      setSaved('saving')
      save.mutate(next, { onSuccess: () => setSaved('saved') })
    },
    [save],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: autosave is keyed on the answers only
  useEffect(() => {
    if (!dirty.current) return
    clearTimeout(timer.current)
    timer.current = setTimeout(() => persist(answers), 700)
    return () => clearTimeout(timer.current)
  }, [answers])

  const answer = (id: string, v: string) => {
    dirty.current = true
    setSaved('idle')
    setAnswers((a) => ({ ...a, [id]: v }))
  }
  const go = (n: number) => {
    setStep(n)
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: 'Assessment', to: '/portal/assessment' }, { label: 'Complete' }]}
        title={
          <span className="flex flex-wrap items-center gap-3">
            Demo Company Assessment <DemoLabel>Illustrative demo</DemoLabel>
          </span>
        }
        description="Answer what you can. Your progress saves automatically and you can return at any time."
        actions={<SaveIndicator state={saved} />}
      />
      <div className="mb-6 grid gap-2" aria-live="polite">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-navy">
            {review ? 'Final review' : `Section ${step + 1} of ${sections.length}`}
          </span>
          <span className="text-muted-foreground tabular-nums">
            {done}/{total} answered
          </span>
        </div>
        <AnimatedBar value={(done / total) * 100} label="Questions answered" />
      </div>
      <div className="grid gap-6 lg:grid-cols-4">
        <nav aria-label="Assessment sections" className="lg:sticky lg:top-24 lg:self-start">
          <ol className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible">
            {[...sections.map((s) => s.title), 'Review and submit'].map((t, i) => {
              const s = sections[i]
              const complete = s ? s.questions.every((q) => answers[q.id]) : false
              return (
                <li key={t} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={step === i ? 'step' : undefined}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-start text-sm transition-colors',
                      step === i
                        ? 'border-blue bg-blue-50 font-medium text-navy'
                        : 'bg-card hover:bg-surface',
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-5 shrink-0 place-items-center rounded-full text-[11px]',
                        complete ? 'bg-success text-white' : 'bg-secondary text-navy',
                      )}
                    >
                      {complete ? <Check className="size-3" aria-hidden /> : i + 1}
                    </span>
                    <span className="whitespace-nowrap lg:whitespace-normal">{t}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: reduced ? 0 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduced ? 0 : -16 }}
              transition={{ duration: 0.18 }}
              className="grid gap-4"
            >
              {section ? (
                <>
                  <div>
                    <h2 className="font-heading font-semibold text-navy text-xl">
                      {section.title}
                    </h2>
                    <p className="text-muted-foreground text-sm">{section.description}</p>
                  </div>
                  {section.questions.map((q, i) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      index={i}
                      value={answers[q.id] ?? ''}
                      evidence={evidence[q.id] ?? []}
                      onAnswer={(v) => answer(q.id, v)}
                      onEvidence={(fileName) => addEvidence.mutate({ questionId: q.id, fileName })}
                    />
                  ))}
                </>
              ) : (
                <ReviewStep
                  sections={sections}
                  answers={answers}
                  evidence={evidence}
                  missing={missing}
                  onJump={go}
                />
              )}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button variant="outline" disabled={step === 0} onClick={() => go(step - 1)}>
                  <ArrowLeft aria-hidden /> Back
                </Button>
                {review ? (
                  <Button
                    disabled={missing > 0 || submit.isPending}
                    onClick={() =>
                      save.mutate(answers, {
                        onSuccess: () =>
                          submit.mutate(undefined, {
                            onSuccess: () => {
                              celebrate()
                              navigate({ to: '/portal/assessment/results' })
                            },
                          }),
                      })
                    }
                  >
                    {submit.isPending ? 'Submitting…' : 'Submit assessment'}
                  </Button>
                ) : (
                  <Button onClick={() => go(step + 1)}>
                    {step === sections.length - 1 ? 'Review answers' : 'Next section'}
                    <ArrowRight aria-hidden />
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function SaveIndicator({ state }: { state: Saved }) {
  return (
    <p className="flex items-center gap-1.5 text-muted-foreground text-sm" role="status">
      {state === 'saving' ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden /> Saving…
        </>
      ) : (
        <>
          <CloudCheck className="size-4 text-success" aria-hidden />
          {state === 'saved' ? 'All changes saved' : 'Answers save automatically'}
        </>
      )}
    </p>
  )
}

function ReviewStep({
  sections,
  answers,
  evidence,
  missing,
  onJump,
}: {
  sections: AssessmentSection[]
  answers: Record<string, string>
  evidence: Record<string, string[]>
  missing: number
  onJump: (n: number) => void
}) {
  const evidenceCount = Object.values(evidence).reduce((n, f) => n + f.length, 0)
  return (
    <SectionCard
      title="Review before you submit"
      description={
        missing > 0
          ? `${missing} question${missing === 1 ? '' : 's'} still need an answer.`
          : 'Everything is answered. Submitting locks this period and creates your needs summary.'
      }
    >
      <ul className="grid gap-2">
        {sections.map((s, i) => {
          const unanswered = s.questions.filter((q) => !answers[q.id])
          return (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm"
            >
              <span className="flex items-center gap-2 font-medium text-navy">
                <CheckCircle2
                  className={cn(
                    'size-4',
                    unanswered.length ? 'text-muted-foreground' : 'text-success',
                  )}
                  aria-hidden
                />
                {s.title}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  {unanswered.length ? `${unanswered.length} unanswered` : 'Complete'}
                </span>
                <Button variant="ghost" size="sm" onClick={() => onJump(i)}>
                  {unanswered.length ? 'Answer' : 'Edit'}
                </Button>
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-muted-foreground text-sm">
        {evidenceCount} evidence file{evidenceCount === 1 ? '' : 's'} attached across all sections.
      </p>
    </SectionCard>
  )
}
