import { Link } from '@tanstack/react-router'
import { ArrowRight, Clock, Sparkles } from 'lucide-react'
import { DemoLabel } from '@/components/shared/Cards'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { useMyLearning } from '@/queries/learning.queries'

type Current = NonNullable<NonNullable<ReturnType<typeof useMyLearning>['data']>['current']>

/** The one big next action: straight into the next lesson of the current course. */
export function ContinueHero({ current, firstName }: { current?: Current; firstName: string }) {
  if (!current)
    return (
      <section className="grid gap-3 rounded-2xl bg-navy p-6 text-white sm:p-8">
        <h2 className="font-heading font-semibold text-2xl">You have finished your pathway</h2>
        <p className="max-w-xl text-white/80">
          Well done, {firstName}. Browse the catalogue to keep building skills and earning points.
        </p>
        <Button asChild variant="gold" className="w-fit">
          <Link to="/portal/learn/catalogue">
            Browse courses <ArrowRight aria-hidden />
          </Link>
        </Button>
      </section>
    )
  const { course, completion, nextLesson, remainingMinutes } = current
  const remainingLessons = nextLesson
    ? course.lessons.slice(course.lessons.findIndex((l) => l.id === nextLesson.id))
    : []
  const pointsAvailable = remainingLessons.reduce(
    (n, l) => n + (l.type === 'quiz' && course.designated ? 100 : 25),
    0,
  )
  return (
    <section
      aria-labelledby="continue-heading"
      className="relative isolate overflow-hidden rounded-2xl bg-navy text-white shadow-card"
    >
      <img
        src={course.image}
        alt=""
        className="absolute inset-0 -z-10 size-full object-cover opacity-25"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/90 to-navy/60" />
      <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-3">
          <p className="flex items-center gap-2 font-medium text-gold text-sm">
            Continue your learning
            <DemoLabel className="border-white/30 bg-white/10 text-white">
              Proposed course content
            </DemoLabel>
          </p>
          <h2 id="continue-heading" className="font-heading font-bold text-2xl sm:text-3xl">
            {course.title}
          </h2>
          <p className="max-w-xl text-white/80">
            {nextLesson ? `Up next: ${nextLesson.title}` : course.objective}
          </p>
          <div className="grid max-w-md gap-1.5">
            <div className="flex justify-between text-sm text-white/80">
              <span>
                {completion.done} of {completion.total} steps complete
              </span>
              <span className="tabular-nums">{completion.percent}%</span>
            </div>
            <Progress
              value={completion.percent}
              aria-label="Course progress"
              className="h-2 bg-white/20 [&>div]:bg-gold"
            />
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/85">
            <li className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              About {remainingMinutes} min remaining
            </li>
            <li className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-gold" aria-hidden />
              {pointsAvailable} points available
            </li>
          </ul>
        </div>
        {nextLesson ? (
          <Button asChild size="xl" variant="gold">
            <Link
              to="/portal/learn/$courseId/$lessonId"
              params={{ courseId: course.id, lessonId: nextLesson.id }}
            >
              {completion.done === 0 ? 'Start lesson' : 'Continue lesson'}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        ) : null}
      </div>
    </section>
  )
}
