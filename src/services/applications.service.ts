// Join application and review workflow (brief §6–7):
// Draft > Submitted > Under Review > Information Requested > Resubmitted > Approved | Not Approved.
// Approval activates the company workspace. Payment is never a condition of applying.

import { ALL_PERMISSIONS } from '@shared/reference'
import type {
  Application,
  ApplicationData,
  ApplicationDocument,
  Company,
  UploadState,
  User,
} from '@shared/types'
import { emptyApplicationData } from '@/mocks/seed/applications'
import {
  ApiError,
  audit,
  commit,
  currentUser,
  db,
  delay,
  findOr404,
  newId,
  notify,
  now,
  out,
  requireCapability,
} from './api'

const MAX_PORTRAIT_KB = 8 * 1024
const ALLOWED: Record<ApplicationDocument['kind'], string[]> = {
  ceo_statement: ['pdf'],
  registration: ['pdf', 'jpg', 'jpeg', 'png'],
  ceo_portrait: ['jpg', 'jpeg', 'png'],
}

/** Validates a (simulated) upload and returns its state for inline feedback. */
export function validateUpload(
  kind: ApplicationDocument['kind'],
  fileName: string,
  sizeKb: number,
): UploadState {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED[kind].includes(ext)) return 'wrong_type'
  if (kind === 'ceo_portrait' && sizeKb > MAX_PORTRAIT_KB) return 'too_large'
  if (sizeKb > 20 * 1024) return 'too_large'
  return 'valid'
}

export async function getJoinDraft() {
  await delay(150)
  return out(db.joinDraft ?? { data: emptyApplicationData(), step: 1, documents: [], savedAt: '' })
}

export async function saveJoinDraft(
  data: ApplicationData,
  step: number,
  documents: ApplicationDocument[],
) {
  await delay(200)
  db.joinDraft = { data, step, documents, savedAt: now() }
  commit()
  return out(db.joinDraft)
}

export async function discardJoinDraft() {
  await delay(100)
  db.joinDraft = null
  commit()
}

export interface ReviewIssue {
  step: number
  field: string
  message: string
}

/** Required-field and document checks used by the Review step. */
export function checkApplication(
  data: ApplicationData,
  documents: ApplicationDocument[],
): ReviewIssue[] {
  const issues: ReviewIssue[] = []
  const req = (step: number, field: string, value: string | undefined, label: string) => {
    if (!value?.trim()) issues.push({ step, field, message: `${label} is required` })
  }
  req(1, 'company.name', data.company.name, 'Company name')
  req(1, 'company.sector', data.company.sector, 'Sector')
  req(1, 'company.country', data.company.country, 'Country')
  req(1, 'company.employeeCount', data.company.employeeCount, 'Number of employees')
  req(2, 'presence.legallyRegistered', data.presence.legallyRegistered, 'Legal registration status')
  req(3, 'executive.firstName', data.executive.firstName, 'CEO first name')
  req(3, 'executive.lastName', data.executive.lastName, 'CEO last name')
  req(3, 'executive.email', data.executive.email, 'CEO email')
  req(4, 'contacts.primary.email', data.contacts.primary.email, 'Primary contact email')
  req(5, 'genderBalance.employees', data.genderBalance.employees, 'Women among employees')
  req(6, 'plans.hasGenderActionPlan', data.plans.hasGenderActionPlan, 'Gender Action Plan status')
  const emailOk = (e: string) => !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  if (!emailOk(data.executive.email))
    issues.push({ step: 3, field: 'executive.email', message: 'CEO email address is not valid' })
  if (!emailOk(data.contacts.primary.email))
    issues.push({
      step: 4,
      field: 'contacts.primary.email',
      message: 'Primary contact email is not valid',
    })
  for (const kind of ['ceo_statement', 'registration', 'ceo_portrait'] as const) {
    if (!documents.some((d) => d.kind === kind)) {
      issues.push({
        step: kind === 'registration' ? 2 : 3,
        field: kind,
        message: {
          ceo_statement: 'Signed CEO statement (PDF) is missing',
          registration: 'Legal registration document is missing',
          ceo_portrait: 'CEO portrait is missing',
        }[kind],
      })
    }
  }
  return issues
}

const nextRef = () => `WEPS-2026-${String(440 + db.applications.length).padStart(4, '0')}`

