import { Link } from '@tanstack/react-router'
import { ArrowRight, Clock, Layers, Lock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { type CourseDetail, courseMinutes, coursePoints, nextLessonId } from './shared'

export function CourseSidebar({ data, designated }: { data: CourseDetail; designated: boolean }) {
  const { course, state, completion, progress } = data
  const locked = state === 'locked'
  const lessonId = nextLessonId(course, progress?.completedLessonIds ?? [], progress?.lastLessonId)
  return (
    <aside className="grid gap-4 rounded-2xl border bg-card p-5 shadow-card">
      <ul className="grid gap-2 text-sm">
        <li className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" aria-hidden /> {courseMinutes(course)}{' '}
          minutes in total
        </li>
        <li className="flex items-center gap-2">
          <Layers className="size-4 text-muted-foreground" aria-hidden /> {course.lessons.length}{' '}
          lessons
        </li>
        <li className="flex items-center gap-2 font-medium text-gold-700">
          <Sparkles className="size-4" aria-hidden /> {coursePoints(course, designated)} points
          available
        </li>
      </ul>
      {state !== 'available' && !locked ? (
        <div className="grid gap-1">
          <Progress value={completion.percent} aria-label="Course progress" className="h-2" />
          <span className="text-muted-foreground text-xs">
            {completion.done} of {completion.total} lessons · {completion.percent}%
          </span>
        </div>
      ) : null}
      {locked ? (
        <p className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
          Complete the prerequisite course to unlock this one.
        </p>
      ) : (
        <Button asChild size="lg">
          <Link to="/portal/learn/$courseId/$lessonId" params={{ courseId: course.id, lessonId }}>
            {state === 'complete'
              ? 'Review course'
              : state === 'in_progress'
                ? 'Continue course'
                : 'Start course'}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      )}
      {designated ? (
        <p className="text-muted-foreground text-xs">
          This is your designated pathway course. Lessons earn qualifying points toward clinic
          access.
        </p>
      ) : null}
    </aside>
  )
}
