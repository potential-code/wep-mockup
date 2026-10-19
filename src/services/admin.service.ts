// Platform Management operations not owned by a domain service (brief §24): users and
// invitations, companies and access, gamification, communications, AI and general settings,
// audit log, annual reporting cycle.

import { fullName } from '@shared/permissions'
import type {
  AnnualReport,
  ClinicEvent,
  CommsTemplate,
  Course,
  Invitation,
  PlatformSettings,
} from '@shared/types'
import { aiScripts } from '@/mocks/seed/ai-scripts'
import { assessmentSections } from '@/mocks/seed/assessment'
import { learningPaths } from '@/mocks/seed/courses'
import {
  ApiError,
  audit,
  commit,
  db,
  delay,
  findOr404,
  newId,
  notify,
  now,
  out,
  requireCapability,
} from './api'
import { reportStatusFor } from './metrics'

export async function getSettings() {
  await delay()
  requireCapability('admin.manage')
  return out(db.settings)
}

export async function updateSettings(patch: Partial<PlatformSettings>) {
  await delay(300)
  requireCapability('admin.manage')
  Object.assign(db.settings, patch)
  audit('Settings updated', Object.keys(patch).join(', '))
  commit()
  return out(db.settings)
}

export async function listAudit() {
  await delay()
  requireCapability('admin.manage')
  return out(
    db.audit.map((a) => ({
      ...a,
      actorName: (() => {
        const u = db.users.find((x) => x.id === a.actorId)
        return u ? fullName(u) : a.actorId
      })(),
    })),
  )
}

export async function listComms() {
  await delay()
  requireCapability('admin.manage')
  return out(db.comms)
}

export async function upsertComms(t: CommsTemplate) {
  await delay(250)
  requireCapability('admin.manage')
  const i = db.comms.findIndex((x) => x.id === t.id)
  if (i >= 0) db.comms[i] = t
  else db.comms.push({ ...t, id: newId('tpl') })
  commit()
  return out(t)
}

export async function listInvitations() {
  await delay()
  requireCapability('admin.manage')
  return out(
    db.invitations.map((i) => ({
      invitation: i,
      companyName:
        db.companies.find((c) => c.id === i.companyId)?.name ?? 'UN Women expert network',
    })),
  )
}

export async function inviteMentor(input: { firstName: string; lastName: string; email: string }) {
  await delay(400)
  const admin = requireCapability('admin.manage')
  const inv: Invitation = {
    id: newId('inv'),
    token: `expert-${input.firstName.toLowerCase()}-${Math.random().toString(36).slice(2, 6)}`,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    role: 'mentor',
    permissions: [],
    invitedById: admin.id,
    createdAt: now(),
    expiresAt: new Date(new Date(now()).getTime() + 30 * 864e5).toISOString(),
    status: 'pending',
  }
  db.invitations.unshift(inv)
  audit('Mentor/trainer invited', `${input.firstName} ${input.lastName}`)
  commit()
  return out(inv)
}

export async function setInvitationStatus(
  invitationId: string,
  status: 'pending' | 'revoked',
  reason?: string,
) {
  await delay(250)
  requireCapability('admin.manage')
  const inv = findOr404(db.invitations, (i) => i.id === invitationId, 'Invitation')
  if (status === 'revoked' && !reason?.trim()) throw new ApiError('Give a reason for revoking.')
  inv.status = status
  if (status === 'pending')
    inv.expiresAt = new Date(new Date(now()).getTime() + 21 * 864e5).toISOString()
  audit(status === 'revoked' ? 'Invitation revoked' : 'Invitation resent', inv.email, reason)
  commit()
}

export async function setUserSuspended(userId: string, suspended: boolean, reason: string) {
  await delay(250)
  requireCapability('admin.manage')
  if (!reason.trim()) throw new ApiError('A reason is required.')
  const u = findOr404(db.users, (x) => x.id === userId, 'User')
  u.suspended = suspended
  audit(suspended ? 'User suspended' : 'User reinstated', fullName(u), reason)
  commit()
}

