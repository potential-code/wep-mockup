// Learning paths, course player and quiz rules (brief §12). Points come from unique,
// verified completion events; reopening a lesson never re-awards.

import { unitsOf } from '@shared/courses'
import { departmentLabel } from '@shared/reference'
import { DEMO_RULES } from '@shared/rules'
import type { Course, CourseProgress, DepartmentId, LearningPath } from '@shared/types'
import { learningPaths } from '@/mocks/seed/courses'
import {
  ApiError,
  commit,
  db,
  delay,
  findOr404,
  notify,
  now,
  out,
  requireCapability,
  requireUser,
} from './api'
import { evaluateClinicEligibility } from './clinics.service'
import { award, pointsBalance } from './points.service'

export type LessonState = 'complete' | 'available' | 'locked'
export type CourseState = 'complete' | 'in_progress' | 'available' | 'locked'

export function pathForDepartment(dept?: DepartmentId): LearningPath {
  return learningPaths.find((p) => p.department === dept) ?? (learningPaths[0] as LearningPath)
}

const progressOf = (userId: string, courseId: string) =>
  db.progress.find((p) => p.userId === userId && p.courseId === courseId)

function courseState(userId: string, course: Course): CourseState {
  const p = progressOf(userId, course.id)
  if (p?.completedAt) return 'complete'
  if (p && p.completedLessonIds.length > 0) return 'in_progress'
  if (course.prerequisiteCourseId && !progressOf(userId, course.prerequisiteCourseId)?.completedAt)
    return 'locked'
  return 'available'
}

export function courseCompletion(userId: string, course: Course) {
  const p = progressOf(userId, course.id)
  const done = p?.completedLessonIds.length ?? 0
  return {
    done,
    total: course.lessons.length,
    percent: Math.round((done / course.lessons.length) * 100),
  }
}

const RELEVANCE: Record<DepartmentId, string> = {
  hr: 'Recommended because you work in Human Resources and your company prioritises fair recruitment.',
  procurement:
    'Recommended because you work in Procurement and your company is growing spend with women-owned suppliers.',
  marketing: 'Recommended because you work in Marketing and Communications.',
  sustainability: 'Recommended because you coordinate sustainability reporting.',
  operations: 'Recommended because you manage operational teams and shift patterns.',
  leadership: 'Recommended for leaders who own the company’s WEPs commitment.',
}

export async function getMyLearning() {
  await delay()
  const user = requireCapability('learn.use')
  const path = pathForDepartment(user.department)
  const pathCourses = path.courseIds
    .map((id) => db.courses.find((c) => c.id === id))
    .filter((c): c is Course => Boolean(c))
    .map((c, i) => ({
      course: c,
      state: courseState(user.id, c),
      completion: courseCompletion(user.id, c),
      reason:
        i === 0
          ? RELEVANCE[user.department ?? 'hr']
          : `Builds on ${pathCourses0Title(path)} for ${departmentLabel(user.department)}.`,
    }))
  const designated = db.courses.find((c) => c.id === path.designatedCourseId)
  const current =
    pathCourses.find((pc) => pc.state === 'in_progress') ??
    pathCourses.find((pc) => pc.state === 'available')
  const lastProgress = current ? progressOf(user.id, current.course.id) : undefined
  const nextLesson = current?.course.lessons.find(
    (l) => !lastProgress?.completedLessonIds.includes(l.id),
  )
  const pathDone = pathCourses.filter((pc) => pc.state === 'complete').length
  return out({
    path,
    departmentLabel: departmentLabel(user.department),
    courses: pathCourses,
    designatedCourseId: designated?.id,
    current: current
      ? {
          ...current,
          nextLesson,
          remainingMinutes: current.course.lessons
            .filter((l) => !lastProgress?.completedLessonIds.includes(l.id))
            .reduce((n, l) => n + l.minutes, 0),
        }
      : undefined,
    pathPercent: Math.round((pathDone / Math.max(1, pathCourses.length)) * 100),
    balance: pointsBalance(user.id),
    clinic: evaluateClinicEligibility(user.id, path.clinicId),
  })
}

