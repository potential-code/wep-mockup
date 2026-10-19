import { Link } from '@tanstack/react-router'
import { CheckCircle2, Circle, Lock } from 'lucide-react'
import { SectionCard } from '@/components/shared/Cards'
import {
  type CourseDetail,
  LESSON_ICON,
  LESSON_TYPE_LABEL,
  lessonPoints,
  nextLessonId,
} from './shared'

/** Module / lesson list with complete, up-next and locked states. */
export function LessonList({ data, designated }: { data: CourseDetail; designated: boolean }) {
  const { course, progress, state } = data
  const done = progress?.completedLessonIds ?? []
  const nextId = nextLessonId(course, done)
  const locked = state === 'locked'
  return (
    <SectionCard
      title="Lessons"
      description={`${course.lessons.length} lessons · complete each one to earn points`}
    >
      <ol className="divide-y">
        {course.lessons.map((l, i) => {
          const complete = done.includes(l.id)
          const isNext = !complete && l.id === nextId && !locked
          const Icon = LESSON_ICON[l.type]
          const content = (
            <>
              <span className="mt-0.5 shrink-0">
                {locked ? (
                  <Lock className="size-5 text-muted-foreground" aria-label="Locked" />
                ) : complete ? (
                  <CheckCircle2 className="size-5 text-success" aria-label="Completed" />
                ) : (
                  <Circle
                    className={`size-5 ${isNext ? 'text-blue' : 'text-muted-foreground'}`}
                    aria-label={isNext ? 'Up next' : 'Not started'}
                  />
                )}
              </span>
              <span className="grid min-w-0 flex-1 gap-0.5">
                <span className="font-medium text-navy">
                  {i + 1}. {l.title}
                </span>
                <span className="flex flex-wrap items-center gap-x-3 text-muted-foreground text-xs">
                  <span className="inline-flex items-center gap-1">
                    <Icon className="size-3.5" aria-hidden /> {LESSON_TYPE_LABEL[l.type]}
                  </span>
                  <span>{l.minutes} min</span>
                  <span className="text-gold-700">+{lessonPoints(l, designated)} pts</span>
                </span>
              </span>
              {isNext ? (
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-medium text-blue-600 text-xs">
                  Up next
                </span>
              ) : null}
            </>
          )
          return (
            <li key={l.id}>
              {locked ? (
                <div className="flex items-start gap-3 py-3 opacity-70">{content}</div>
              ) : (
                <Link
                  to="/portal/learn/$courseId/$lessonId"
                  params={{ courseId: course.id, lessonId: l.id }}
                  className="-mx-2 flex items-start gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/60"
                >
                  {content}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </SectionCard>
  )
}
