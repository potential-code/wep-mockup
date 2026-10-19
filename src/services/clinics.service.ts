// Clinics and webinars (brief §14). Registration spends no points; eligibility uses lifetime
// qualifying learning points plus completion of the designated course, so later mentorship
// redemption never removes clinic access.

import { fullName } from '@shared/permissions'
import type { ClinicEvent, Registration } from '@shared/types'
import {
  ApiError,
  commit,
  db,
  delay,
  findOr404,
  newId,
  notify,
  now,
  out,
  requireCapability,
  requireUser,
} from './api'
import { award, pointsBalance } from './points.service'

export type ClinicStatus =
  | 'locked'
  | 'eligible'
  | 'registered'
  | 'waitlisted'
  | 'completed'
  | 'recording'
  | 'full'

export interface Eligibility {
  eventId: string
  eligible: boolean
  courseComplete: boolean
  courseId?: string
  courseTitle?: string
  lessonsDone: number
  lessonsTotal: number
  qualifying: number
  required: number
  remaining: string[]
}

export function evaluateClinicEligibility(userId: string, eventId: string): Eligibility {
  const event = db.events.find((e) => e.id === eventId)
  const course = event?.prerequisiteCourseId
    ? db.courses.find((c) => c.id === event.prerequisiteCourseId)
    : undefined
  const progress = course
    ? db.progress.find((p) => p.userId === userId && p.courseId === course.id)
    : undefined
  const qualifying = pointsBalance(userId).qualifying
  const required = event?.minQualifyingPoints ?? 0
  const lessonsTotal = course?.lessons.length ?? 0
  const lessonsDone = progress?.completedLessonIds.length ?? 0
  const courseComplete = !course || Boolean(progress?.completedAt)
  const remaining: string[] = []
  if (course && !courseComplete) {
    const missing = course.lessons.filter((l) => !progress?.completedLessonIds.includes(l.id))
    for (const l of missing)
      remaining.push(
        l.type === 'quiz' ? `Pass the ${course.title} path quiz` : `Complete “${l.title}”`,
      )
  }
  if (qualifying < required)
    remaining.push(`Earn ${required - qualifying} more qualifying learning points`)
  return {
    eventId,
    eligible: courseComplete && qualifying >= required,
    courseComplete,
    courseId: course?.id,
    courseTitle: course?.title,
    lessonsDone,
    lessonsTotal,
    qualifying,
    required,
    remaining,
  }
}

const activeRegs = (eventId: string) =>
  db.registrations.filter(
    (r) => r.eventId === eventId && (r.status === 'registered' || r.status === 'attended'),
  )

function statusFor(userId: string, event: ClinicEvent): ClinicStatus {
  const reg = db.registrations.find(
    (r) => r.eventId === event.id && r.userId === userId && r.status !== 'cancelled',
  )
  if (event.status === 'completed')
    return reg?.status === 'attended' && event.recordingAvailable ? 'recording' : 'completed'
  if (reg?.status === 'registered') return 'registered'
  if (reg?.status === 'waitlisted') return 'waitlisted'
  if (!evaluateClinicEligibility(userId, event.id).eligible) return 'locked'
  if (activeRegs(event.id).length >= event.capacity) return 'full'
  return 'eligible'
}

const decorate = (userId: string, e: ClinicEvent) => {
  const facilitator = db.users.find((u) => u.id === e.facilitatorId)
  return {
    event: e,
    facilitatorName: facilitator ? fullName(facilitator) : 'UN Women',
    facilitatorAvatar: facilitator?.avatar,
    status: statusFor(userId, e),
    placesLeft: Math.max(0, e.capacity - activeRegs(e.id).length),
    registered: activeRegs(e.id).length,
  }
}

/** Public preview: upcoming events without personal state. */
export async function listPublicEvents() {
  await delay()
  return out(
    db.events
      .filter((e) => e.status === 'scheduled')
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map((e) => ({ ...decorate('', e), status: 'locked' as ClinicStatus })),
  )
}

export async function listEvents() {
  await delay()
  const user = requireUser()
  return out(
    db.events
      .slice()
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map((e) => decorate(user.id, e)),
  )
}

export async function getEvent(eventId: string) {
  await delay()
  const user = requireUser()
  const event = findOr404(db.events, (e) => e.id === eventId, 'Event')
  const reg = db.registrations.find(
    (r) => r.eventId === eventId && r.userId === user.id && r.status !== 'cancelled',
  )
  const fac = db.users.find((u) => u.id === event.facilitatorId)
  const prof = db.mentorProfiles.find((m) => m.userId === event.facilitatorId)
  return out({
    ...decorate(user.id, event),
    facilitator: {
      name: fac ? fullName(fac) : 'UN Women',
      title: fac?.title ?? 'UN Women',
      headline: prof?.headline,
      bio: prof?.bio,
      expertise: prof?.expertise ?? [],
      avatar: fac?.avatar,
    },
    eligibility: evaluateClinicEligibility(user.id, eventId),
    registration: reg ?? null,
    materials: event.materials.map((m) => ({
      ...m,
      resource: m.resourceId ? db.resources.find((r) => r.id === m.resourceId) : undefined,
    })),
  })
}