export async function submitApplication() {
  await delay(700)
  const draft = db.joinDraft
  if (!draft) throw new ApiError('Nothing to submit yet.')
  const issues = checkApplication(draft.data, draft.documents)
  if (issues.length)
    throw new ApiError(`Please complete ${issues.length} item(s) before submitting.`)

  const duplicate = db.companies.find(
    (c) => c.name.trim().toLowerCase() === draft.data.company.name.trim().toLowerCase(),
  )
  const companyId = duplicate?.id ?? newId('c')
  if (!duplicate) {
    const c: Company = {
      id: companyId,
      name: draft.data.company.name,
      country: draft.data.company.country,
      region: draft.data.company.region,
      sector: draft.data.company.sector,
      size: '250-999',
      employeeCount: Number(draft.data.company.employeeCount) || 0,
      ownership: (draft.data.company.ownership || 'private') as Company['ownership'],
      ownerGender: (draft.data.company.ownerGender || undefined) as Company['ownerGender'],
      website: draft.data.company.website,
      ungcMember: draft.data.company.ungcMember === 'yes',
      signatoryStatus: 'applicant',
      summary: '',
      priorities: [],
      priorityPrinciples: [],
      publicProfileApproved: false,
      genderBalance: {
        employees: Number(draft.data.genderBalance.employees) || 0,
        management: Number(draft.data.genderBalance.management) || 0,
        board: Number(draft.data.genderBalance.board) || 0,
      },
    }
    db.companies.push(c)
  }
  const at = now()
  const app: Application = {
    id: newId('app'),
    reference: nextRef(),
    status: 'submitted',
    companyId: duplicate ? undefined : companyId,
    applicantEmail: draft.data.executive.email,
    data: draft.data,
    documents: draft.documents,
    currentStep: 8,
    createdAt: draft.savedAt || at,
    submittedAt: at,
    infoRequests: [],
    timeline: [
      {
        id: newId('t'),
        at: draft.savedAt || at,
        actor: `${draft.data.executive.firstName} ${draft.data.executive.lastName}`,
        label: 'Draft started',
      },
      {
        id: newId('t'),
        at,
        actor: `${draft.data.executive.firstName} ${draft.data.executive.lastName}`,
        label: 'Application submitted',
      },
    ],
    reviewNotes: [],
    duplicateOfCompanyId: duplicate?.id,
  }
  db.applications.unshift(app)
  db.joinDraft = null
  notify({
    userId: 'u-admin',
    category: 'application',
    title: 'New application submitted',
    body: `${app.data.company.name} (${app.reference}) is ready for review.`,
    link: `/admin/manage/applications/${app.id}`,
    critical: false,
  })
  audit('Application submitted', `${app.data.company.name} · ${app.reference}`)
  commit()
  return out(app)
}

/** The application the visitor submitted (this browser), or the signed-in applicant's. */
/** The signed-in applicant's own pending application. Visitors look theirs up by reference. */
export async function getMyApplication(): Promise<Application | null> {
  await delay()
  const user = currentUser()
  const byUser = user?.companyId
    ? db.applications.find((a) => a.companyId === user.companyId && a.status !== 'approved')
    : undefined
  return out(byUser ?? null)
}

export async function findApplicationByReference(reference: string) {
  await delay(300)
  const app = db.applications.find(
    (a) => a.reference.toLowerCase() === reference.trim().toLowerCase(),
  )
  if (!app) throw new ApiError('No application found with that reference.', 'not_found')
  return out(app)
}

/** Replace a requested document (keeping the previous version) and resubmit. */
export async function resubmitApplication(
  applicationId: string,
  replacement?: { kind: ApplicationDocument['kind']; fileName: string; sizeKb: number },
  note?: string,
) {
  await delay(600)
  const app = findOr404(db.applications, (a) => a.id === applicationId, 'Application')
  if (app.status !== 'information_requested')
    throw new ApiError('This application is not waiting for information.', 'conflict')
  if (replacement) {
    const state = validateUpload(replacement.kind, replacement.fileName, replacement.sizeKb)
    if (state !== 'valid')
      throw new ApiError(
        state === 'wrong_type' ? 'That file type is not accepted.' : 'That file is too large.',
      )
    const doc = app.documents.find((d) => d.kind === replacement.kind)
    if (doc) {
      doc.previous = [
        ...(doc.previous ?? []),
        { fileName: doc.fileName, uploadedAt: doc.uploadedAt, version: doc.version },
      ]
      Object.assign(doc, {
        fileName: replacement.fileName,
        sizeKb: replacement.sizeKb,
        uploadedAt: now(),
        version: doc.version + 1,
      })
    } else {
      app.documents.push({
        id: newId('doc'),
        kind: replacement.kind,
        fileName: replacement.fileName,
        sizeKb: replacement.sizeKb,
        uploadedAt: now(),
        version: 1,
      })
    }
  }
  const open = app.infoRequests.find((r) => !r.resolvedAt)
  if (open) open.resolvedAt = now()
  app.status = 'resubmitted'
  app.timeline.push({
    id: newId('t'),
    at: now(),
    actor: `${app.data.executive.firstName} ${app.data.executive.lastName}`,
    label: 'Information provided and resubmitted',
    note,
  })
  const company = db.companies.find((c) => c.id === app.companyId)
  if (company) company.signatoryStatus = 'under_review'
  notify({
    userId: 'u-admin',
    category: 'application',
    title: 'Application resubmitted',
    body: `${app.data.company.name} provided the requested information.`,
    link: `/admin/manage/applications/${app.id}`,
    critical: false,
  })
  commit()
  return out(app)
}

