// Annual company reports (brief §20):
// Draft > Ready for Company Approval > Submitted > Under Review > Changes Requested >
// Resubmitted > Accepted. Each submission creates a dated version snapshot. Missing data stays
// missing (never silently zero). "Accepted" is a review status, not independent verification.

import { fullName } from '@shared/permissions'
import type { AnnualReport, ReportIndicator, ReportSectionKey } from '@shared/types'
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
  requireUser,
} from './api'

export const SECTION_META: { key: ReportSectionKey; title: string; help: string }[] = [
  {
    key: 'snapshot',
    title: 'Company snapshot',
    help: 'Who you are, where you operate and the scope of this report.',
  },
  {
    key: 'narrative',
    title: 'Executive narrative',
    help: 'A short message from leadership on progress and priorities.',
  },
  {
    key: 'actions',
    title: 'Priority actions',
    help: 'What you committed to, what you did and the status of each action.',
  },
  {
    key: 'support',
    title: 'Learning and support used',
    help: 'Courses, clinics and expert support that informed your work. Prefilled from portal records.',
  },
  {
    key: 'principles',
    title: 'Principle-related progress',
    help: 'Progress grouped by the seven principles you prioritised.',
  },
  {
    key: 'indicators',
    title: 'Indicators and evidence',
    help: 'Values with unit, coverage, period and evidence. Leave blank if not available.',
  },
  {
    key: 'challenges',
    title: 'Challenges and next-year priorities',
    help: 'What was hard and what you will focus on next.',
  },
  {
    key: 'declaration',
    title: 'Final review and declaration',
    help: 'Confirmation by the CEO or a delegated administrator.',
  },
]

const canSee = (companyId: string) => {
  const user = requireCapability('reports.view')
  if (user.companyId !== companyId)
    throw new ApiError('You can only see your own company’s reports.', 'forbidden')
  return user
}

/** Prefill from portal records, labelled with source and period. */
function prefillSupport(companyId: string) {
  const members = db.users.filter((u) => u.companyId === companyId).map((u) => u.id)
  const completions = db.progress.filter(
    (p) => members.includes(p.userId) && p.completedAt && p.completedAt >= '2026-01-01',
  ).length
  const attended = db.registrations.filter(
    (r) => members.includes(r.userId) && r.status === 'attended',
  ).length
  const sessions = db.bookings.filter(
    (b) => b.companyId === companyId && b.status === 'completed',
  ).length
  return `Source: WEPs portal records, 1 Jan – ${new Date(now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}. ${completions} course completions, ${attended} confirmed clinic attendances and ${sessions} completed mentoring sessions across the company.`
}

export async function listCompanyReports() {
  await delay()
  const user = requireCapability('reports.view')
  const rows = db.reports
    .filter((r) => r.companyId === user.companyId)
    .sort((a, b) => b.year - a.year)
  return out({
    current: rows.find((r) => r.year === db.settings.reportingYear) ?? null,
    history: rows,
    dueDate: db.settings.reportingDueDate,
    canSubmit: user.role === 'ceo' || user.permissions.includes('submit_reports'),
  })
}

export async function getReport(year: number) {
  await delay()
  const user = requireCapability('reports.view')
  let r = db.reports.find((x) => x.companyId === user.companyId && x.year === year)
  if (!r && year === db.settings.reportingYear)
    r = await createReport(user.companyId as string, year)
  if (!r) throw new ApiError('No report for that year.', 'not_found')
  canSee(r.companyId)
  const previous = db.reports.find((x) => x.companyId === r.companyId && x.year === year - 1)
  const preparer = db.users.find((u) => u.id === r.preparerId)
  return out({
    report: r,
    previous: previous ?? null,
    preparerName: preparer ? fullName(preparer) : undefined,
    canSubmit: user.role === 'ceo' || user.permissions.includes('submit_reports'),
    canEdit: ['draft', 'changes_requested', 'ready_for_approval', 'not_started'].includes(r.status),
    supportPrefill: prefillSupport(r.companyId),
  })
}

