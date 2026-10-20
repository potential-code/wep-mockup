import { DEMO_RULES } from '@shared/rules'
import type { QuizQuestion } from '@shared/types'
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useSubmitPreTest, useSubmitQuiz } from '@/queries/learning.queries'

export interface QuizOutcome {
  score: number
  passed: boolean
  pointsAwarded: number
  courseCompleted: boolean
  clinicUnlocked?: string
}

type Result = Awaited<ReturnType<ReturnType<typeof useSubmitQuiz>['mutateAsync']>>

/**
 * One question at a time, then a review with explanations. The post-test uses the configurable
 * demo pass mark; the pre-test is an ungraded starting check.
 */
export function QuizRunner({
  courseId,
  lessonId,
  questions,
  kind = 'post',
  bestScore,
  onResult,
}: {
  courseId: string
  /** The post-test quiz lesson. Omitted for the pre-test. */
  lessonId?: string
  questions: QuizQuestion[]
  kind?: 'pre' | 'post'
  bestScore?: number
  onResult: (r: QuizOutcome) => void
}) {
  const pre = kind === 'pre'
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<Result | null>(null)
  const submitQuiz = useSubmitQuiz()
  const submitPre = useSubmitPreTest()
  const pending = submitQuiz.isPending || submitPre.isPending
  const send = () => {
    const onSuccess = (r: Result) => {
      setResult(r)
      onResult(r)
    }
    if (pre) submitPre.mutate({ courseId, answers }, { onSuccess })
    else submitQuiz.mutate({ courseId, lessonId: lessonId as string, answers }, { onSuccess })
  }
  const q = questions[index]
  const last = index === questions.length - 1

  const retry = () => {
    setAnswers({})
    setIndex(0)
    setResult(null)
  }

  if (result) {
    return (
      <div className="grid gap-5">
        <div
          role="status"
          className={cn(
            'rounded-2xl border p-5',
            pre
              ? 'border-blue/30 bg-blue-50/60'
              : result.passed
                ? 'border-success/40 bg-success-soft/40'
                : 'border-warning/40 bg-warning-soft/40',
          )}
        >
          <p className="font-heading font-medium text-navy text-xl">
            {pre ? 'Starting point recorded' : result.passed ? 'Passed' : 'Not quite yet'}:{' '}
            {result.score}%
          </p>
          <p className="text-sm">
            {result.correct} of {result.total} correct ·{' '}
            {pre
              ? 'not graded, no points. Compare it with your post-test at the end.'
              : `pass mark ${result.passMark}% (demo threshold, configurable by UN Women).`}
          </p>
        </div>
        <ol className="grid gap-3">
          {questions.map((qq, i) => {
            const r = result.review.find((x) => x.id === qq.id)
            return (
              <li key={qq.id} className="rounded-xl border bg-card p-4">
                <p className="flex items-start gap-2 font-medium text-navy">
                  {r?.correct ? (
                    <CheckCircle2
                      className="mt-0.5 size-5 shrink-0 text-success"
                      aria-label="Correct"
                    />
                  ) : (
                    <XCircle
                      className="mt-0.5 size-5 shrink-0 text-danger"
                      aria-label="Incorrect"
                    />
                  )}
                  <span>
                    {i + 1}. {qq.text}
                  </span>
                </p>
                <p className="mt-2 ps-7 text-sm">
                  Your answer: {qq.options[answers[qq.id] ?? -1] ?? 'No answer'}
                  {r?.correct ? null : (
                    <>
                      <br />
                      Correct answer: {qq.options[qq.correctIndex]}
                    </>
                  )}
                </p>
                <p className="mt-1 ps-7 text-muted-foreground text-sm">{r?.explanation}</p>
              </li>
            )
          })}
        </ol>
        {pre || !result.passed ? (
          <Button onClick={retry} className="justify-self-start">
            <RotateCcw aria-hidden /> {pre ? 'Retake pre-test' : 'Retake post-test'}
          </Button>
        ) : null}
      </div>
    )
  }

  if (!q) return null
  return (
    <div className="grid gap-5">
      <div className="grid gap-1.5">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-navy">
            Question {index + 1} of {questions.length}
          </span>
          <span className="text-muted-foreground">
            {pre ? 'Not graded' : `Pass mark ${DEMO_RULES.quizPassMark}% (demo)`}
            {bestScore ? ` · best ${bestScore}%` : ''}
          </span>
        </div>
        <Progress
          value={((index + 1) / questions.length) * 100}
          aria-label="Quiz progress"
          className="h-1.5"
        />
      </div>
      <fieldset className="grid gap-3">
        <legend className="mb-1 font-heading font-medium text-lg text-navy">{q.text}</legend>
        {q.options.map((opt, i) => {
          const chosen = answers[q.id] === i
          return (
            <label
              key={opt}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 text-sm transition-colors hover:bg-muted/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue',
                chosen && 'border-blue bg-blue-50',
              )}
            >
              <input
                type="radio"
                name={q.id}
                checked={chosen}
                onChange={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                className="mt-0.5 accent-[var(--color-blue)]"
              />
              <span>{opt}</span>
            </label>
          )
        })}
      </fieldset>
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          Previous
        </Button>
        {last ? (
          <Button
            disabled={pending || Object.keys(answers).length < questions.length}
            onClick={send}
          >
            {pending ? 'Checking…' : 'Submit answers'}
          </Button>
        ) : (
          <Button disabled={answers[q.id] === undefined} onClick={() => setIndex((i) => i + 1)}>
            Next question
          </Button>
        )}
      </div>
    </div>
  )
}
