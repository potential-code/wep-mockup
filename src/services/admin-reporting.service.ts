// UN Women Reporting workspace (brief §22–23). Platform activity, implementation evidence and
// company-reported outcomes are kept as distinct layers. Filters apply to every view.

import { fullName } from '@shared/permissions'
import { DEPARTMENTS } from '@shared/reference'
import type { DepartmentId, ReportStatus } from '@shared/types'
import { certificationOfferings } from '@/mocks/seed/certifications'
import { db, delay, findOr404, now, out, requireCapability } from './api'
import { evaluateClinicEligibility } from './clinics.service'
import { pathForDepartment } from './learning.service'
import {
  actionStats,
  approvedCompanies,
  clinicAttendance,
  companyMembers,
  companyUserStats,
  completedPath,
  isActivated,
  isActiveThisMonth,
  pct,
  reportStatusFor,
} from './metrics'
import { pointsBalance } from './points.service'

export interface ReportingFilters {
  year?: number
  country?: string
  sector?: string
  companyId?: string
  department?: DepartmentId
}

const scopedCompanies = (f: ReportingFilters) =>
  db.companies.filter(
    (c) =>
      (!f.country || c.country === f.country) &&
      (!f.sector || c.sector === f.sector) &&
      (!f.companyId || c.id === f.companyId),
  )

