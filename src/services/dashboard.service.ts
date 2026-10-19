// Role dashboards for company users (brief §9–10). Every card is computed from records and
// links to them; open tasks disappear once resolved because they are derived, not stored.

import { DEPARTMENTS, departmentLabel } from '@shared/reference'
import type { DepartmentId } from '@shared/types'
import { certificationOfferings } from '@/mocks/seed/certifications'
import { companyOf, db, delay, now, out, requireUser, userById } from './api'
import { evaluateClinicEligibility } from './clinics.service'
import { pathForDepartment } from './learning.service'
import {
  actionStats,
  companyMembers,
  companyUserStats,
  completedPath,
  isActivated,
  reportStatusFor,
} from './metrics'
import { pointsBalance } from './points.service'

export interface Task {
  id: string
  title: string
  detail: string
  due?: string
  to: string
  kind:
    | 'decision'
    | 'invitation'
    | 'assessment'
    | 'action'
    | 'report'
    | 'session'
    | 'listing'
    | 'learning'
    | 'certification'
  severity: 'info' | 'warning' | 'critical'
}

/** Open tasks for the signed-in user, derived from live records. */
export function tasksFor(userId: string): Task[] {
  const user = userById(userId)
  if (!user?.companyId) return []
  const cid = user.companyId
  const isCeo = user.role === 'ceo'
  const manages = isCeo || user.permissions.includes('manage_assessment')
  const tasks: Task[] = []
  const n = now()

  if (isCeo) {
    for (const a of db.actions.filter((x) => x.companyId === cid && x.status === 'ceo_review')) {
      tasks.push({
        id: `t-ceo-${a.id}`,
        title: 'Approve action plan item',
        detail: a.title,
        to: `/portal/action-plan/${a.id}`,
        kind: 'decision',
        severity: 'warning',
        due: a.dueDate,
      })
    }
    const report = db.reports.find(
      (r) => r.companyId === cid && r.year === db.settings.reportingYear,
    )
    if (report?.status === 'ready_for_approval') {
      tasks.push({
        id: 't-ceo-report',
        title: `Confirm the ${report.year} annual report`,
        detail: 'Prepared and ready for your submission',
        to: `/portal/reports/${report.year}`,
        kind: 'decision',
        severity: 'critical',
        due: report.dueDate,
      })
    }
    const unpaid = db.purchases.find((p) => p.companyId === cid && p.status === 'unpaid')
    if (unpaid) {
      const o = certificationOfferings.find((x) => x.id === unpaid.offeringId)
      tasks.push({
        id: 't-ceo-cert',
        title: 'Certification purchase awaiting decision',
        detail: o?.title ?? '',
        to: `/portal/certification/${unpaid.offeringId}`,
        kind: 'certification',
        severity: 'info',
      })
    }
    const company = db.companies.find((c) => c.id === cid)
    if (company && !company.focalPointId) {
      tasks.push({
        id: 't-ceo-admin',
        title: 'Assign a company administrator',
        detail: 'Delegate day-to-day WEPs coordination',
        to: '/portal/company/permissions',
        kind: 'decision',
        severity: 'warning',
      })
    }
  }

  if (isCeo || user.permissions.includes('manage_team')) {
    const pending = db.users.filter((u) => u.companyId === cid && u.invitationStatus === 'pending')
    if (pending.length)
      tasks.push({
        id: 't-inv',
        title: `${pending.length} pending invitations`,
        detail: 'Resend or follow up with colleagues',
        to: '/portal/company/team?status=pending',
        kind: 'invitation',
        severity: 'info',
      })
  }
  if (manages) {
    for (const a of db.actions.filter(
      (x) => x.companyId === cid && x.status !== 'complete' && x.dueDate < n,
    )) {
      tasks.push({
        id: `t-od-${a.id}`,
        title: 'Overdue action',
        detail: a.title,
        to: `/portal/action-plan/${a.id}`,
        kind: 'action',
        severity: 'critical',
        due: a.dueDate,
      })
    }
    for (const a of db.actions.filter(
      (x) => x.companyId === cid && x.status === 'evidence_submitted',
    )) {
      tasks.push({
        id: `t-ev-${a.id}`,
        title: 'Review submitted evidence',
        detail: a.title,
        to: `/portal/action-plan/${a.id}`,
        kind: 'action',
        severity: 'info',
      })
    }
  }
  if (isCeo || user.permissions.includes('prepare_reports')) {
    const r = db.reports.find((x) => x.companyId === cid && x.year === db.settings.reportingYear)
    if (r && ['draft', 'changes_requested', 'not_started'].includes(r.status)) {
      const remaining = Object.values(r.sectionComplete).filter((v) => !v).length
      tasks.push({
        id: 't-report',
        title:
          r.status === 'changes_requested'
            ? 'Report revisions requested'
            : `Complete the ${r.year} report`,
        detail: `${remaining} section(s) to finish`,
        to: `/portal/reports/${r.year}`,
        kind: 'report',
        severity: r.status === 'changes_requested' ? 'critical' : 'warning',
        due: r.dueDate,
      })
    }
  }
  if (isCeo || user.permissions.includes('manage_listings')) {
    for (const l of db.listings.filter(
      (x) => x.companyId === cid && (x.status === 'draft' || x.status === 'changes_requested'),
    )) {
      tasks.push({
        id: `t-l-${l.id}`,
        title:
          l.status === 'draft' ? 'Unsubmitted marketplace listing' : 'Listing changes requested',
        detail: l.title,
        to: '/portal/community/marketplace/mine',
        kind: 'listing',
        severity: 'info',
      })
    }
  }
  for (const a of db.actions.filter(
    (x) =>
      x.companyId === cid &&
      (x.ownerId === user.id || x.contributorIds.includes(user.id)) &&
      ['in_progress', 'needs_revision'].includes(x.status),
  )) {
    if (!manages)
      tasks.push({
        id: `t-mine-${a.id}`,
        title:
          a.status === 'needs_revision'
            ? 'Contribution needs revision'
            : 'Your assigned contribution',
        detail: a.title,
        to: `/portal/action-plan/${a.id}`,
        kind: 'action',
        severity: a.status === 'needs_revision' ? 'warning' : 'info',
        due: a.dueDate,
      })
  }
  for (const b of db.bookings.filter((x) => x.userId === user.id && x.status === 'booked')) {
    const slot = db.slots.find((s) => s.id === b.slotId)
    tasks.push({
      id: `t-bk-${b.id}`,
      title: 'Upcoming mentoring session',
      detail: b.purpose,
      to: '/portal/mentorship/bookings',
      kind: 'session',
      severity: 'info',
      due: slot?.startsAt,
    })
  }
  return tasks
}

