import type { QuizQuestion } from '@shared/types'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, Loader2, Save } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AccessNotice, ErrorState, PageSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useExam, useSaveExamProgress, useSubmitExam } from '@/queries/certification.queries'
import { type ExamOutcome, ExamResult } from '../components/ExamResult'

type ExamQuestion = Omit<QuizQuestion, 'correctIndex' | 'explanation'>

export function ExamPage() {
  const { purchaseId } = useParams({ from: '/_app/portal/certification/exam/$purchaseId' })
  const { data, isLoading, error, refetch } = useExam(purchaseId)
  const save = useSaveExamProgress()
  const submit = useSubmitExam()
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [seeded, setSeeded] = useState(false)
  const [index, setIndex] = useState(0)
  const [reviewing, setReviewing] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [outcome, setOutcome] = useState<ExamOutcome | null>(null)
  const latest = useRef(answers)
  latest.current = answers

  useEffect(() => {
    if (data && !seeded) {
      setAnswers(data.savedAnswers)
      const first = data.questions.findIndex((q) => data.savedAnswers[q.id] === undefined)
      setIndex(first < 0 ? 0 : first)
      setSeeded(true)
    }
  }, [data, seeded])

  const persist = useCallback(
    (next: Record<string, number>) =>
      save.mutate({ id: purchaseId, answers: next }, { onSuccess: () => setSavedAt(Date.now()) }),
    [save, purchaseId],
  )

  if (outcome)
    return (
      <ExamResult
        outcome={outcome}
        purchaseId={purchaseId}
        onRetry={() => {
          setOutcome(null)
          setAnswers({})
          setIndex(0)
          setReviewing(false)
          setSavedAt(null)
          refetch()
        }}
      />
    )
  if (isLoading) return <PageSkeleton />
  if (error) {
    return (error as { code?: string }).code === 'forbidden' ? (
      <AccessNotice
        title="The exam isn’t available"
        message={error.message}
        action={
          <Button asChild variant="outline">
            <Link to="/portal/certification">Back to certifications</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState message={error.message} onRetry={() => refetch()} />
    )
  }
  if (!data?.offering) return null
  const qs: ExamQuestion[] = data.questions
  const q = qs[index]
  const answered = qs.filter((x) => answers[x.id] !== undefined).length
  const pick = (qid: string, i: number) => {
    const next = { ...latest.current, [qid]: i }
    setAnswers(next)
  }

  const finish = async () => {
    const res = await submit.mutateAsync({ id: purchaseId, answers })
    setOutcome({
      score: res.score,
      correct: res.correct,
      total: res.total,
      passed: res.passed,
      passMark: res.passMark,
    })
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Certification', to: '/portal/certification' },
          { label: data.offering.title, to: `/portal/certification/${data.offering.id}` },
          { label: 'Exam' },
        ]}
        title={data.offering.title}
        description={`${qs.length} questions · ${data.passMark}% to pass. Only the authorised company representative can sit this exam. Marking methodology and retake limits are configurable decisions.`}
      />
      <div className="grid gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-navy">
            {reviewing ? 'Review your answers' : `Question ${index + 1} of ${qs.length}`}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground" aria-live="polite">
            {save.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Saving…
              </>
            ) : savedAt ? (
              <>
                <Check className="size-3.5 text-success" /> Saved
              </>
            ) : (
              `${answered} answered`
            )}
          </span>
        </div>
        <Progress value={(answered / qs.length) * 100} aria-label="Answered questions" />
      </div>

      {reviewing ? (
        <section className="grid gap-3 rounded-2xl border bg-card p-5 shadow-card">
          <ul className="divide-y">
            {qs.map((x, i) => (
              <li key={x.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="text-muted-foreground">{i + 1}.</span> {x.text}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className={answers[x.id] === undefined ? 'text-danger' : 'text-success'}>
                    {answers[x.id] === undefined ? 'Unanswered' : 'Answered'}
                  </span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setIndex(i)
                      setReviewing(false)
                    }}
                  >
                    Edit
                  </Button>
                </span>
              </li>
            ))}
          </ul>
          {answered < qs.length ? (
            <p className="text-danger text-sm" role="alert">
              Answer all {qs.length} questions before submitting.
            </p>
          ) : null}
          <div className="flex flex-wrap justify-between gap-2">
            <Button variant="outline" onClick={() => setReviewing(false)}>
              <ArrowLeft /> Back to questions
            </Button>
            <Button size="lg" disabled={answered < qs.length || submit.isPending} onClick={finish}>
              {submit.isPending ? (
                <>
                  <Loader2 className="animate-spin" /> Marking exam…
                </>
              ) : (
                'Submit exam'
              )}
            </Button>
          </div>
        </section>
      ) : q ? (
        <section className="grid gap-4 rounded-2xl border bg-card p-5 shadow-card sm:p-6">
          <fieldset className="grid gap-3">
            <legend className="mb-2 font-heading font-medium text-lg text-navy">{q.text}</legend>
            {q.options.map((opt, i) => (
              <label
                key={opt}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors hover:bg-surface has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                  answers[q.id] === i && 'border-blue bg-blue-50',
                )}
              >
                <input
                  type="radio"
                  name={q.id}
                  className="size-4 accent-[#006fa8]"
                  checked={answers[q.id] === i}
                  onChange={() => pick(q.id, i)}
                />
                {opt}
              </label>
            ))}
          </fieldset>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
            <Button variant="outline" disabled={index === 0} onClick={() => setIndex(index - 1)}>
              <ArrowLeft /> Previous
            </Button>
            <Button variant="ghost" onClick={() => persist(answers)} disabled={save.isPending}>
              <Save /> Save progress
            </Button>
            {index < qs.length - 1 ? (
              <Button
                onClick={() => {
                  persist(answers)
                  setIndex(index + 1)
                }}
              >
                Next <ArrowRight />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  persist(answers)
                  setReviewing(true)
                }}
              >
                Review answers
              </Button>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            Your progress is saved so you can leave and resume later.
          </p>
        </section>
      ) : null}
    </div>
  )
}
