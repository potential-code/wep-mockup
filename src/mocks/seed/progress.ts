import type { CourseProgress, DepartmentId, PointsEvent, User } from '@shared/types'
import { PATH_COMPLETER_IDS, users } from './users'

// Learning progress and the points ledger. Persona balances follow brief §26:
// - Maya Chen (HR): 3 of 4 designated lessons + quiz passed = 175 qualifying points.
// - Omar Reed (Procurement): designated path complete, 620 lifetime and 620 redeemable.
// Qualifying points are those earned in the user's designated path course.

export const DESIGNATED_COURSE_BY_DEPT: Record<DepartmentId, string> = {
  hr: 'crs-inclusive-recruitment',
  operations: 'crs-inclusive-recruitment',
  procurement: 'crs-gender-responsive-procurement',
  marketing: 'crs-inclusive-communications',
  leadership: 'crs-leadership-accountability',
  sustainability: 'crs-leadership-accountability',
}

const lessons = (courseId: string, n: number) =>
  Array.from({ length: n }, (_, k) => `${courseId}-l${k + 1}`)

const fullCourse = (
  userId: string,
  courseId: string,
  lessonCount: number,
  score: number,
  done: string,
): CourseProgress => ({
  userId,
  courseId,
  completedLessonIds: [...lessons(courseId, lessonCount), `${courseId}-quiz`],
  quizScores: { [`${courseId}-quiz`]: score },
  startedAt: '2026-03-02T09:00:00.000Z',
  lastLessonId: `${courseId}-quiz`,
  completedAt: done,
  reflections: {},
})

const personaProgress: CourseProgress[] = [
  {
    userId: 'u-maya',
    courseId: 'crs-inclusive-recruitment',
    completedLessonIds: [
      ...lessons('crs-inclusive-recruitment', 3),
      'crs-inclusive-recruitment-quiz',
    ],
    quizScores: { 'crs-inclusive-recruitment-quiz': 80 },
    startedAt: '2026-09-08T09:00:00.000Z',
    lastLessonId: 'crs-inclusive-recruitment-l3',
    reflections: {
      'crs-inclusive-recruitment-l3':
        'Our store manager shortlists rely on referrals from area managers. I will pilot structured scoring with two regions first.',
    },
  },
  {
    userId: 'u-maya',
    courseId: 'crs-fair-progression-pay',
    completedLessonIds: ['crs-fair-progression-pay-l1'],
    quizScores: {},
    startedAt: '2026-10-10T09:00:00.000Z',
    lastLessonId: 'crs-fair-progression-pay-l1',
    reflections: {},
  },
  fullCourse('u-omar', 'crs-gender-responsive-procurement', 4, 90, '2026-06-18T12:00:00.000Z'),
  fullCourse('u-omar', 'crs-supplier-engagement', 3, 85, '2026-07-22T12:00:00.000Z'),
  fullCourse('u-omar', 'crs-action-planning', 3, 100, '2026-08-30T12:00:00.000Z'),
  {
    userId: 'u-elena',
    courseId: 'crs-inclusive-communications',
    completedLessonIds: lessons('crs-inclusive-communications', 2),
    quizScores: {},
    startedAt: '2026-09-21T09:00:00.000Z',
    lastLessonId: 'crs-inclusive-communications-l2',
    reflections: {},
  },
  {
    userId: 'u-nora',
    courseId: 'crs-evidence-reporting',
    completedLessonIds: lessons('crs-evidence-reporting', 2),
    quizScores: {},
    startedAt: '2026-09-01T09:00:00.000Z',
    lastLessonId: 'crs-evidence-reporting-l2',
    reflections: {},
  },
  {
    userId: 'u-leila',
    courseId: 'crs-leadership-accountability',
    completedLessonIds: lessons('crs-leadership-accountability', 4),
    quizScores: {},
    startedAt: '2026-05-01T09:00:00.000Z',
    lastLessonId: 'crs-leadership-accountability-l4',
    reflections: {},
  },
]

