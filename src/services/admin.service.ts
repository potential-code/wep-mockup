// Platform Management operations not owned by a domain service (brief §24): users and
// invitations, companies and access, gamification, communications, AI and general settings,
// audit log, annual reporting cycle.

import { fullName } from '@shared/permissions'
import type { CommsTemplate, Course, Invitation, PlatformSettings } from '@shared/types'
import {
  ApiError,
  audit,
  commit,
  db,
  delay,
  findOr404,
  newId,
  now,
  out,
  requireCapability,
} from './api'

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
  const i = db.courses.findIndex((c) => c.id === course.id)
  if (i >= 0) db.courses[i] = course
  else db.courses.push({ ...course, id: course.id || newId('crs') })
  audit(course.published ? 'Course published' : 'Course saved as draft', course.title)
  commit()
  return out(course)
}

/** Open a new reporting year: copy reusable profile information forward, never outcomes. */
export async function openReportingYear(year: number, companyIds: string[], dueDate: string) {
  await delay(500)
  requireCapability('admin.manage')
  db.settings.reportingYear = year
  db.settings.reportingDueDate = dueDate
  audit('Reporting year opened', String(year), `${companyIds.length} companies in scope`)
  commit()
  return out(db.settings)
}
