import { DIFFICULTY_LABEL, unitsOf } from '@shared/courses'
import { DEMO_RULES } from '@shared/rules'
import type { Course, QuizQuestion } from '@shared/types'
import {
  Check,
  CheckCircle2,
  Clock,
  Layers,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { type QuizOutcome, QuizRunner } from './QuizRunner'
import { courseMinutes, coursePoints } from './shared'

/** Top course card: cover, level, title, the item in view and overall progress. */
export function CourseTopCard({
  course,
  now,
  percent,
}: {
  course: Course
  now: string
  percent: number
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--navy-900),var(--navy)_55%,var(--navy-700))] p-5 text-white shadow-card sm:p-7">
      <img
        src={course.image}
        alt=""
        className="-z-10 absolute inset-0 size-full object-cover opacity-10 blur-sm"
      />
      <div className="grid items-center gap-5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-7">
        <img
          src={course.image}
          alt=""
          className="aspect-video w-full rounded-xl object-cover shadow-lift ring-1 ring-white/15"
        />
        <div className="grid min-w-0 gap-2.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-coral/50 bg-white/5 px-3 py-1 font-semibold text-[0.7rem] text-coral-300 uppercase tracking-[0.16em]">
            <Sparkles className="size-3" aria-hidden />
            {DIFFICULTY_LABEL[course.difficulty ?? 'beginner']}
          </span>
          <h1 className="text-balance font-medium font-heading text-2xl leading-tight sm:text-4xl">
            {course.title}
          </h1>
          <p className="truncate text-sm text-white/90">
            Now: <span className="font-medium text-white">{now}</span>
          </p>
          <div className="mt-1 grid gap-1.5">
            <div className="flex items-center justify-between font-semibold text-[0.7rem] uppercase tracking-[0.16em]">
              <span className="text-white/90">Progress</span>
              <span className="text-sm tabular-nums">{percent}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Course progress"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 overflow-hidden rounded-full bg-white/15"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-coral to-[#ff8f85] transition-[width] duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Shared frame for the right-hand panel: chip, title, summary, then the item itself. */
export function ContentPanel({
  chip,
  chipTone = 'blue',
  title,
  summary,
  children,
}: {
  chip: string
  chipTone?: 'blue' | 'coral' | 'navy'
  title: string
  summary?: string
  children: ReactNode
}) {
  return (
    <section
      aria-labelledby="item-title"
      className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 rounded-2xl border bg-card p-5 shadow-card sm:p-7"
    >
      <div className="grid gap-1.5">
        <span
          className={cn(
            'w-fit rounded-full px-2.5 py-1 font-semibold text-[0.65rem] uppercase tracking-[0.16em]',
            chipTone === 'coral' && 'bg-coral-50 text-coral-700',
            chipTone === 'blue' && 'bg-blue-50 text-blue-600',
            chipTone === 'navy' && 'bg-navy/5 text-navy',
          )}
        >
          {chip}
        </span>
        <h2 id="item-title" className="font-heading font-medium text-navy text-xl sm:text-2xl">
          {title}
        </h2>
        {summary ? <p className="text-muted-foreground">{summary}</p> : null}
      </div>
      {children}
    </section>
  )
}

function TestStat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="grid justify-items-center gap-0.5 rounded-xl border bg-surface/50 px-2 py-3 text-center">
      <span className="font-semibold font-heading text-lg text-navy tabular-nums">{value}</span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  )
}

