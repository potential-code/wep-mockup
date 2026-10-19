// Shared metric definitions (brief §23). Every KPI is computed from records so drill-downs
// reconcile with totals. Used by company dashboards and UN Women reporting.

import type { Company, User } from '@shared/types'
import { DESIGNATED_COURSE_BY_DEPT } from '@/mocks/seed/progress'
import { db, now } from './api'

export const companyMembers = (companyId: string) =>
  db.users.filter(
    (u) => u.companyId === companyId && u.role !== 'global_admin' && u.role !== 'mentor',
  )

export const isInvited = (u: User) => u.invitationStatus !== 'revoked'
export const isActivated = (u: User) => u.invitationStatus === 'accepted' && !u.suspended

/** Completed the designated course of their department path. */
export function completedPath(u: User) {
  const courseId = DESIGNATED_COURSE_BY_DEPT[u.department ?? 'hr']
  return Boolean(db.progress.find((p) => p.userId === u.id && p.courseId === courseId)?.completedAt)
}

export function companyUserStats(companyId: string) {
  const members = companyMembers(companyId).filter(isInvited)
  const activated = members.filter(isActivated)
  const completed = activated.filter(completedPath)
  return {
    invited: members.length,
    activated: activated.length,
    completed: completed.length,
    activationRate: pct(activated.length, members.length),
    completionRate: pct(completed.length, activated.length),
  }
}

export const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 1000) / 10)

export const approvedCompanies = () => db.companies.filter((c) => c.signatoryStatus === 'approved')

export const isActiveThisMonth = (c: Company) =>
  Boolean(c.lastActivityAt && c.lastActivityAt.slice(0, 7) === now().slice(0, 7))

export function actionStats(companyId?: string) {
  const list = db.actions.filter((a) => !companyId || a.companyId === companyId)
  const n = now()
  const overdue = list.filter((a) => a.status !== 'complete' && a.dueDate < n)
  const complete = list.filter((a) => a.status === 'complete')
  const missingEvidence = list.filter(
    (a) => a.status !== 'draft' && a.status !== 'complete' && a.evidence.length === 0,
  )
  const dueInPeriod = list.filter((a) => a.dueDate <= n)
  const onTrack = list.filter(
    (a) =>
      a.status !== 'needs_revision' &&
      !(a.status !== 'complete' && a.dueDate < n) &&
      a.status !== 'draft',
  )
  return {
    total: list.length,
    overdue: overdue.length,
    complete: complete.length,
    missingEvidence: missingEvidence.length,
    onTrack: onTrack.length,
    active: list.filter((a) => a.status !== 'draft').length,
    dueInPeriod: dueInPeriod.length,
    completionRate: pct(
      dueInPeriod.filter((a) => a.status === 'complete').length,
      dueInPeriod.length,
    ),
  }
}

export function reportStatusFor(companyId: string, year = db.settings.reportingYear) {
  return (
    db.reports.find((r) => r.companyId === companyId && r.year === year)?.status ?? 'not_started'
  )
}

export function clinicAttendance(companyId?: string) {
  const members = companyId ? new Set(companyMembers(companyId).map((u) => u.id)) : undefined
  const done = new Set(db.events.filter((e) => e.status === 'completed').map((e) => e.id))
  const regs = db.registrations.filter(
    (r) => done.has(r.eventId) && r.status !== 'cancelled' && (!members || members.has(r.userId)),
  )
  const attended = regs.filter((r) => r.status === 'attended').length
  return { registered: regs.length, attended, rate: pct(attended, regs.length) }
}