function pathCourses0Title(path: LearningPath) {
  return db.courses.find((c) => c.id === path.courseIds[0])?.title ?? 'your pathway'
}

export async function listCourses() {
  await delay()
  const user = requireUser()
  return out(
    db.courses
      .filter((c) => c.published)
      .map((c) => ({
        course: c,
        state: courseState(user.id, c),
        completion: courseCompletion(user.id, c),
      })),
  )
}

export async function getCourse(courseId: string) {
  await delay()
  const user = requireUser()
  const course = findOr404(db.courses, (c) => c.id === courseId, 'Course')
  const progress = progressOf(user.id, courseId)
  return out({
    course,
    progress: progress ?? null,
    state: courseState(user.id, course),
    completion: courseCompletion(user.id, course),
    relatedEvent: course.relatedEventId
      ? db.events.find((e) => e.id === course.relatedEventId)
      : undefined,
    eligibility: course.relatedEventId
      ? evaluateClinicEligibility(user.id, course.relatedEventId)
      : undefined,
  })
}

function ensureProgress(userId: string, courseId: string): CourseProgress {
  let p = progressOf(userId, courseId)
  if (!p) {
    p = {
      userId,
      courseId,
      completedLessonIds: [],
      quizScores: {},
      startedAt: now(),
      reflections: {},
    }
    db.progress.push(p)
  }
  return p
}

function isDesignatedFor(userId: string, courseId: string) {
  const user = db.users.find((u) => u.id === userId)
  return pathForDepartment(user?.department).designatedCourseId === courseId
}

/** Finish the course when every lesson is complete; announce a newly unlocked clinic. */
function maybeComplete(userId: string, course: Course, p: CourseProgress) {
  if (p.completedAt)
    return { courseCompleted: false, clinicUnlocked: undefined as string | undefined }
  const all = course.lessons.every((l) => p.completedLessonIds.includes(l.id))
  if (!all) return { courseCompleted: false, clinicUnlocked: undefined }
  p.completedAt = now()
  let clinicUnlocked: string | undefined
  if (course.relatedEventId) {
    const elig = evaluateClinicEligibility(userId, course.relatedEventId)
    if (elig.eligible) {
      clinicUnlocked = course.relatedEventId
      const evt = db.events.find((e) => e.id === course.relatedEventId)
      notify({
        userId,
        category: 'clinic',
        title: 'Clinic unlocked',
        body: `You can now register for ${evt?.title}.`,
        link: `/portal/clinics/${course.relatedEventId}`,
        critical: false,
      })
    }
  }
  return { courseCompleted: true, clinicUnlocked }
}

export async function completeLesson(courseId: string, lessonId: string) {
  await delay(300)
  const user = requireCapability('learn.use')
  const course = findOr404(db.courses, (c) => c.id === courseId, 'Course')
  const lesson = findOr404(course.lessons, (l) => l.id === lessonId, 'Lesson')
  if (lesson.type === 'quiz') throw new ApiError('Submit the quiz to complete this lesson.')
  const p = ensureProgress(user.id, courseId)
  p.lastLessonId = lessonId
  if (!p.completedLessonIds.includes(lessonId)) p.completedLessonIds.push(lessonId)
  const awarded = award(user.id, 'lesson_complete', `lesson:${lessonId}`, `${lesson.title}`, {
    qualifying: isDesignatedFor(user.id, courseId),
    sourceLink: `/portal/learn/${courseId}/${lessonId}`,
  })
  const result = maybeComplete(user.id, course, p)
  commit()
  return out({ pointsAwarded: awarded?.amount ?? 0, ...result, balance: pointsBalance(user.id) })
}

export async function saveReflection(courseId: string, lessonId: string, text: string) {
  await delay(150)
  const user = requireUser()
  const p = ensureProgress(user.id, courseId)
  p.reflections[lessonId] = text
  commit()
}