export async function setCompanyStatus(
  companyId: string,
  status: 'approved' | 'suspended',
  reason: string,
) {
  await delay(300)
  requireCapability('admin.manage')
  if (!reason.trim()) throw new ApiError('A reason is required.')
  const c = findOr404(db.companies, (x) => x.id === companyId, 'Company')
  c.signatoryStatus = status
  audit(
    status === 'suspended' ? 'Company access suspended' : 'Company access restored',
    c.name,
    reason,
  )
  commit()
}

export async function reviewProfileRevision(companyId: string, approve: boolean) {
  await delay(250)
  requireCapability('admin.manage')
  const c = findOr404(db.companies, (x) => x.id === companyId, 'Company')
  const rev = c.pendingProfileRevision
  if (rev && approve) Object.assign(c, { [rev.field]: rev.value })
  c.pendingProfileRevision = undefined
  audit(approve ? 'Profile revision approved' : 'Profile revision declined', c.name, rev?.field)
  commit()
}

export async function upsertCourse(course: Course) {
  await delay(300)
  requireCapability('admin.manage')
  const saved = { ...course, id: course.id || newId('crs'), updatedAt: new Date().toISOString() }
  const i = db.courses.findIndex((c) => c.id === saved.id)
  if (i >= 0) db.courses[i] = saved
  else db.courses.push(saved)
  audit(saved.published ? 'Course published' : 'Course saved as draft', saved.title)
  commit()
  return out(saved)
}

/** Removes a course nobody has started and no pathway uses; otherwise unpublish it. */
export async function deleteCourse(courseId: string) {
  await delay(300)
  requireCapability('admin.manage')
  const course = db.courses.find((c) => c.id === courseId)
  if (!course) throw new ApiError('Course not found.')
  if (learningPaths.some((p) => p.courseIds.includes(courseId)))
    throw new ApiError('This course is part of a department pathway. Unpublish it instead.')
  if (db.progress.some((p) => p.courseId === courseId))
    throw new ApiError('Learners have started this course. Unpublish it instead.')
  db.courses = db.courses.filter((c) => c.id !== courseId)
  audit('Course deleted', course.title)
  commit()
  return out({ id: courseId })
}

/** Every course, including drafts, with learner counts. */
export async function listAdminCourses() {
  await delay()
  requireCapability('admin.manage')
  return out(
    db.courses.map((course) => {
      const prog = db.progress.filter((p) => p.courseId === course.id)
      return {
        course,
        enrolled: prog.length,
        completed: prog.filter((p) => p.completedAt).length,
      }
    }),
  )
}

export async function getAdminCourse(courseId: string) {
  await delay(150)
  requireCapability('admin.manage')
  return out({
    course: db.courses.find((c) => c.id === courseId) ?? null,
    courses: db.courses.map((c) => ({ id: c.id, title: c.title })),
    events: db.events.map((e) => ({ id: e.id, title: e.title })),
  })
}

export async function getAssessmentConfig() {
  await delay()
  requireCapability('admin.manage')
  const submitted = db.assessments.filter((a) => a.status === 'submitted').length
  return out({
    sections: assessmentSections,
    assessments: db.assessments.length,
    submitted,
    inProgress: db.assessments.filter((a) => a.status === 'in_progress').length,
  })
}

export const REPORT_TEMPLATE_SECTIONS = [
  { key: 'snapshot', label: 'Company snapshot', carried: true },
  { key: 'narrative', label: 'CEO narrative', carried: false },
  { key: 'actions', label: 'Actions taken', carried: false },
  { key: 'support', label: 'Support received', carried: false },
  { key: 'principles', label: 'Progress by principle', carried: false },
  { key: 'indicators', label: 'Indicators', carried: false },
  { key: 'challenges', label: 'Challenges and next steps', carried: false },
  { key: 'declaration', label: 'Declaration', carried: false },
] as const

export async function getReportingConfig() {
  await delay()
  requireCapability('admin.manage')
  const year = db.settings.reportingYear
  return out({
    settings: db.settings,
    companies: db.companies
      .filter((c) => c.signatoryStatus === 'approved')
      .map((c) => ({
        company: c,
        status: reportStatusFor(c.id, year),
        priorities: c.priorities.length,
        hasNextYear: db.reports.some((r) => r.companyId === c.id && r.year === year + 1),
      })),
  })
}