/* ---------------------------------------------------------------- admin review -- */

export async function listApplications() {
  await delay()
  requireCapability('admin.manage')
  return out(
    db.applications
      .slice()
      .sort((a, b) => (b.submittedAt ?? '').localeCompare(a.submittedAt ?? '')),
  )
}

export async function getApplication(applicationId: string) {
  await delay()
  const app = findOr404(db.applications, (a) => a.id === applicationId, 'Application')
  return out({
    application: app,
    duplicate: app.duplicateOfCompanyId
      ? db.companies.find((c) => c.id === app.duplicateOfCompanyId)
      : undefined,
  })
}

export async function startReview(applicationId: string) {
  await delay(250)
  const admin = requireCapability('admin.manage')
  const app = findOr404(db.applications, (a) => a.id === applicationId, 'Application')
  if (app.status === 'submitted' || app.status === 'resubmitted') {
    app.status = 'under_review'
    app.timeline.push({
      id: newId('t'),
      at: now(),
      actor: `${admin.firstName} ${admin.lastName}`,
      label: 'Review started',
    })
    const company = db.companies.find((c) => c.id === app.companyId)
    if (company) company.signatoryStatus = 'under_review'
    commit()
  }
  return out(app)
}

export async function requestInformation(
  applicationId: string,
  input: { item: string; message: string; dueDate?: string },
) {
  await delay(400)
  const admin = requireCapability('admin.manage')
  const app = findOr404(db.applications, (a) => a.id === applicationId, 'Application')
  if (!input.item.trim() || !input.message.trim())
    throw new ApiError('Name the missing item and add a message.')
  app.status = 'information_requested'
  app.infoRequests.push({ ...input, requestedAt: now(), requestedById: admin.id })
  app.timeline.push({
    id: newId('t'),
    at: now(),
    actor: `${admin.firstName} ${admin.lastName}`,
    label: 'Additional information requested',
    note: input.item,
  })
  const company = db.companies.find((c) => c.id === app.companyId)
  if (company) company.signatoryStatus = 'information_requested'
  const applicant = db.users.find((u) => u.email === app.applicantEmail)
  if (applicant) {
    notify({
      userId: applicant.id,
      category: 'application',
      title: 'Information requested',
      body: input.item,
      link: `/application-status?ref=${app.reference}`,
      critical: true,
    })
  }
  audit('Information requested', `${app.data.company.name} · ${app.reference}`, input.item)
  commit()
  return out({
    application: app,
    emailPreview: {
      to: app.applicantEmail,
      subject: `Action needed on your WEPs application ${app.reference}`,
      body: [
        `Dear ${app.data.executive.firstName},`,
        input.message,
        input.dueDate ? `Please respond by ${new Date(input.dueDate).toDateString()}.` : '',
        'You can update your application from the status page. Everything you submitted is saved.',
      ].filter(Boolean),
    },
  })
}

