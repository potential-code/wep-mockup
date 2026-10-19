import { POINTS_RULES } from '@shared/rules'
import type { Course, Lesson } from '@shared/types'
import type { LucideIcon } from 'lucide-react'
import { BookOpen, CircleHelp, MessageSquareText, PlayCircle } from 'lucide-react'
import { StatusBadge, type Tone } from '@/components/shared/StatusBadge'
import type { useCourse, useCourses, useMyLearning } from '@/queries/learning.queries'

export type MyLearning = NonNullable<ReturnType<typeof useMyLearning>['data']>
export type CourseRow = NonNullable<ReturnType<typeof useCourses>['data']>[number]
export type CourseDetail = NonNullable<ReturnType<typeof useCourse>['data']>
export type CourseStateName = 'complete' | 'in_progress' | 'available' | 'locked'

export const LESSON_ICON: Record<Lesson['type'], LucideIcon> = {
  video: PlayCircle,
  reading: BookOpen,
  quiz: CircleHelp,
  reflection: MessageSquareText,
}

export const LESSON_TYPE_LABEL: Record<Lesson['type'], string> = {
  video: 'Video',
  reading: 'Reading',
  quiz: 'Quiz',
  reflection: 'Reflection',
}

/** Points a learner can earn from a whole course (designated quiz pays the larger quiz award). */
export function coursePoints(course: Course, designated: boolean) {
  return course.lessons.reduce((n, l) => {
    if (l.type === 'quiz')
      return n + (designated ? POINTS_RULES.quiz_pass.amount : POINTS_RULES.lesson_complete.amount)
    return n + POINTS_RULES.lesson_complete.amount
  }, 0)
}

export const lessonPoints = (l: Lesson, designated: boolean) =>
  l.type === 'quiz' && designated
    ? POINTS_RULES.quiz_pass.amount
    : POINTS_RULES.lesson_complete.amount

export const courseMinutes = (c: Course) => c.lessons.reduce((n, l) => n + l.minutes, 0)

const STATE_META: Record<CourseStateName, { tone: Tone; label: string }> = {
  complete: { tone: 'success', label: 'Complete' },
  in_progress: { tone: 'info', label: 'In progress' },
  available: { tone: 'neutral', label: 'Available' },
  locked: { tone: 'locked', label: 'Locked' },
}

export function CourseStateBadge({ state }: { state: CourseStateName }) {
  const m = STATE_META[state]
  return <StatusBadge tone={m.tone}>{m.label}</StatusBadge>
}

/** First lesson not yet completed, or the first lesson when the course is finished. */
export function nextLessonId(course: Course, completed: string[], lastLessonId?: string) {
  const next = course.lessons.find((l) => !completed.includes(l.id))
  return next?.id ?? lastLessonId ?? (course.lessons[0] as Lesson).id
}