export async function register(eventId: string) {
  await delay(350)
  const user = requireCapability('clinics.use')
  const event = findOr404(db.events, (e) => e.id === eventId, 'Event')
  const existing = db.registrations.find(
    (r) => r.eventId === eventId && r.userId === user.id && r.status !== 'cancelled',
  )
  if (existing) return out(existing) // idempotent
  const elig = evaluateClinicEligibility(user.id, eventId)
  if (!elig.eligible)
    throw new ApiError(`Not yet eligible: ${elig.remaining.join('; ')}.`, 'forbidden')
  const full = activeRegs(eventId).length >= event.capacity
  const reg: Registration = {
    id: newId('reg'),
    eventId,
    userId: user.id,
    status: full ? 'waitlisted' : 'registered',
    createdAt: now(),
  }
  db.registrations.push(reg)
  notify({
    userId: user.id,
    category: 'clinic',
    title: full ? 'You joined the waitlist' : 'Registration confirmed',
    body: full
      ? `We’ll let you know if a place opens for ${event.title}.`
      : `${event.title} has been added to your dashboard and calendar.`,
    link: `/portal/clinics/${eventId}`,
    critical: false,
    emailPreview: full
      ? undefined
      : {
          subject: `You’re registered: ${event.title}`,
          to: user.email,
          body: [
            `Hi ${user.firstName},`,
            `Your place is confirmed for ${event.title}.`,
            'Joining details will be shared 24 hours before the session.',
          ],
        },
  })
  notify({
    userId: event.facilitatorId,
    category: 'clinic',
    title: 'New participant registered',
    body: `${fullName(user)} registered for ${event.title}.`,
    link: `/expert/sessions/${eventId}`,
    critical: false,
  })
  commit()
  return out(reg)
}

/** Cancelling releases the place; the first waitlisted person is promoted. */
export async function cancelRegistration(eventId: string) {
  await delay(300)
  const user = requireUser()
  const reg = findOr404(
    db.registrations,
    (r) => r.eventId === eventId && r.userId === user.id && r.status !== 'cancelled',
    'Registration',
  )
  const wasRegistered = reg.status === 'registered'
  reg.status = 'cancelled'
  if (wasRegistered) {
    const next = db.registrations.find((r) => r.eventId === eventId && r.status === 'waitlisted')
    if (next) {
      next.status = 'registered'
      notify({
        userId: next.userId,
        category: 'clinic',
        title: 'A place opened up',
        body: 'You moved from the waitlist to registered.',
        link: `/portal/clinics/${eventId}`,
        critical: false,
      })
    }
  }
  commit()
}

/** Trainer/admin confirms attendance; points are awarded once per attended event. */
export async function markAttendance(eventId: string, userId: string, attended: boolean) {
  await delay(200)
  const actor = requireUser()
  const event = findOr404(db.events, (e) => e.id === eventId, 'Event')
  if (actor.role !== 'global_admin' && actor.id !== event.facilitatorId)
    throw new ApiError('Only the facilitator can confirm attendance.', 'forbidden')
  const reg = findOr404(
    db.registrations,
    (r) => r.eventId === eventId && r.userId === userId && r.status !== 'cancelled',
    'Registration',
  )
  reg.status = attended ? 'attended' : 'no_show'
  if (attended)
    award(userId, 'clinic_attend', `attend:${eventId}`, `Attended ${event.title}`, {
      sourceLink: `/portal/clinics/${eventId}`,
    })
  commit()
}

export async function submitFeedback(eventId: string, rating: number, comment: string) {
  await delay(250)
  const user = requireUser()
  const reg = findOr404(
    db.registrations,
    (r) => r.eventId === eventId && r.userId === user.id && r.status === 'attended',
    'Attendance',
  )
  reg.feedback = { rating, comment }
  const ev = award(user.id, 'feedback', `feedback:${eventId}`, 'Clinic feedback submitted')
  commit()
  return { pointsAwarded: ev?.amount ?? 0 }
}

/** Roster for a trainer's session, with each participant's preparation state. */
export async function getRoster(eventId: string) {
  await delay()
  const actor = requireUser()
  const event = findOr404(db.events, (e) => e.id === eventId, 'Event')
  if (actor.role !== 'global_admin' && actor.id !== event.facilitatorId)
    throw new ApiError('Roster is only visible to the facilitator.', 'forbidden')
  return out({
    event,
    participants: db.registrations
      .filter((r) => r.eventId === eventId && r.status !== 'cancelled')
      .map((r) => {
        const u = db.users.find((x) => x.id === r.userId)
        const company = db.companies.find((c) => c.id === u?.companyId)
        return {
          registration: r,
          name: u ? fullName(u) : r.userId,
          avatar: u?.avatar,
          company: company?.name,
          department: u?.department,
          prepared: evaluateClinicEligibility(r.userId, eventId).courseComplete,
        }
      }),
  })
}

export async function upsertEvent(input: ClinicEvent) {
  await delay(300)
  requireCapability('admin.manage')
  const idx = db.events.findIndex((e) => e.id === input.id)
  if (idx >= 0) db.events[idx] = input
  else db.events.push({ ...input, id: input.id || newId('evt') })
  commit()
  return out(input)
}
