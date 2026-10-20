import { Link } from '@tanstack/react-router'
import { ArrowRight, Sparkles, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatNumber } from '@/lib/format'
import type { MyLearning } from './shared'

/** Header band: progress, next recommended action and points earned. */
export function PathSummary({ data }: { data: MyLearning }) {
  const cur = data.current
  const next = cur?.nextLesson
  const total = data.courses.reduce((n, c) => n + c.completion.total, 0)
  const done = data.courses.reduce((n, c) => n + c.completion.done, 0)
  const pct = Math.round((done / Math.max(1, total)) * 100)
  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <section className="grid gap-4 rounded-2xl bg-navy p-6 text-white shadow-card sm:p-7">
        <div className="grid gap-1">
          <p className="font-medium text-coral-300 text-sm">Next recommended action</p>
          <h2 className="font-heading font-medium text-xl leading-snug sm:text-2xl">
            {cur && next ? `${cur.course.title}: ${next.title}` : 'You have finished your pathway'}
          </h2>
          {cur && next ? (
            <p className="text-sm text-white/75">
              About {cur.remainingMinutes} minutes left in this course · {cur.completion.done} of{' '}
              {cur.completion.total} lessons done
            </p>
          ) : (
            <p className="text-sm text-white/75">
              Explore the catalogue for more topics, or register for your clinic.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {cur && next ? (
            <Button asChild variant="coral" size="lg">
              <Link
                to="/portal/learn/$courseId/$lessonId"
                params={{ courseId: cur.course.id, lessonId: next.id }}
              >
                {cur.completion.done > 0 ? 'Continue learning' : 'Start learning'}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="coral" size="lg">
              <Link to="/portal/learn/catalogue">Browse courses</Link>
            </Button>
          )}
        </div>
      </section>
      <section className="grid gap-4 rounded-2xl border bg-card p-6 shadow-card">
        <div className="grid gap-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-medium text-navy text-sm">Pathway progress</h2>
            <span className="font-heading font-medium text-navy text-xl">{pct}%</span>
          </div>
          <Progress value={pct} aria-label="Pathway progress" className="h-2.5" />
          <p className="text-muted-foreground text-xs">
            {data.courses.filter((c) => c.state === 'complete').length} of {data.courses.length}{' '}
            courses complete
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-muted/60 p-3">
            <dt className="flex items-center gap-1 text-muted-foreground text-xs">
              <Trophy className="size-3.5" aria-hidden /> Points earned
            </dt>
            <dd className="font-heading font-medium text-navy text-lg">
              {formatNumber(data.balance.lifetime)}
            </dd>
          </div>
          <div className="rounded-xl bg-muted/60 p-3">
            <dt className="flex items-center gap-1 text-muted-foreground text-xs">
              <Sparkles className="size-3.5" aria-hidden /> Clinic qualifying
            </dt>
            <dd className="font-heading font-medium text-navy text-lg">
              {data.clinic.qualifying}/{data.clinic.required}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
