import type { Course, CourseDifficulty, CourseModule, Lesson } from '@shared/types'

export const DIFFICULTY_LABEL: Record<CourseDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

/** The course's post-test is its quiz lesson; everything else is a unit inside a module. */
export const postTestOf = (c: Course) => c.lessons.find((l) => l.type === 'quiz')
export const unitsOf = (c: Course) => c.lessons.filter((l) => l.type !== 'quiz')

/**
 * Modules as the builder shows them. Units not listed in any module go into the last module
 * (or a first module when there are none) so nothing is hidden.
 */
export function modulesOf(c: Course): CourseModule[] {
  const units = unitsOf(c)
  const known = new Set(units.map((u) => u.id))
  const modules = (c.modules ?? []).map((m) => ({
    ...m,
    lessonIds: m.lessonIds.filter((id) => known.has(id)),
  }))
  const placed = new Set(modules.flatMap((m) => m.lessonIds))
  const loose = units.filter((u) => !placed.has(u.id)).map((u) => u.id)
  if (loose.length === 0) return modules
  const last = modules.at(-1)
  if (!last) return [{ id: `${c.id || 'new'}-m1`, title: 'Module 1', lessonIds: loose }]
  return [...modules.slice(0, -1), { ...last, lessonIds: [...last.lessonIds, ...loose] }]
}

/** Content blocks in a unit: each paragraph plus key points, transcript and reflection. */
export const blocksOf = (l: Lesson) =>
  l.body.length +
  (l.keyPoints?.length ? 1 : 0) +
  (l.transcript ? 1 : 0) +
  (l.reflectionPrompt ? 1 : 0) +
  (l.quiz?.length ? 1 : 0)

/** Rebuilds `lessons` in module order with the post-test last, so learners follow the builder. */
export function withModules(c: Course, modules: CourseModule[]): Course {
  const byId = new Map(c.lessons.map((l) => [l.id, l]))
  const ordered = modules.flatMap((m) => m.lessonIds.map((id) => byId.get(id))).filter(Boolean)
  const post = postTestOf(c)
  return { ...c, modules, lessons: [...(ordered as Lesson[]), ...(post ? [post] : [])] }
}

export type CourseItemKind = 'overview' | 'pre-test' | 'unit' | 'post-test'

/** Learner path through a course: pre-test, units in module order, then the post-test. */
export function courseSequence(c: Course) {
  const byId = new Map(c.lessons.map((l) => [l.id, l]))
  const units = modulesOf(c).flatMap((m) =>
    m.lessonIds.map((id) => byId.get(id)).filter((l): l is Lesson => Boolean(l)),
  )
  const post = postTestOf(c)
  return [
    ...(c.preTest?.questions.length ? ['pre-test'] : []),
    ...units.map((u) => u.id),
    ...(post ? [post.id] : []),
  ]
}