async function createReport(companyId: string, year: number): Promise<AnnualReport> {
  const empty = Object.fromEntries(SECTION_META.map((s) => [s.key, ''])) as Record<
    ReportSectionKey,
    string
  >
  const done = Object.fromEntries(SECTION_META.map((s) => [s.key, false])) as Record<
    ReportSectionKey,
    boolean
  >
  const r: AnnualReport = {
    id: newId('rep'),
    companyId,
    year,
    status: 'draft',
    dueDate: db.settings.reportingDueDate,
    sections: empty,
    sectionComplete: done,
    indicators: [],
    evidence: [],
    versions: [],
    changeRequests: [],
    publicSummaryApproved: false,
    updatedAt: now(),
  }
  db.reports.push(r)
  return r
}

const editable = (year: number) => {
  const user = requireCapability('reports.prepare')
  const r = findOr404(
    db.reports,
    (x) => x.companyId === user.companyId && x.year === year,
    'Report',
  )
  if (!['draft', 'changes_requested', 'ready_for_approval'].includes(r.status))
    throw new ApiError('This report is locked while under review.', 'conflict')
  return { user, r }
}

export async function saveSection(
  year: number,
  key: ReportSectionKey,
  text: string,
  complete: boolean,
) {
  await delay(250)
  const { user, r } = editable(year)
  r.sections[key] = text
  r.sectionComplete[key] = complete
  r.preparerId = r.preparerId ?? user.id
  r.updatedAt = now()
  const cr = r.changeRequests.find((c) => c.section === key && !c.resolved)
  if (cr && complete) cr.resolved = true
  commit()
  return out(r)
}

export async function saveIndicators(year: number, indicators: ReportIndicator[]) {
  await delay(250)
  const { r } = editable(year)
  for (const i of indicators) {
    if (i.value !== null && (!i.unit || !i.coverage || !i.period))
      throw new ApiError(`“${i.label}” needs a unit, coverage and period.`)
  }
  r.indicators = indicators
  r.updatedAt = now()
  commit()
  return out(r)
}

export async function attachReportEvidence(year: number, fileName: string, note?: string) {
  await delay(350)
  const { user, r } = editable(year)
  r.evidence.push({ id: newId('ev'), fileName, uploadedById: user.id, uploadedAt: now(), note })
  commit()
  return out(r)
}

export async function requestApproval(year: number) {
  await delay(400)
  const { user, r } = editable(year)
  const missing = Object.entries(r.sectionComplete).filter(([k, v]) => !v && k !== 'declaration')
  if (missing.length)
    throw new ApiError(`Complete ${missing.length} section(s) before requesting approval.`)
  r.status = 'ready_for_approval'
  const company = db.companies.find((c) => c.id === r.companyId)
  if (company?.ceoId && company.ceoId !== user.id) {
    notify({
      userId: company.ceoId,
      category: 'report',
      title: `${year} report ready for your approval`,
      body: `${fullName(user)} prepared the report and attached evidence.`,
      link: `/portal/reports/${year}`,
      critical: true,
    })
  }
  commit()
  return out(r)
}