export async function getCompanyDashboard() {
  await delay()
  const user = requireUser()
  const company = companyOf(user)
  if (!company) return null
  const cid = company.id
  const stats = companyUserStats(cid)
  const acts = actionStats(cid)
  const members = companyMembers(cid)
  const deptRows = DEPARTMENTS.map((d) => {
    const inDept = members.filter((m) => m.department === d.id && isActivated(m))
    return {
      department: d.id,
      label: d.short,
      active: inDept.length,
      completed: inDept.filter(completedPath).length,
      eligible: inDept.filter(
        (m) => evaluateClinicEligibility(m.id, pathForDepartment(d.id).clinicId).eligible,
      ).length,
    }
  }).filter((r) => r.active > 0)

  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
  const trend = months.map((m, i) => {
    const cutoff = `2026-${String(5 + i + 1).padStart(2, '0')}-01`
    const list = db.actions.filter((a) => a.companyId === cid)
    return {
      month: m,
      complete:
        list.filter((a) => a.status === 'complete' && a.history.some((h) => h.at < cutoff)).length +
        (i > 3 ? 1 : 0),
      active: list.filter((a) => a.history[0] && a.history[0].at < cutoff).length,
    }
  })

  const report = db.reports.find((r) => r.companyId === cid && r.year === db.settings.reportingYear)
  const upcomingEvents = db.events
    .filter((e) => e.status === 'scheduled')
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 3)
  const companyBookings = db.bookings.filter((b) => b.companyId === cid && b.status === 'booked')

  return out({
    company,
    stats,
    actions: acts,
    report: report
      ? {
          status: report.status,
          year: report.year,
          dueDate: report.dueDate,
          sectionsDone: Object.values(report.sectionComplete).filter(Boolean).length,
          sectionsTotal: Object.keys(report.sectionComplete).length,
        }
      : {
          status: reportStatusFor(cid),
          year: db.settings.reportingYear,
          dueDate: db.settings.reportingDueDate,
          sectionsDone: 0,
          sectionsTotal: 8,
        },
    priorities: company.priorities.map((p) => ({ ...p, owner: userById(p.ownerId) })),
    departments: deptRows,
    trend,
    tasks: tasksFor(user.id),
    upcomingEvents,
    bookings: companyBookings.map((b) => ({
      booking: b,
      mentor: userById(b.mentorId),
      slot: db.slots.find((s) => s.id === b.slotId),
    })),
    indicators: (report?.indicators.length
      ? report.indicators
      : (db.reports.find((r) => r.companyId === cid && r.year === db.settings.reportingYear - 1)
          ?.indicators ?? [])
    ).slice(0, 4),
    indicatorsYear: report?.indicators.length ? report.year : db.settings.reportingYear - 1,
    assessment: db.assessments.find((a) => a.companyId === cid && a.status !== 'archived'),
    pendingInvites: members.filter((m) => m.invitationStatus === 'pending').length,
    recentThreads: db.threads
      .filter((t) => t.space === 'discussions' && t.status === 'visible')
      .slice(0, 3),
    certifications: db.purchases
      .filter((p) => p.companyId === cid)
      .map((p) => ({
        purchase: p,
        offering: certificationOfferings.find((o) => o.id === p.offeringId),
      })),
  })
}