/** Open a new reporting year: copy reusable profile information forward, never outcomes. */
export async function openReportingYear(year: number, companyIds: string[], dueDate: string) {
  await delay(500)
  requireCapability('admin.manage')
  if (companyIds.length === 0) throw new ApiError('Select at least one company.')
  const prevYear = db.settings.reportingYear
  for (const companyId of companyIds) {
    if (db.reports.some((r) => r.companyId === companyId && r.year === year)) continue
    const prev = db.reports.find((r) => r.companyId === companyId && r.year === prevYear)
    const emptySections = Object.fromEntries(
      (
        [
          'snapshot',
          'narrative',
          'actions',
          'support',
          'principles',
          'indicators',
          'challenges',
          'declaration',
        ] as const
      ).map((k) => [k, '']),
    ) as AnnualReport['sections']
    const falseFlags = Object.fromEntries(
      Object.keys(emptySections).map((k) => [k, false]),
    ) as AnnualReport['sectionComplete']
    db.reports.push({
      id: newId('rep'),
      companyId,
      year,
      status: 'not_started',
      dueDate,
      sections: { ...emptySections, snapshot: prev?.sections.snapshot ?? '' },
      sectionComplete: falseFlags,
      indicators: (prev?.indicators ?? []).map((i) => ({
        ...i,
        id: `${i.id}-${year}`,
        value: null,
        previousValue: i.value,
        evidence: undefined,
        period: `FY${year - 1}`,
      })),
      evidence: [],
      versions: [],
      changeRequests: [],
      publicSummaryApproved: false,
      updatedAt: now(),
    })
  }
  db.settings.reportingYear = year
  db.settings.reportingDueDate = dueDate
  audit('Reporting year opened', String(year), `${companyIds.length} companies in scope`)
  commit()
  return out(db.settings)
}

/** Notification history across the platform, newest first, with recipient names. */
export async function listNotificationHistory() {
  await delay()
  requireCapability('admin.manage')
  return out(
    db.notifications
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 200)
      .map((n) => {
        const u = db.users.find((x) => x.id === n.userId)
        return { notification: n, recipient: u ? fullName(u) : n.userId }
      }),
  )
}

/** Reschedule or cancel an event and notify everyone registered. */
export async function changeEvent(
  eventId: string,
  change: { startsAt?: string; cancel?: boolean; message: string },
) {
  await delay(400)
  requireCapability('admin.manage')
  const e = findOr404(db.events, (x) => x.id === eventId, 'Event')
  if (!change.message.trim()) throw new ApiError('Add a short message for registered participants.')
  const before = e.startsAt
  if (change.cancel) e.status = 'cancelled'
  else if (change.startsAt) e.startsAt = change.startsAt
  const regs = db.registrations.filter(
    (r) => r.eventId === eventId && ['registered', 'waitlisted'].includes(r.status),
  )
  for (const r of regs) {
    const u = db.users.find((x) => x.id === r.userId)
    notify({
      userId: r.userId,
      category: 'clinic',
      title: change.cancel ? `${e.title} is cancelled` : `${e.title} has a new time`,
      body: change.message,
      link: `/portal/clinics/${e.id}`,
      critical: true,
      emailPreview: {
        to: u?.email ?? '',
        subject: change.cancel ? `Cancelled: ${e.title}` : `New time: ${e.title}`,
        body: [`Dear ${u?.firstName ?? 'participant'},`, change.message],
      },
    })
  }
  audit(
    change.cancel ? 'Event cancelled' : 'Event rescheduled',
    e.title,
    `${regs.length} participants notified${change.cancel ? '' : ` · was ${before}`}`,
  )
  commit()
  return out({ event: e as ClinicEvent, notified: regs.length })
}

/** Scripted concierge prompts, grouped by role, for the AI settings screen. */
export async function listAiScripts() {
  await delay(150)
  requireCapability('admin.manage')
  return out(
    aiScripts.map((s) => ({
      id: s.id,
      roles: s.roles,
      prompt: s.prompt,
      sources: s.sources.length,
      unavailable: Boolean(s.unavailable),
      isDraft: Boolean(s.isDraft),
    })),
  )
}