/** CEO (or delegated administrator) submits; a dated version snapshot is stored. */
export async function submitReport(year: number, declaration: string) {
  await delay(700)
  const user = requireCapability('reports.submit')
  const r = findOr404(
    db.reports,
    (x) => x.companyId === user.companyId && x.year === year,
    'Report',
  )
  if (!['ready_for_approval', 'changes_requested', 'draft'].includes(r.status))
    throw new ApiError('This report has already been submitted.', 'conflict')
  r.sections.declaration = declaration
  r.sectionComplete.declaration = true
  const resubmission = r.versions.length > 0
  r.status = resubmission ? 'resubmitted' : 'submitted'
  r.approverId = user.id
  r.versions.push({
    version: r.versions.length + 1,
    submittedAt: now(),
    submittedById: user.id,
    sections: structuredClone(r.sections),
    indicators: structuredClone(r.indicators),
  })
  r.updatedAt = now()
  const company = db.companies.find((c) => c.id === r.companyId)
  notify({
    userId: 'u-admin',
    category: 'report',
    title: `${company?.name} ${resubmission ? 'resubmitted' : 'submitted'} its ${year} report`,
    body: `Version ${r.versions.length} is ready for review.`,
    link: `/admin/reporting/companies/${r.companyId}`,
    critical: false,
  })
  audit(
    resubmission ? 'Report resubmitted' : 'Report submitted',
    `${company?.name} · ${year}`,
    `v${r.versions.length}`,
  )
  commit()
  return out(r)
}

export async function togglePublicSummary(year: number, approved: boolean) {
  await delay(200)
  const user = requireCapability('reports.submit')
  const r = findOr404(
    db.reports,
    (x) => x.companyId === user.companyId && x.year === year,
    'Report',
  )
  r.publicSummaryApproved = approved
  commit()
}

/* ---------------------------------------------------------------- UN Women review -- */

export async function getReportForReview(reportId: string) {
  await delay()
  requireCapability('admin.reporting')
  const r = findOr404(db.reports, (x) => x.id === reportId, 'Report')
  return out({
    report: r,
    company: db.companies.find((c) => c.id === r.companyId),
    previous: db.reports.find((x) => x.companyId === r.companyId && x.year === r.year - 1) ?? null,
  })
}

export async function startReportReview(reportId: string) {
  await delay(200)
  requireCapability('admin.manage')
  const r = findOr404(db.reports, (x) => x.id === reportId, 'Report')
  if (r.status === 'submitted' || r.status === 'resubmitted') {
    r.status = 'under_review'
    commit()
  }
  return out(r)
}

export async function requestReportChanges(
  reportId: string,
  requests: { section: ReportSectionKey; note: string }[],
) {
  await delay(400)
  requireCapability('admin.manage')
  if (!requests.length) throw new ApiError('Choose at least one section and describe the change.')
  const r = findOr404(db.reports, (x) => x.id === reportId, 'Report')
  r.status = 'changes_requested'
  r.reviewedAt = now()
  for (const q of requests) {
    r.changeRequests.push({ at: now(), section: q.section, note: q.note, resolved: false })
    r.sectionComplete[q.section] = false
  }
  const company = db.companies.find((c) => c.id === r.companyId)
  for (const id of new Set(
    [r.preparerId, company?.ceoId, company?.focalPointId].filter(Boolean) as string[],
  )) {
    notify({
      userId: id,
      category: 'report',
      title: `Changes requested on your ${r.year} report`,
      body: requests.map((q) => q.note).join(' '),
      link: `/portal/reports/${r.year}`,
      critical: true,
    })
  }
  audit(
    'Report changes requested',
    `${company?.name} · ${r.year}`,
    requests.map((q) => q.section).join(', '),
  )
  commit()
  return out(r)
}

export async function acceptReport(reportId: string) {
  await delay(400)
  requireCapability('admin.manage')
  const r = findOr404(db.reports, (x) => x.id === reportId, 'Report')
  r.status = 'accepted'
  r.reviewedAt = now()
  const company = db.companies.find((c) => c.id === r.companyId)
  if (company?.ceoId)
    notify({
      userId: company.ceoId,
      category: 'report',
      title: `${r.year} report accepted`,
      body: 'Thank you. You can now approve a public summary.',
      link: `/portal/reports/${r.year}`,
      critical: false,
    })
  audit('Report accepted', `${company?.name} · ${r.year}`)
  commit()
  return out(r)
}

export async function getMyReportTasks() {
  await delay()
  const user = requireUser()
  return out(
    db.reports.filter(
      (r) => r.companyId === user.companyId && r.year === db.settings.reportingYear,
    ),
  )
}
