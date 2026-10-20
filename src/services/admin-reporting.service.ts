// UN Women Reporting workspace (brief §22–23). Platform activity, implementation evidence and
// company-reported outcomes are kept as distinct layers. Filters apply to every view.

import { fullName } from '@shared/permissions'
import { DEPARTMENTS } from '@shared/reference'
import type { DepartmentId, PrincipleId, ReportStatus, User } from '@shared/types'
import { DESIGNATED_COURSE_BY_DEPT } from '@/mocks/seed/progress'
import { db, delay, findOr404, now, out, requireCapability } from './api'
import { evaluateClinicEligibility } from './clinics.service'
import { pathForDepartment } from './learning.service'
import {
  actionStats,
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
  principle?: PrincipleId
}

const scopedCompanies = (f: ReportingFilters) =>
  db.companies.filter(
    (c) =>
      (!f.country || c.country === f.country) &&
      (!f.sector || c.sector === f.sector) &&
      (!f.companyId || c.id === f.companyId),
  )

const hasCompanyScope = (f: ReportingFilters) => Boolean(f.country || f.sector || f.companyId)

/** User-level scope: company filters plus the department filter. */
const userScope = (f: ReportingFilters) => {
  const ids = new Set(scopedCompanies(f).map((c) => c.id))
  return (u: User) =>
    (!hasCompanyScope(f) || Boolean(u.companyId && ids.has(u.companyId))) &&
    (!f.department || u.department === f.department)
}
const userById = (id: string) => db.users.find((u) => u.id === id)
const scopedApproved = (f: ReportingFilters) =>
  scopedCompanies(f).filter((c) => c.signatoryStatus === 'approved')
const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
const monthPrefix = (i: number) => `2026-${String(4 + i).padStart(2, '0')}`