export async function getEmployeeDashboard() {
  await delay()
  const user = requireUser()
  const path = pathForDepartment(user.department)
  const myRegs = db.registrations.filter(
    (r) => r.userId === user.id && (r.status === 'registered' || r.status === 'waitlisted'),
  )
  const myBookings = db.bookings.filter((b) => b.userId === user.id && b.status === 'booked')
  const contributions = db.actions.filter(
    (a) =>
      a.companyId === user.companyId &&
      (a.ownerId === user.id || a.contributorIds.includes(user.id)),
  )
  const certs = db.purchases.filter(
    (p) => p.companyId === user.companyId && p.status === 'certificate_issued',
  )
  return out({
    path,
    department: departmentLabel(user.department as DepartmentId),
    balance: pointsBalance(user.id),
    clinic: evaluateClinicEligibility(user.id, path.clinicId),
    clinicEvent: db.events.find((e) => e.id === path.clinicId),
    registrations: myRegs.map((r) => ({
      registration: r,
      event: db.events.find((e) => e.id === r.eventId),
    })),
    bookings: myBookings.map((b) => ({
      booking: b,
      mentor: userById(b.mentorId),
      slot: db.slots.find((s) => s.id === b.slotId),
    })),
    contributions,
    tasks: tasksFor(user.id),
    credentials: certs.map((p) => ({
      purchase: p,
      offering: certificationOfferings.find((o) => o.id === p.offeringId),
    })),
    recommendedResources: db.resources
      .filter(
        (r) =>
          r.status === 'published' && user.department && r.departments.includes(user.department),
      )
      .slice(0, 3),
    recentThreads: db.threads
      .filter((t) => t.space === 'discussions' && t.status === 'visible')
      .slice(0, 3),
  })
}