export async function approveApplication(applicationId: string) {
  await delay(600)
  const admin = requireCapability('admin.manage')
  const app = findOr404(db.applications, (a) => a.id === applicationId, 'Application')
  if (app.duplicateOfCompanyId)
    throw new ApiError('Resolve the possible duplicate company before approving.', 'conflict')
  app.status = 'approved'
  app.decidedAt = now()
  app.timeline.push({
    id: newId('t'),
    at: now(),
    actor: `${admin.firstName} ${admin.lastName}`,
    label: 'Approved and workspace activated',
  })
  const company = findOr404(db.companies, (c) => c.id === app.companyId, 'Company')
  company.signatoryStatus = 'approved'
  company.memberSince = now()
  company.publicProfileApproved = true
  company.lastActivityAt = now()
  // Create or activate the CEO account so the company can sign in.
  let ceo = db.users.find((u) => u.email.toLowerCase() === app.data.executive.email.toLowerCase())
  if (!ceo) {
    ceo = {
      id: newId('u'),
      firstName: app.data.executive.firstName,
      lastName: app.data.executive.lastName,
      email: app.data.executive.email,
      title: app.data.executive.title || 'Chief Executive Officer',
      role: 'ceo',
      companyId: company.id,
      department: 'leadership',
      permissions: ALL_PERMISSIONS,
      invitationStatus: 'accepted',
      activatedAt: now(),
      profileComplete: false,
      timezone: 'Asia/Dubai',
    } satisfies User
    db.users.push(ceo)
  }
  company.ceoId = ceo.id
  notify({
    userId: ceo.id,
    category: 'application',
    title: `Welcome to the WEPs portal, ${company.name}`,
    body: 'Your application is approved. Set up your team and choose your priorities.',
    link: '/portal/company/team',
    critical: true,
    emailPreview: {
      subject: 'Your WEPs application is approved',
      to: ceo.email,
      body: [
        `Dear ${ceo.firstName},`,
        `${company.name} is now a WEPs signatory.`,
        'Sign in to set up your team and appoint a WEPs focal point.',
      ],
    },
  })
  audit('Application approved', `${company.name} · ${app.reference}`)
  commit()
  return out({ application: app, company, ceoUserId: ceo.id })
}

export async function rejectApplication(applicationId: string, reason: string) {
  await delay(400)
  const admin = requireCapability('admin.manage')
  if (!reason.trim()) throw new ApiError('A reason is required.')
  const app = findOr404(db.applications, (a) => a.id === applicationId, 'Application')
  app.status = 'not_approved'
  app.decidedAt = now()
  app.decisionReason = reason
  app.timeline.push({
    id: newId('t'),
    at: now(),
    actor: `${admin.firstName} ${admin.lastName}`,
    label: 'Not approved',
    note: reason,
  })
  const company = db.companies.find((c) => c.id === app.companyId)
  if (company) company.signatoryStatus = 'not_approved'
  audit('Application not approved', `${app.data.company.name} · ${app.reference}`, reason)
  commit()
  return out(app)
}

/** Duplicate match resolved as a reviewed claim of the existing record. */
export async function resolveDuplicate(
  applicationId: string,
  action: 'claim_existing' | 'treat_as_new',
) {
  await delay(300)
  requireCapability('admin.manage')
  const app = findOr404(db.applications, (a) => a.id === applicationId, 'Application')
  if (action === 'claim_existing') app.companyId = app.duplicateOfCompanyId
  else if (!app.companyId) {
    const id = newId('c')
    const src = db.companies.find((c) => c.id === app.duplicateOfCompanyId)
    if (src)
      db.companies.push({
        ...structuredClone(src),
        id,
        name: `${app.data.company.name} (${app.data.company.country})`,
        signatoryStatus: 'under_review',
        ceoId: undefined,
        focalPointId: undefined,
      })
    app.companyId = id
  }
  app.duplicateOfCompanyId = undefined
  app.reviewNotes.push({
    at: now(),
    by: 'UN Women',
    note:
      action === 'claim_existing'
        ? 'Reviewed as a claim of the existing company record.'
        : 'Confirmed as a separate company.',
  })
  commit()
  return out(app)
}

export async function addReviewNote(applicationId: string, note: string) {
  await delay(150)
  const admin = requireCapability('admin.manage')
  const app = findOr404(db.applications, (a) => a.id === applicationId, 'Application')
  app.reviewNotes.push({ at: now(), by: `${admin.firstName} ${admin.lastName}`, note })
  commit()
}

/** Admin invites a company CEO into the same application process. */
export async function inviteCompany(input: {
  companyName: string
  ceoName: string
  email: string
}) {
  await delay(400)
  requireCapability('admin.manage')
  audit('Company invited to apply', input.companyName, input.email)
  commit()
  return {
    emailPreview: {
      to: input.email,
      subject: `${input.companyName}: you’re invited to join the WEPs`,
      body: [
        `Dear ${input.ceoName},`,
        'UN Women invites your company to commit to the Women’s Empowerment Principles.',
        'Start your application with the link below. It goes through the same review as every company.',
      ],
    },
  }
}