/** Pre-test or post-test: attempts, best score and pass mark, the last result, and the runner. */
export function TestPanel({
  kind,
  courseId,
  lessonId,
  questions,
  attempts,
  best,
  latest,
  passed,
  locked,
  unitsLeft,
  onResult,
}: {
  kind: 'pre' | 'post'
  courseId: string
  lessonId?: string
  questions: QuizQuestion[]
  attempts: number
  best?: number
  latest?: number
  passed: boolean
  locked: boolean
  unitsLeft: number
  onResult: (r: QuizOutcome) => void
}) {
  const pre = kind === 'pre'
  const [run, setRun] = useState(0)
  const started = run > 0

  if (locked)
    return (
      <div className="grid justify-items-start gap-3 rounded-xl border border-dashed bg-surface/50 p-5">
        <p className="flex items-center gap-2 font-medium text-navy">
          <Lock className="size-4" aria-hidden /> Locked until you finish every unit
        </p>
        <p className="text-muted-foreground text-sm">
          {unitsLeft} {unitsLeft === 1 ? 'unit' : 'units'} left. The post-test opens as soon as they
          are complete.
        </p>
      </div>
    )

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <TestStat value={attempts} label="Attempts made" />
        <TestStat value="Unlimited" label="Attempts remaining" />
        <TestStat value={best !== undefined ? `${best}%` : '—'} label="Best score" />
        <TestStat
          value={pre ? 'Not graded' : `${DEMO_RULES.quizPassMark}%`}
          label="Passing score"
        />
      </div>

      {attempts > 0 && !started ? (
        <p
          role="status"
          className={cn(
            'flex items-center gap-2 rounded-xl border px-4 py-3 font-medium text-sm',
            pre
              ? 'border-blue/25 bg-blue-50/70 text-blue-600'
              : passed
                ? 'border-success/30 bg-success-soft/60 text-success'
                : 'border-danger/30 bg-danger-soft/60 text-danger',
          )}
        >
          {pre ? (
            <Check className="size-4" aria-hidden />
          ) : passed ? (
            <CheckCircle2 className="size-4" aria-hidden />
          ) : (
            <XCircle className="size-4" aria-hidden />
          )}
          {pre
            ? `Starting point recorded · latest ${latest ?? best}%`
            : passed
              ? `Passed · best score ${best}%`
              : `Did not pass · attempt ${attempts} · ${latest ?? best}%`}
        </p>
      ) : null}

      {started ? (
        <QuizRunner
          key={run}
          kind={kind}
          courseId={courseId}
          lessonId={lessonId}
          questions={questions}
          bestScore={best}
          onResult={onResult}
        />
      ) : (
        <div className="grid justify-items-start gap-2">
          <Button size="lg" onClick={() => setRun(1)}>
            {attempts > 0 ? <RotateCcw aria-hidden /> : <Play aria-hidden />}
            {attempts > 0
              ? pre
                ? 'Retake pre-test'
                : 'Retake post-test'
              : pre
                ? 'Start pre-test'
                : 'Start post-test'}
          </Button>
          <p className="text-muted-foreground text-xs">
            {questions.length} questions ·{' '}
            {pre
              ? 'records what you know before the modules. No points, no pass mark.'
              : `pass mark ${DEMO_RULES.quizPassMark}% (demo rule, configurable).`}
          </p>
        </div>
      )}
    </div>
  )
}

/** Course overview: the brief's course detail content (about, outcomes, tags, points). */
export function OverviewBody({
  course,
  designated,
  action,
}: {
  course: Course
  designated: boolean
  action: ReactNode
}) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <PrincipleTag id={course.principle} />
        <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground text-xs">
          {course.topic}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground text-xs">
          {course.language}
        </span>
      </div>
      <p className="max-w-prose text-pretty leading-relaxed">{course.description}</p>
      {course.outcomes.length ? (
        <div className="grid gap-2">
          <h3 className="font-heading font-medium text-navy">What you will be able to do</h3>
          <ul className="grid gap-1.5 text-sm">
            {course.outcomes.map((o) => (
              <li key={o} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {o}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <ul className="grid gap-2 sm:grid-cols-3">
        <li className="flex items-center gap-2 rounded-xl border bg-surface/50 px-3 py-2.5 text-sm">
          <Clock className="size-4 text-blue" aria-hidden /> {courseMinutes(course)} minutes
        </li>
        <li className="flex items-center gap-2 rounded-xl border bg-surface/50 px-3 py-2.5 text-sm">
          <Layers className="size-4 text-blue" aria-hidden /> {unitsOf(course).length} units
        </li>
        <li className="flex items-center gap-2 rounded-xl border border-coral/30 bg-coral-50/60 px-3 py-2.5 font-medium text-coral-700 text-sm">
          <Sparkles className="size-4" aria-hidden /> {coursePoints(course, designated)} points
        </li>
      </ul>
      {designated ? (
        <p className="text-muted-foreground text-sm">
          This is your designated pathway course. Units and the post-test earn qualifying points
          toward clinic access.
        </p>
      ) : null}
      <div>{action}</div>
    </div>
  )
}