export async function getExecutiveDashboard(f: ReportingFilters = {}) {
  await delay(350)
  requireCapability('admin.reporting')
  const year = f.year ?? db.settings.reportingYear
  const all = scopedCompanies(f)
  const approved = all.filter((c) => c.signatoryStatus === 'approved')
  const users = approved.flatMap((c) => companyMembers(c.id))
  const activated = users.filter(isActivated)
  const completed = activated.filter(completedPath)
  const attendance = clinicAttendance()
  const accepted = approved.filter((c) => reportStatusFor(c.id, year) === 'accepted')

  const rejectedApps = db.applications.filter(
    (a) => a.status === 'not_approved' && !a.companyId,
  ).length
  const assessed = approved.filter((c) =>
    db.assessments.some((a) => a.companyId === c.id && a.status === 'submitted'),
  )
  const withPlans = approved.filter((c) =>
    db.actions.some((a) => a.companyId === c.id && a.status !== 'draft'),
  )
  const funnel = [
    {
      stage: 'Applications submitted',
      value: all.length + (f.companyId ? 0 : rejectedApps),
      to: '/admin/manage/applications',
    },
    { stage: 'Approved companies', value: approved.length, to: '/admin/reporting/signatories' },
    {
      stage: 'Activated companies',
      value: approved.filter((c) => companyMembers(c.id).filter(isActivated).length > 1).length,
      to: '/admin/reporting/companies',
    },
    { stage: 'Assessed companies', value: assessed.length, to: '/admin/reporting/assessments' },
    { stage: 'With action plans', value: withPlans.length, to: '/admin/reporting/assessments' },
    {
      stage: 'Reporting (accepted)',
      value: accepted.length,
      to: '/admin/reporting/annual-reports',
    },
  ]

  const statusDist = (
    [
      'accepted',
      'under_review',
      'changes_requested',
      'submitted',
      'resubmitted',
      'draft',
      'not_started',
    ] as ReportStatus[]
  )
    .map((s) => ({
      status: s,
      count: approved.filter((c) => reportStatusFor(c.id, year) === s).length,
    }))
    .filter((r) => r.count > 0)

  const attention = [
    ...db.applications
      .filter((a) => a.status === 'information_requested')
      .map((a) => ({
        id: `att-${a.id}`,
        label: 'Information request awaiting response',
        target: a.data.company.name,
        to: `/admin/manage/applications/${a.id}`,
        severity: 'warning' as const,
      })),
    ...db.applications
      .filter((a) => ['submitted', 'under_review', 'resubmitted'].includes(a.status))
      .map((a) => ({
        id: `att-r-${a.id}`,
        label: 'Application to review',
        target: a.data.company.name,
        to: `/admin/manage/applications/${a.id}`,
        severity: 'info' as const,
      })),
    ...approved
      .filter((c) => !isActiveThisMonth(c))
      .map((c) => ({
        id: `att-in-${c.id}`,
        label: 'Inactive this month',
        target: c.name,
        to: `/admin/reporting/companies/${c.id}`,
        severity: 'info' as const,
      })),
    ...approved
      .filter((c) => actionStats(c.id).overdue > 0)
      .map((c) => ({
        id: `att-od-${c.id}`,
        label: `${actionStats(c.id).overdue} overdue action(s)`,
        target: c.name,
        to: `/admin/reporting/companies/${c.id}`,
        severity: 'critical' as const,
      })),
    ...approved
      .filter((c) => reportStatusFor(c.id, year) === 'changes_requested')
      .map((c) => ({
        id: `att-rv-${c.id}`,
        label: 'Report revision outstanding',
        target: c.name,
        to: `/admin/reporting/companies/${c.id}`,
        severity: 'critical' as const,
      })),
    ...db.listings
      .filter((l) => ['submitted', 'under_review', 'resubmitted'].includes(l.status))
      .map((l) => ({
        id: `att-l-${l.id}`,
        label: 'Marketplace listing to review',
        target: db.companies.find((c) => c.id === l.companyId)?.name ?? '',
        to: '/admin/manage/community',
        severity: 'info' as const,
      })),
  ]

  const byRegion = new Map<string, number>()
  for (const c of approved) byRegion.set(c.region, (byRegion.get(c.region) ?? 0) + 1)

  const demand = DEPARTMENTS.map((d) => ({
    department: d.short,
    clinic: db.registrations.filter(
      (r) =>
        r.status !== 'cancelled' && db.users.find((u) => u.id === r.userId)?.department === d.id,
    ).length,
    mentoring: db.bookings.filter(
      (b) => db.users.find((u) => u.id === b.userId)?.department === d.id,
    ).length,
  }))

  return out({
    period: `Reporting year ${year} · data as of ${new Date(now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    cards: {
      approvedSignatories: approved.length,
      activeCompanies: approved.filter(isActiveThisMonth).length,
      activatedUsers: activated.length,
      invitedUsers: users.filter((u) => u.invitationStatus !== 'revoked').length,
      completedPaths: completed.length,
      learningCompletion: pct(completed.length, activated.length),
      clinicAttendance: attendance.rate,
      clinicAttended: attendance.attended,
      clinicRegistered: attendance.registered,
      reportingCompletion: pct(accepted.length, approved.length),
      reportsAccepted: accepted.length,
      reportsRequired: approved.length,
    },
    funnel,
    statusDist,
    attention,
    regions: [...byRegion.entries()].map(([region, count]) => ({ region, count })),
    demand,
    insights: [
      {
        text: `${actionStats().overdue} company actions are overdue across ${approved.filter((c) => actionStats(c.id).overdue > 0).length} companies; most relate to people practices.`,
        to: '/admin/reporting/assessments',
      },
      {
        text: `Procurement learners convert to clinic attendance at the highest rate; Marketing pathways have the most drop-off after lesson 2.`,
        to: '/admin/reporting/learning',
      },
      {
        text: `Harbour Services has an outstanding report revision and overdue evidence. Consider a reporting clinic invitation.`,
        to: '/admin/reporting/companies/c-harbour',
      },
    ],
  })
}

export async function getCompaniesTable(f: ReportingFilters = {}) {
  await delay()
  requireCapability('admin.reporting')
  const year = f.year ?? db.settings.reportingYear
  return out(
    scopedCompanies(f).map((c) => {
      const s = companyUserStats(c.id)
      const ceo = db.users.find((u) => u.id === c.ceoId)
      const fp = db.users.find((u) => u.id === c.focalPointId)
      return {
        company: c,
        ...s,
        reportStatus: reportStatusFor(c.id, year),
        actions: actionStats(c.id),
        active: isActiveThisMonth(c),
        contacts: [ceo, fp]
          .filter(Boolean)
          .map((u) => fullName(u as NonNullable<typeof u>))
          .join(', '),
        application: db.applications.find((a) => a.companyId === c.id),
      }
    }),
  )
}

export async function getCompanyDetail(companyId: string) {
  await delay()
  requireCapability('admin.reporting')
  const c = findOr404(db.companies, (x) => x.id === companyId, 'Company')
  const members = companyMembers(c.id)
  return out({
    company: c,
    stats: companyUserStats(c.id),
    actions: db.actions
      .filter((a) => a.companyId === c.id)
      .map((a) => ({
        action: a,
        overdue: a.status !== 'complete' && a.dueDate < now(),
        owner: db.users.find((u) => u.id === a.ownerId),
      })),
    reports: db.reports.filter((r) => r.companyId === c.id).sort((a, b) => b.year - a.year),
    members: members.map((u) => ({
      user: u,
      completed: completedPath(u),
      points: pointsBalance(u.id).lifetime,
    })),
    application: db.applications.find((a) => a.companyId === c.id),
    purchases: db.purchases
      .filter((p) => p.companyId === c.id)
      .map((p) => ({
        purchase: p,
        offering: certificationOfferings.find((o) => o.id === p.offeringId),
      })),
    listings: db.listings.filter((l) => l.companyId === c.id),
    bookings: db.bookings.filter((b) => b.companyId === c.id).length,
    registrations: db.registrations.filter(
      (r) => members.some((m) => m.id === r.userId) && r.status !== 'cancelled',
    ).length,
  })
}

export async function getUsersTable() {
  await delay()
  requireCapability('admin.reporting')
  return out(
    db.users.map((u) => ({
      user: u,
      companyName:
        db.companies.find((c) => c.id === u.companyId)?.name ??
        (u.role === 'mentor' ? 'Expert network' : 'UN Women'),
      completed: completedPath(u),
      points: pointsBalance(u.id).lifetime,
    })),
  )
}

export async function getLearningReport() {
  await delay()
  requireCapability('admin.reporting')
  const approvedIds = new Set(approvedCompanies().map((c) => c.id))
  const learners = db.users.filter((u) => approvedIds.has(u.companyId ?? '') && isActivated(u))
  const courses = db.courses.map((c) => {
    const prog = db.progress.filter((p) => p.courseId === c.id)
    const steps = c.lessons.map((l, i) => ({
      step: `L${i + 1}`,
      title: l.title,
      reached: prog.filter((p) => p.completedLessonIds.includes(l.id)).length,
    }))
    return {
      course: c,
      enrolled: prog.length,
      completed: prog.filter((p) => p.completedAt).length,
      steps,
    }
  })
  const departments = DEPARTMENTS.map((d) => {
    const inDept = learners.filter((u) => u.department === d.id)
    const path = pathForDepartment(d.id)
    return {
      department: d.short,
      learners: inDept.length,
      completed: inDept.filter(completedPath).length,
      ready: inDept.filter((u) => evaluateClinicEligibility(u.id, path.clinicId).eligible).length,
      registered: db.registrations.filter(
        (r) =>
          r.eventId === path.clinicId &&
          r.status === 'registered' &&
          inDept.some((u) => u.id === r.userId),
      ).length,
    }
  })
  const events = db.events.map((e) => {
    const regs = db.registrations.filter((r) => r.eventId === e.id)
    const fb = regs.filter((r) => r.feedback)
    return {
      event: e,
      registered: regs.filter((r) => r.status !== 'cancelled').length,
      attended: regs.filter((r) => r.status === 'attended').length,
      noShow: regs.filter((r) => r.status === 'no_show').length,
      waitlisted: regs.filter((r) => r.status === 'waitlisted').length,
      rating: fb.length ? fb.reduce((n, r) => n + (r.feedback?.rating ?? 0), 0) / fb.length : null,
    }
  })
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
  const trend = months.map((m, i) => {
    const prefix = `2026-${String(4 + i).padStart(2, '0')}`
    return {
      month: m,
      lessons: db.points.filter(
        (p) => p.action === 'lesson_complete' && p.createdAt.startsWith(prefix),
      ).length,
      completions: db.progress.filter((p) => p.completedAt?.startsWith(prefix)).length,
      attendance: db.registrations.filter(
        (r) =>
          r.status === 'attended' &&
          db.events.find((e) => e.id === r.eventId)?.startsAt.startsWith(prefix),
      ).length,
    }
  })
  return out({ courses, departments, events, trend, resourceViews: db.recentResources.length })
}

export async function getMentorshipReport() {
  await delay()
  requireCapability('admin.reporting')
  return out(
    db.mentorProfiles
      .filter((p) => db.users.some((u) => u.id === p.userId))
      .map((p) => {
        const u = db.users.find((x) => x.id === p.userId)
        const slots = db.slots.filter((s) => s.mentorId === p.userId)
        const bookings = db.bookings.filter((b) => b.mentorId === p.userId)
        return {
          profile: p,
          name: u ? fullName(u) : '',
          avatar: u?.avatar,
          open: slots.filter((s) => s.status === 'open').length,
          booked: slots.filter((s) => s.status === 'booked').length,
          completed: bookings.filter((b) => b.status === 'completed').length,
          noShows: bookings.filter((b) => b.status === 'no_show').length,
          pointsRedeemed: bookings
            .filter((b) => b.status !== 'cancelled')
            .reduce((n, b) => n + b.pointsCost, 0),
          followUps: bookings.filter((b) => b.followUp).length,
        }
      }),
  )
}

export async function getAssessmentsReport() {
  await delay()
  requireCapability('admin.reporting')
  const approved = approvedCompanies()
  const themes = [1, 2, 3, 4, 5, 6, 7].map((p) => ({
    principle: p,
    actions: db.actions.filter((a) => a.principle === p).length,
  }))
  return out({
    baseline: approved.map((c) => ({
      company: c,
      assessed: db.assessments.some((a) => a.companyId === c.id && a.status === 'submitted'),
      actions: actionStats(c.id),
    })),
    themes,
    totals: actionStats(),
  })
}

export async function getAnnualReportsMatrix() {
  await delay()
  requireCapability('admin.reporting')
  const years = [2024, 2025, 2026]
  return out({
    years,
    rows: approvedCompanies().map((c) => ({
      company: c,
      cells: years.map((y) => {
        const r = db.reports.find((x) => x.companyId === c.id && x.year === y)
        return {
          year: y,
          status: r?.status ?? 'not_started',
          reportId: r?.id,
          versions: r?.versions.length ?? 0,
          overdue:
            y === db.settings.reportingYear &&
            r?.status !== 'accepted' &&
            r?.changeRequests.some((cr) => !cr.resolved),
        }
      }),
    })),
  })
}

export async function getCommunityReport() {
  await delay()
  requireCapability('admin.reporting')
  const threads = db.threads
  return out({
    threads: threads.length,
    replies: threads.reduce((n, t) => n + t.replies.length, 0),
    unanswered: threads.filter((t) => t.replies.length === 0 && !t.isAnnouncement).length,
    flagged:
      threads.filter((t) => t.status === 'flagged').length +
      threads.reduce((n, t) => n + t.replies.filter((r) => r.status === 'flagged').length, 0),
    byChannel: [
      'General Questions',
      'HR and Workplace',
      'Procurement',
      'Learning and Clinics',
      'Reporting',
    ].map((ch) => ({ channel: ch, threads: threads.filter((t) => t.channel === ch).length })),
    listings: db.listings.map((l) => ({
      listing: l,
      companyName: db.companies.find((c) => c.id === l.companyId)?.name ?? '',
    })),
  })
}

export async function getCertificationReport() {
  await delay()
  requireCapability('admin.reporting')
  const purchases = db.purchases.filter((p) => p.status !== 'unpaid')
  const paid = purchases.filter((p) => p.paidAt && p.status !== 'refunded')
  return out({
    offerings: certificationOfferings.map((o) => {
      const list = db.purchases.filter((p) => p.offeringId === o.id)
      return {
        offering: o,
        purchases: list.filter((p) => p.paidAt).length,
        confirmedRevenue: list.filter((p) => p.paidAt && p.status !== 'refunded').length * o.price,
        attempts: list.reduce((n, p) => n + p.attempts.length, 0),
        passed: list.filter((p) => p.status === 'certificate_issued').length,
        refunds: list.filter((p) => p.status === 'refunded').length,
      }
    }),
    totals: {
      confirmedRevenue: paid.reduce((n, p) => n + p.amount, 0),
      issued: db.purchases.filter((p) => p.status === 'certificate_issued').length,
    },
    rows: db.purchases.map((p) => ({
      purchase: p,
      offering: certificationOfferings.find((o) => o.id === p.offeringId),
      companyName: db.companies.find((c) => c.id === p.companyId)?.name ?? '',
    })),
  })
}

/** CSV export of any table, labelled with scope, period and timestamp. */
export function toCsv(
  title: string,
  scope: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
) {
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const meta = [
    `# ${title}`,
    `# Scope: ${scope}`,
    `# Exported: ${new Date(now()).toISOString()} (Illustrative demo data)`,
  ]
  return [...meta, headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n')
}
