import { Link } from '@tanstack/react-router'
import { CheckCircle2, Circle, Lock } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { type CourseDetail, LESSON_ICON, lessonPoints } from './shared'

/** Course outline used in the desktop sidebar and the mobile sheet. */
export function LessonOutline({
  data,
  currentId,
  designated,
  onNavigate,
}: {
  data: CourseDetail
  currentId: string
  designated: boolean
  onNavigate?: () => void
}) {
  const { course, completion, progress } = data
  const done = progress?.completedLessonIds ?? []
  return (
    <nav aria-label="Course outline" className="grid gap-4">
      <div className="grid gap-1.5">
        <p className="font-heading font-semibold text-navy leading-snug">{course.title}</p>
        <Progress value={completion.percent} aria-label="Course progress" className="h-1.5" />
        <p className="text-muted-foreground text-xs">
          {completion.done} of {completion.total} complete
        </p>
      </div>
      <ol className="grid gap-1">
        {course.lessons.map((l, i) => {
          const complete = done.includes(l.id)
          const current = l.id === currentId
          const Icon = LESSON_ICON[l.type]
          return (
            <li key={l.id}>
              <Link
                to="/portal/learn/$courseId/$lessonId"
                params={{ courseId: course.id, lessonId: l.id }}
                onClick={onNavigate}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted',
                  current && 'bg-blue-50 ring-1 ring-blue/30',
                )}
              >
                {complete ? (
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-success"
                    aria-label="Completed"
                  />
                ) : data.state === 'locked' ? (
                  <Lock
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-label="Locked"
                  />
                ) : (
                  <Circle
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-label="Not completed"
                  />
                )}
                <span className="grid min-w-0 gap-0.5">
                  <span className={cn('leading-snug', current && 'font-medium text-navy')}>
                    {i + 1}. {l.title}
                  </span>
                  <span className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Icon className="size-3" aria-hidden /> {l.minutes} min · +
                    {lessonPoints(l, designated)} pts
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