export async function submitQuiz(
  courseId: string,
  lessonId: string,
  answers: Record<string, number>,
) {
  await delay(400)
  const user = requireCapability('learn.use')
  const course = findOr404(db.courses, (c) => c.id === courseId, 'Course')
  const lesson = findOr404(course.lessons, (l) => l.id === lessonId, 'Quiz')
  const questions = lesson.quiz ?? []
  const p = ensureProgress(user.id, courseId)
  const alreadyPassed = p.completedLessonIds.includes(lessonId)
  if (!alreadyPassed && unitsOf(course).some((l) => !p.completedLessonIds.includes(l.id)))
    throw new ApiError('Complete every unit before taking the post-test.')
  const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length
  const score = Math.round((correct / Math.max(1, questions.length)) * 100)
  const passed = score >= DEMO_RULES.quizPassMark
  p.quizScores[lessonId] = Math.max(score, p.quizScores[lessonId] ?? 0)
  p.quizAttempts = { ...p.quizAttempts, [lessonId]: (p.quizAttempts?.[lessonId] ?? 0) + 1 }
  p.lastLessonId = lessonId
  let pointsAwarded = 0
  let result: ReturnType<typeof maybeComplete> = {
    courseCompleted: false,
    clinicUnlocked: undefined,
  }
  if (passed) {
    if (!p.completedLessonIds.includes(lessonId)) p.completedLessonIds.push(lessonId)
    const designated = isDesignatedFor(user.id, courseId)
    const ev = designated
      ? award(
          user.id,
          'quiz_pass',
          `quiz:${lessonId}`,
          `${course.title} path quiz passed (${score}%)`,
          { qualifying: true, sourceLink: `/portal/learn/${courseId}` },
        )
      : award(user.id, 'lesson_complete', `lesson:${lessonId}`, `${course.title} quiz passed`, {
          sourceLink: `/portal/learn/${courseId}`,
        })
    pointsAwarded = ev?.amount ?? 0
    result = maybeComplete(user.id, course, p)
  }
  commit()
  return out({
    score,
    passed,
    correct,
    total: questions.length,
    passMark: DEMO_RULES.quizPassMark as number,
    review: questions.map((q) => ({
      id: q.id,
      correct: answers[q.id] === q.correctIndex,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    })),
    pointsAwarded,
    ...result,
    balance: pointsBalance(user.id),
  })
}

/** Ungraded starting check before the modules. Records the score; never awards points. */
export async function submitPreTest(courseId: string, answers: Record<string, number>) {
  await delay(300)
  const user = requireCapability('learn.use')
  const course = findOr404(db.courses, (c) => c.id === courseId, 'Course')
  const questions = course.preTest?.questions ?? []
  if (!questions.length) throw new ApiError('This course has no pre-test.')
  const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length
  const score = Math.round((correct / questions.length) * 100)
  const p = ensureProgress(user.id, courseId)
  p.preTestScores = [...(p.preTestScores ?? []), score]
  commit()
  return out({
    score,
    passed: true,
    correct,
    total: questions.length,
    passMark: 0,
    review: questions.map((q) => ({
      id: q.id,
      correct: answers[q.id] === q.correctIndex,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    })),
    pointsAwarded: 0,
    courseCompleted: false,
    clinicUnlocked: undefined as string | undefined,
    balance: pointsBalance(user.id),
  })
}

/** Company administrators see readiness for their own team, by department. */
export async function getTeamReadiness(companyId: string) {
  await delay()
  requireCapability('company.manage_team')
  const members = db.users.filter((u) => u.companyId === companyId && u.role !== 'ceo')
  const byDept = new Map<
    DepartmentId,
    { enrolled: number; prerequisitesDone: number; eligible: number; active: number }
  >()
  for (const u of members) {
    const d = u.department ?? 'operations'
    const row = byDept.get(d) ?? { enrolled: 0, prerequisitesDone: 0, eligible: 0, active: 0 }
    if (u.invitationStatus === 'accepted') row.active++
    const path = pathForDepartment(d)
    const prog = progressOf(u.id, path.designatedCourseId)
    if (prog) row.enrolled++
    if (prog?.completedAt) row.prerequisitesDone++
    if (evaluateClinicEligibility(u.id, path.clinicId).eligible) row.eligible++
    byDept.set(d, row)
  }
  return out(
    [...byDept.entries()].map(([department, v]) => ({
      department,
      label: departmentLabel(department),
      ...v,
    })),
  )
}