const isGenerated = (u: User) =>
  u.role === 'employee' && !u.demoPersona && u.invitationStatus === 'accepted'

/** Completers finish their designated course; other activated colleagues are part-way. */
const generatedProgress: CourseProgress[] = users.filter(isGenerated).map((u, i) => {
  const courseId = DESIGNATED_COURSE_BY_DEPT[u.department ?? 'hr']
  if (PATH_COMPLETER_IDS.includes(u.id)) {
    return fullCourse(
      u.id,
      courseId,
      4,
      70 + ((i * 7) % 31),
      `2026-0${4 + (i % 6)}-${String(1 + (i % 27)).padStart(2, '0')}T12:00:00.000Z`,
    )
  }
  const done = 1 + (i % 3)
  return {
    userId: u.id,
    courseId,
    completedLessonIds: lessons(courseId, done),
    quizScores: {},
    startedAt: '2026-08-15T09:00:00.000Z',
    lastLessonId: `${courseId}-l${done}`,
    reflections: {},
  }
})

export const courseProgress: CourseProgress[] = [...personaProgress, ...generatedProgress]

let seq = 0
const ev = (
  userId: string,
  action: PointsEvent['action'],
  amount: number,
  sourceKey: string,
  sourceLabel: string,
  createdAt: string,
  qualifying = false,
  sourceLink?: string,
): PointsEvent => ({
  id: `pts-${++seq}`,
  userId,
  action,
  amount,
  sourceKey,
  sourceLabel,
  sourceLink,
  qualifying,
  createdAt,
})

const lessonEvents = (
  userId: string,
  courseId: string,
  ids: string[],
  qualifying: boolean,
  from: number,
) =>
  ids.map((lessonId, k) =>
    ev(
      userId,
      'lesson_complete',
      25,
      `lesson:${lessonId}`,
      `Lesson ${k + 1} completed`,
      `2026-${String(from).padStart(2, '0')}-${String(3 + k * 4).padStart(2, '0')}T10:00:00.000Z`,
      qualifying,
      `/portal/learn/${courseId}`,
    ),
  )

const mayaEvents: PointsEvent[] = [
  ev(
    'u-maya',
    'profile_complete',
    20,
    'profile:u-maya',
    'Personal profile completed',
    '2026-04-02T10:00:00.000Z',
  ),
  ...lessonEvents(
    'u-maya',
    'crs-inclusive-recruitment',
    lessons('crs-inclusive-recruitment', 3),
    true,
    9,
  ),
  ev(
    'u-maya',
    'quiz_pass',
    100,
    'quiz:crs-inclusive-recruitment-quiz',
    'Inclusive Recruitment path quiz passed (80%)',
    '2026-10-02T15:00:00.000Z',
    true,
    '/portal/learn/crs-inclusive-recruitment',
  ),
]