export async function getExecutiveDashboard(f: ReportingFilters = {}) {
  await delay(350)
  requireCapability('admin.reporting')
  const year = f.year ?? db.settings.reportingYear
  const all = scopedCompanies(f)
  const approved = all.filter((c) => c.signatoryStatus === 'approved')
  const inScope = userScope(f)
  const users = approved.flatMap((c) => companyMembers(c.id)).filter(inScope)
  const activated = users.filter(isActivated)
  const completed = activated.filter(completedPath)
  const scopedUserIds = new Set(users.map((u) => u.id))
  const doneEvents = new Set(db.events.filter((e) => e.status === 'completed').map((e) => e.id))
  const attRegs = db.registrations.filter(
    (r) => doneEvents.has(r.eventId) && r.status !== 'cancelled' && scopedUserIds.has(r.userId),
  )
  const attended = attRegs.filter((r) => r.status === 'attended').length
  const attendance = { registered: attRegs.length, attended, rate: pct(attended, attRegs.length) }
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
      value: all.length + (hasCompanyScope(f) ? 0 : rejectedApps),
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

  const companyScoped = hasCompanyScope(f)
  const scopedIds = new Set(all.map((c) => c.id))
  const clinicGaps = db.events
    .filter((e) => e.type === 'clinic' && e.status === 'scheduled')
    .map((e) => ({
      event: e,
      gaps: db.registrations.filter(
        (r) =>
          r.eventId === e.id &&
          r.status === 'registered' &&
          scopedUserIds.has(r.userId) &&
          !evaluateClinicEligibility(r.userId, e.id).eligible,
      ).length,
    }))
    .filter((x) => x.gaps > 0)
  const attention = [
    ...clinicGaps.map(({ event, gaps }) => ({
      id: `att-cl-${event.id}`,
      label: `${gaps} registered participant${gaps === 1 ? '' : 's'} not yet eligible`,
      target: event.title,
      to: `/admin/reporting/learning?event=${event.id}`,
      severity: 'warning' as const,
    })),
    ...db.applications
      .filter((a) => !companyScoped && a.status === 'information_requested')
      .map((a) => ({
        id: `att-${a.id}`,
        label: 'Information request awaiting response',
        target: a.data.company.name,
        to: `/admin/manage/applications/${a.id}`,
        severity: 'warning' as const,
      })),
    ...db.applications
      .filter(
        (a) => !companyScoped && ['submitted', 'under_review', 'resubmitted'].includes(a.status),
      )
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
      .filter(
        (l) =>
          ['submitted', 'under_review', 'resubmitted'].includes(l.status) &&
          (!companyScoped || scopedIds.has(l.companyId)),
      )
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
        r.status !== 'cancelled' &&
        scopedUserIds.has(r.userId) &&
        db.users.find((u) => u.id === r.userId)?.department === d.id,
    ).length,
    mentoring: db.bookings.filter(
      (b) =>
        scopedUserIds.has(b.userId) && db.users.find((u) => u.id === b.userId)?.department === d.id,
    ).length,
  }))

  return out({
    period: `Reporting year ${year} · data as of ${new Date(now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    scope: { companies: all.length, users: users.length },
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
        text: `${approved.reduce((n, c) => n + actionStats(c.id).overdue, 0)} company actions are overdue across ${approved.filter((c) => actionStats(c.id).overdue > 0).length} companies; most relate to people practices.`,
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
        activeTeams: new Set(
          companyMembers(c.id)
            .filter(isActivated)
            .map((u) => u.department)
            .filter(Boolean),
        ).size,
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
        offering: db.offerings.find((o) => o.id === p.offeringId),
      })),
    listings: db.listings.filter((l) => l.companyId === c.id),
    bookings: db.bookings.filter((b) => b.companyId === c.id).length,
    registrations: db.registrations.filter(
      (r) => members.some((m) => m.id === r.userId) && r.status !== 'cancelled',
    ).length,
  })
}

export async function getUsersTable(f: ReportingFilters = {}) {
  await delay()
  requireCapability('admin.reporting')
  const inScope = userScope(f)
  return out(
    db.users.filter(inScope).map((u) => {
      const courseId = DESIGNATED_COURSE_BY_DEPT[u.department ?? 'hr']
      const course = db.courses.find((c) => c.id === courseId)
      const prog = db.progress.find((p) => p.userId === u.id && p.courseId === courseId)
      const lessons = course?.lessons.length ?? 0
      return {
        user: u,
        companyName:
          db.companies.find((c) => c.id === u.companyId)?.name ??
          (u.role === 'mentor' ? 'Expert network' : 'UN Women'),
        completed: completedPath(u),
        learningPct: prog?.completedAt
          ? 100
          : Math.round(((prog?.completedLessonIds.length ?? 0) / Math.max(1, lessons)) * 100),
        points: pointsBalance(u.id).lifetime,
      }
    }),
  )
}

export async function getLearningReport(f: ReportingFilters = {}) {
  await delay()
  requireCapability('admin.reporting')
  const inScope = userScope(f)
  const approvedIds = new Set(scopedApproved(f).map((c) => c.id))
  const learners = db.users.filter(
    (u) => approvedIds.has(u.companyId ?? '') && isActivated(u) && inScope(u),
  )
  const learnerIds = new Set(learners.map((u) => u.id))
  const scopedUser = (id: string) => {
    const u = userById(id)
    return u ? inScope(u) : false
  }
  const courses = db.courses.map((c) => {
    const prog = db.progress.filter((p) => p.courseId === c.id && scopedUser(p.userId))
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
      byDepartment: DEPARTMENTS.map((d) => ({
        department: d.short,
        enrolled: prog.filter((p) => userById(p.userId)?.department === d.id).length,
        completed: prog.filter((p) => p.completedAt && userById(p.userId)?.department === d.id)
          .length,
      })).filter((r) => r.enrolled > 0),
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
    const regs = db.registrations.filter((r) => r.eventId === e.id && scopedUser(r.userId))
    const fb = regs.filter((r) => r.feedback)
    return {
      event: e,
      registered: regs.filter((r) => r.status !== 'cancelled').length,
      attended: regs.filter((r) => r.status === 'attended').length,
      noShow: regs.filter((r) => r.status === 'no_show').length,
      waitlisted: regs.filter((r) => r.status === 'waitlisted').length,
      rating: fb.length ? fb.reduce((n, r) => n + (r.feedback?.rating ?? 0), 0) / fb.length : null,
      feedbackCount: fb.length,
      registrants: regs.map((r) => {
        const u = userById(r.userId)
        return {
          id: r.id,
          name: u ? fullName(u) : 'Unknown',
          companyName: db.companies.find((c) => c.id === u?.companyId)?.name ?? '',
          status: r.status,
          rating: r.feedback?.rating ?? null,
          comment: r.feedback?.comment ?? '',
        }
      }),
    }
  })
  const trend = MONTHS.map((m, i) => {
    const prefix = monthPrefix(i)
    return {
      month: m,
      lessons: db.points.filter(
        (p) =>
          p.action === 'lesson_complete' &&
          p.createdAt.startsWith(prefix) &&
          learnerIds.has(p.userId),
      ).length,
      completions: db.progress.filter(
        (p) => p.completedAt?.startsWith(prefix) && learnerIds.has(p.userId),
      ).length,
      attendance: db.registrations.filter(
        (r) =>
          r.status === 'attended' &&
          learnerIds.has(r.userId) &&
          db.events.find((e) => e.id === r.eventId)?.startsAt.startsWith(prefix),
      ).length,
    }
  })
  const done = new Set(db.events.filter((e) => e.status === 'completed').map((e) => e.id))
  const totals = {
    learners: learners.length,
    completed: learners.filter(completedPath).length,
    ready: departments.reduce((n, d) => n + d.ready, 0),
    registered: events.reduce((n, e) => n + e.registered, 0),
    attended: events.reduce((n, e) => n + (done.has(e.event.id) ? e.attended : 0), 0),
    attendanceBase: events.reduce((n, e) => n + (done.has(e.event.id) ? e.registered : 0), 0),
  }
  return out({ courses, departments, events, trend, totals })
}

export async function getAnalytics(f: ReportingFilters = {}) {
  await delay()
  requireCapability('admin.reporting')
  const learning = (await getLearningReport(f)) as Awaited<ReturnType<typeof getLearningReport>>
  const inScope = userScope(f)
  const approvedIds = new Set(scopedApproved(f).map((c) => c.id))
  const learners = db.users.filter(
    (u) => approvedIds.has(u.companyId ?? '') && isActivated(u) && inScope(u),
  )
  const pathways = DEPARTMENTS.map((d) => {
    const assigned = learners.filter((u) => u.department === d.id)
    const course = db.courses.find((c) => c.id === DESIGNATED_COURSE_BY_DEPT[d.id])
    const steps = [
      { step: 'Assigned', title: 'Learners assigned this pathway', reached: assigned.length },
      ...(course?.lessons ?? []).map((l, i) => ({
        step: `L${i + 1}`,
        title: l.title,
        reached: db.progress.filter(
          (p) =>
            p.courseId === course?.id &&
            p.completedLessonIds.includes(l.id) &&
            assigned.some((u) => u.id === p.userId),
        ).length,
      })),
    ]
    return { department: d.short, course: course?.title ?? '', assigned: assigned.length, steps }
  })
  const learnerIds = new Set(learners.map((u) => u.id))
  const resourceCounts = new Map<string, number>()
  for (const r of db.recentResources) {
    if (learnerIds.has(r.userId)) {
      resourceCounts.set(r.resourceId, (resourceCounts.get(r.resourceId) ?? 0) + 1)
    }
  }
  const resourceUse = [...resourceCounts.entries()]
    .map(([id, views]) => ({
      title: db.resources.find((r) => r.id === id)?.title ?? id,
      views,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)
  const mentorEngagement = MONTHS.map((m, i) => {
    const prefix = monthPrefix(i)
    const list = db.bookings.filter(
      (b) => b.createdAt.startsWith(prefix) && learnerIds.has(b.userId),
    )
    return {
      month: m,
      booked: list.filter((b) => b.status !== 'cancelled').length,
      completed: list.filter((b) => b.status === 'completed').length,
      noShows: list.filter((b) => b.status === 'no_show').length,
    }
  })
  const departments = DEPARTMENTS.map((d) => {
    const inDept = learners.filter((u) => u.department === d.id)
    const ids = new Set(inDept.map((u) => u.id))
    const regs = db.registrations.filter((r) => ids.has(r.userId) && r.status !== 'cancelled')
    return {
      department: d.short,
      learners: inDept.length,
      completed: inDept.filter(completedPath).length,
      completionRate: pct(inDept.filter(completedPath).length, inDept.length),
      registered: regs.length,
      attended: regs.filter((r) => r.status === 'attended').length,
      mentorBookings: db.bookings.filter((b) => ids.has(b.userId) && b.status !== 'cancelled')
        .length,
    }
  })
  return out({
    trend: learning.trend,
    pathways,
    resourceUse,
    resourceEvents: db.recentResources.filter((r) => learnerIds.has(r.userId)).length,
    mentorEngagement,
    departments,
    totals: learning.totals,
  })
}

export async function getMentorshipReport(f: ReportingFilters = {}) {
  await delay()
  requireCapability('admin.reporting')
  const inScope = userScope(f)
  const scoped = hasCompanyScope(f) || Boolean(f.department)
  return out(
    db.mentorProfiles
      .filter((p) => db.users.some((u) => u.id === p.userId))
      .map((p) => {
        const u = userById(p.userId)
        const slots = db.slots.filter((s) => s.mentorId === p.userId)
        const bookings = db.bookings.filter((b) => {
          if (b.mentorId !== p.userId) return false
          const booker = userById(b.userId)
          return !scoped || (booker ? inScope(booker) : false)
        })
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

export async function getAssessmentsReport(f: ReportingFilters = {}) {
  await delay()
  requireCapability('admin.reporting')
  const approved = scopedApproved(f)
  const ids = new Set(approved.map((c) => c.id))
  const n = now()
  const actions = db.actions.filter(
    (a) =>
      ids.has(a.companyId) &&
      (!f.principle || a.principle === f.principle) &&
      (!f.department || a.department === f.department),
  )
  const active = actions.filter((a) => a.status !== 'draft')
  const themes = ([1, 2, 3, 4, 5, 6, 7] as PrincipleId[]).map((p) => {
    const list = actions.filter((a) => a.principle === p)
    return {
      principle: p,
      actions: list.length,
      complete: list.filter((a) => a.status === 'complete').length,
      overdue: list.filter((a) => a.status !== 'complete' && a.dueDate < n).length,
      priorityCompanies: approved.filter((c) => c.priorityPrinciples.includes(p)).length,
    }
  })
  return out({
    baseline: approved.map((c) => ({
      company: c,
      assessed: db.assessments.some((a) => a.companyId === c.id && a.status === 'submitted'),
      actions: actionStats(c.id),
    })),
    themes,
    actions: actions.map((a) => ({
      action: a,
      companyName: db.companies.find((c) => c.id === a.companyId)?.name ?? '',
      overdue: a.status !== 'complete' && a.dueDate < n,
      ownerName: userById(a.ownerId) ? fullName(userById(a.ownerId) as User) : '',
      evidenceCount: a.evidence.length,
    })),
    totals: {
      total: actions.length,
      active: active.length,
      complete: actions.filter((a) => a.status === 'complete').length,
      overdue: actions.filter((a) => a.status !== 'complete' && a.dueDate < n).length,
      withEvidence: active.filter((a) => a.evidence.length > 0).length,
      acceptedContributions: actions.filter((a) => a.status === 'complete' && a.evidence.length > 0)
        .length,
    },
  })
}

export async function getAnnualReportsMatrix(f: ReportingFilters = {}) {
  await delay()
  requireCapability('admin.reporting')
  const years = [2024, 2025, 2026]
  const n = now()
  return out({
    years,
    rows: scopedApproved(f).map((c) => {
      const cells = years.map((y) => {
        const r = db.reports.find((x) => x.companyId === c.id && x.year === y)
        return {
          year: y,
          status: (r?.status ?? 'not_started') as ReportStatus,
          reportId: r?.id,
          versions: r?.versions.length ?? 0,
          dueDate: r?.dueDate,
          overdue: Boolean(r && r.status !== 'accepted' && r.dueDate < n),
          openChanges: r?.changeRequests.filter((cr) => !cr.resolved).length ?? 0,
          indicators: r?.indicators.length ?? 0,
        }
      })
      return {
        company: c,
        cells,
        comparisonReady: cells.filter((x) => x.status === 'accepted').length >= 2,
        acceptedYears: cells.filter((x) => x.status === 'accepted').length,
      }
    }),
  })
}

export async function getCommunityReport(f: ReportingFilters = {}) {
  await delay()
  requireCapability('admin.reporting')
  const inScope = userScope(f)
  const scoped = hasCompanyScope(f) || Boolean(f.department)
  const authorOk = (id: string) => {
    if (!scoped) return true
    const u = userById(id)
    return u ? inScope(u) : false
  }
  const threads = db.threads.filter((t) => authorOk(t.authorId))
  const participants = new Set<string>()
  for (const t of threads) {
    participants.add(t.authorId)
    for (const r of t.replies) if (r.authorId !== 'ai') participants.add(r.authorId)
  }
  const nameOf = (id: string) => {
    const u = userById(id)
    return u ? fullName(u) : 'Unknown'
  }
  const ids = new Set(scopedCompanies(f).map((c) => c.id))
  const listings = db.listings
    .filter((l) => !hasCompanyScope(f) || ids.has(l.companyId))
    .map((l) => ({
      listing: l,
      companyName: db.companies.find((c) => c.id === l.companyId)?.name ?? '',
    }))
  return out({
    threads: threads.length,
    replies: threads.reduce((n, t) => n + t.replies.length, 0),
    participants: participants.size,
    unanswered: threads.filter((t) => t.replies.length === 0 && !t.isAnnouncement).length,
    unansweredRows: threads
      .filter((t) => t.replies.length === 0 && !t.isAnnouncement)
      .map((t) => ({ thread: t, author: nameOf(t.authorId) })),
    flagged:
      threads.filter((t) => t.status === 'flagged').length +
      threads.reduce((n, t) => n + t.replies.filter((r) => r.status === 'flagged').length, 0),
    flaggedRows: threads
      .filter((t) => t.status === 'flagged' || t.replies.some((r) => r.status === 'flagged'))
      .map((t) => ({ thread: t, author: nameOf(t.authorId) })),
    byChannel: [
      'General Questions',
      'HR and Workplace',
      'Procurement',
      'Learning and Clinics',
      'Reporting',
    ].map((ch) => ({
      channel: ch,
      threads: threads.filter((t) => t.channel === ch).length,
      replies: threads.filter((t) => t.channel === ch).reduce((n, t) => n + t.replies.length, 0),
    })),
    listings,
    approvals: [
      'submitted',
      'under_review',
      'changes_requested',
      'resubmitted',
      'published',
      'rejected',
    ].map((s) => ({ status: s, count: listings.filter((l) => l.listing.status === s).length })),
  })
}

export async function getCertificationReport(f: ReportingFilters = {}) {
  await delay()
  requireCapability('admin.reporting')
  const ids = new Set(scopedCompanies(f).map((c) => c.id))
  const all = db.purchases.filter((p) => !hasCompanyScope(f) || ids.has(p.companyId))
  // Each purchase record is one payment: it is counted once at each funnel stage, never added
  // up across stages. Revenue only comes from confirmed, non-refunded payments.
  const initiated = all.filter((p) => p.status !== 'unpaid')
  const confirmed = all.filter((p) => p.paidAt && p.status !== 'refunded')
  const refunded = all.filter((p) => p.status === 'refunded')
  const sat = confirmed.filter((p) => p.attempts.length > 0)
  const passed = confirmed.filter((p) => p.status === 'passed' || p.status === 'certificate_issued')
  const issued = all.filter((p) => p.status === 'certificate_issued')
  return out({
    offerings: db.offerings
      .filter((o) => o.status !== 'draft')
      .map((o) => {
        const list = all.filter((p) => p.offeringId === o.id)
        const conf = list.filter((p) => p.paidAt && p.status !== 'refunded')
        return {
          offering: o,
          initiated: list.filter((p) => p.status !== 'unpaid').length,
          confirmed: conf.length,
          confirmedRevenue: conf.reduce((n, p) => n + p.amount, 0),
          attempts: list.reduce((n, p) => n + p.attempts.length, 0),
          passed: conf.filter((p) => p.status === 'passed' || p.status === 'certificate_issued')
            .length,
          issued: list.filter((p) => p.status === 'certificate_issued').length,
          refunds: list.filter((p) => p.status === 'refunded').length,
        }
      }),
    funnel: [
      { stage: 'Checkouts started', value: initiated.length },
      { stage: 'Confirmed payments', value: confirmed.length },
      { stage: 'Exam attempted', value: sat.length },
      { stage: 'Passed', value: passed.length },
      { stage: 'Credentials issued', value: issued.length },
    ],
    totals: {
      initiated: initiated.length,
      confirmed: confirmed.length,
      refunded: refunded.length,
      attempts: all.reduce((n, p) => n + p.attempts.length, 0),
      passed: passed.length,
      issued: issued.length,
      confirmedRevenue: confirmed.reduce((n, p) => n + p.amount, 0),
    },
    rows: all.map((p) => ({
      purchase: p,
      offering: db.offerings.find((o) => o.id === p.offeringId),
      companyName: db.companies.find((c) => c.id === p.companyId)?.name ?? '',
    })),
  })
}

/** Dataset rows for the Report Builder; same scope rules as every other view. */
export async function getBuilderDataset(f: ReportingFilters = {}) {
  await delay()
  requireCapability('admin.reporting')
  const year = f.year ?? db.settings.reportingYear
  const companies = scopedCompanies(f)
  const ids = new Set(companies.map((c) => c.id))
  const inScope = userScope(f)
  const n = now()
  const nameOf = (id: string) => db.companies.find((c) => c.id === id)?.name ?? ''
  const learners = db.users.filter((u) => inScope(u) && u.companyId)
  return out({
    year,
    companies: companies.map((c) => ({
      name: c.name,
      country: c.country,
      region: c.region,
      sector: c.sector,
      size: c.size,
      status: c.signatoryStatus,
      employees: c.employeeCount,
      invited: companyUserStats(c.id).invited,
      activated: companyUserStats(c.id).activated,
      learningCompletion: companyUserStats(c.id).completionRate,
      reportStatus: reportStatusFor(c.id, year),
      overdueActions: actionStats(c.id).overdue,
    })),
    users: learners.map((u) => ({
      name: fullName(u),
      company: nameOf(u.companyId ?? ''),
      country: db.companies.find((c) => c.id === u.companyId)?.country ?? '',
      department: u.department ?? '',
      role: u.role,
      invitation: u.invitationStatus,
      pathCompleted: completedPath(u) ? 'Yes' : 'No',
      points: pointsBalance(u.id).lifetime,
      lastActive: u.lastActiveAt?.slice(0, 10) ?? '',
    })),
    actions: db.actions
      .filter(
        (a) =>
          ids.has(a.companyId) &&
          (!f.principle || a.principle === f.principle) &&
          (!f.department || a.department === f.department),
      )
      .map((a) => ({
        company: nameOf(a.companyId),
        action: a.title,
        principle: a.principle,
        department: a.department,
        status: a.status,
        dueDate: a.dueDate.slice(0, 10),
        overdue: a.status !== 'complete' && a.dueDate < n ? 'Yes' : 'No',
        evidenceFiles: a.evidence.length,
      })),
    reports: db.reports
      .filter((r) => ids.has(r.companyId))
      .map((r) => ({
        company: nameOf(r.companyId),
        year: r.year,
        status: r.status,
        versions: r.versions.length,
        dueDate: r.dueDate.slice(0, 10),
        openChangeRequests: r.changeRequests.filter((cr) => !cr.resolved).length,
        indicators: r.indicators.length,
      })),
    learning: db.progress
      .filter((p) => {
        const u = userById(p.userId)
        return u ? inScope(u) && Boolean(u.companyId) : false
      })
      .map((p) => {
        const u = userById(p.userId) as User
        return {
          learner: fullName(u),
          company: nameOf(u.companyId ?? ''),
          department: u.department ?? '',
          course: db.courses.find((c) => c.id === p.courseId)?.title ?? p.courseId,
          lessonsDone: p.completedLessonIds.length,
          completed: p.completedAt ? 'Yes' : 'No',
          completedOn: p.completedAt?.slice(0, 10) ?? '',
        }
      }),
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