const omarEvents: PointsEvent[] = [
  ev(
    'u-omar',
    'profile_complete',
    20,
    'profile:u-omar',
    'Personal profile completed',
    '2026-02-11T10:00:00.000Z',
  ),
  ...lessonEvents(
    'u-omar',
    'crs-gender-responsive-procurement',
    lessons('crs-gender-responsive-procurement', 4),
    true,
    5,
  ),
  ev(
    'u-omar',
    'quiz_pass',
    100,
    'quiz:crs-gender-responsive-procurement-quiz',
    'Gender-responsive Procurement path quiz passed (90%)',
    '2026-06-18T12:00:00.000Z',
    true,
    '/portal/learn/crs-gender-responsive-procurement',
  ),
  ...lessonEvents(
    'u-omar',
    'crs-supplier-engagement',
    [...lessons('crs-supplier-engagement', 3), 'crs-supplier-engagement-quiz'],
    false,
    7,
  ),
  ...lessonEvents(
    'u-omar',
    'crs-action-planning',
    [...lessons('crs-action-planning', 3), 'crs-action-planning-quiz'],
    false,
    8,
  ),
  ev(
    'u-omar',
    'clinic_attend',
    75,
    'attend:evt-supplier-diversity-clinic',
    'Attended Supplier Diversity Clinic',
    '2026-09-17T15:00:00.000Z',
    false,
    '/portal/clinics/evt-supplier-diversity-clinic',
  ),
  ev(
    'u-omar',
    'feedback',
    10,
    'feedback:evt-supplier-diversity-clinic',
    'Clinic feedback submitted',
    '2026-09-18T09:00:00.000Z',
  ),
  ev(
    'u-omar',
    'action_contribution',
    25,
    'action:act-3:1',
    'Accepted contribution: supplier spend baseline',
    '2026-08-05T09:00:00.000Z',
    false,
    '/portal/action-plan',
  ),
  ev(
    'u-omar',
    'action_contribution',
    25,
    'action:act-3:2',
    'Accepted contribution: supplier survey results',
    '2026-09-08T09:00:00.000Z',
    false,
    '/portal/action-plan',
  ),
  ev(
    'u-omar',
    'action_contribution',
    25,
    'action:act-4:1',
    'Accepted contribution: tender criteria draft',
    '2026-10-06T09:00:00.000Z',
    false,
    '/portal/action-plan',
  ),
  ...Array.from({ length: 8 }, (_, k) =>
    ev(
      'u-omar',
      'community_contribution',
      5,
      `community:omar:${k}`,
      'Helpful community answer',
      `2026-${k < 4 ? '08' : '09'}-${String(4 + k * 3).padStart(2, '0')}T13:00:00.000Z`,
      false,
      '/portal/community',
    ),
  ),
]

const elenaEvents: PointsEvent[] = [
  ev(
    'u-elena',
    'profile_complete',
    20,
    'profile:u-elena',
    'Personal profile completed',
    '2026-05-19T10:00:00.000Z',
  ),
  ...lessonEvents(
    'u-elena',
    'crs-inclusive-communications',
    lessons('crs-inclusive-communications', 2),
    true,
    10,
  ),
]

const generatedEvents: PointsEvent[] = generatedProgress.flatMap((p) => {
  const lessonIds = p.completedLessonIds.filter((id) => !id.endsWith('-quiz'))
  const out = [
    ev(
      p.userId,
      'profile_complete',
      20,
      `profile:${p.userId}`,
      'Personal profile completed',
      p.startedAt,
    ),
    ...lessonEvents(p.userId, p.courseId, lessonIds, true, 8),
  ]
  if (p.completedAt) {
    out.push(
      ev(
        p.userId,
        'quiz_pass',
        100,
        `quiz:${p.courseId}-quiz`,
        'Path quiz passed',
        p.completedAt,
        true,
        `/portal/learn/${p.courseId}`,
      ),
    )
  }
  return out
})

const leilaEvents: PointsEvent[] = [
  ev(
    'u-leila',
    'profile_complete',
    20,
    'profile:u-leila',
    'Personal profile completed',
    '2026-05-01T10:00:00.000Z',
  ),
  ...lessonEvents(
    'u-leila',
    'crs-leadership-accountability',
    lessons('crs-leadership-accountability', 4),
    true,
    5,
  ),
]

const noraEvents: PointsEvent[] = [
  ev(
    'u-nora',
    'profile_complete',
    20,
    'profile:u-nora',
    'Personal profile completed',
    '2026-03-22T10:00:00.000Z',
  ),
  ...lessonEvents(
    'u-nora',
    'crs-evidence-reporting',
    lessons('crs-evidence-reporting', 2),
    false,
    9,
  ),
  ev(
    'u-nora',
    'clinic_attend',
    75,
    'attend:evt-gap-analysis-webinar',
    'Attended From Baseline to Action Plan',
    '2026-08-20T11:00:00.000Z',
    false,
    '/portal/clinics/evt-gap-analysis-webinar',
  ),
]

export const pointsEvents: PointsEvent[] = [
  ...leilaEvents,
  ...noraEvents,
  ...mayaEvents,
  ...omarEvents,
  ...elenaEvents,
  ...generatedEvents,
]
