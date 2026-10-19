// Company assessment and action plan (brief §11). The assessment is the illustrative
// "Demo Company Assessment"; it does not reproduce the official Gender Gap Analysis Tool.
// Course completion alone never marks a company action implemented.

import { fullName } from '@shared/permissions'
import type { ActionItem, ActionStatus, Evidence } from '@shared/types'
import { assessmentSections, asteriaAssessment } from '@/mocks/seed/assessment'
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
import { award } from './points.service'

export async function getAssessment() {
  await delay()
  const user = requireCapability('assessment.view')
  const current = db.assessments.find(
    (a) => a.companyId === user.companyId && a.status !== 'archived',
  )
  const archive = db.assessments.filter(
    (a) => a.companyId === user.companyId && a.status === 'archived',
  )
  const questionCount = assessmentSections.reduce((n, s) => n + s.questions.length, 0)
  const answered = current ? Object.keys(current.answers).length : 0
  const owner = db.users.find((u) => u.id === current?.ownerId)
  return out({
    assessment: current ?? null,
    archive,
    sections: assessmentSections,
    completion: Math.round((answered / Math.max(1, questionCount)) * 100),
    ownerName: owner ? fullName(owner) : undefined,
    needs: (current?.needs ?? []).map((n) => ({
      ...n,
      resource: db.resources.find((r) => r.id === n.resourceId),
      course: db.courses.find((c) => c.id === n.courseId),
      event: db.events.find((e) => e.id === n.eventId),
      mentor: db.users.find((u) => u.id === n.mentorId),
      inPlan: db.actions.some((a) => a.needId === n.id),
    })),
  })
}

export async function saveAnswers(answers: Record<string, string>) {
  await delay(200)
  const user = requireCapability('assessment.manage')
  let a = db.assessments.find((x) => x.companyId === user.companyId && x.status !== 'archived')
  if (!a) {
    a = {
      id: newId('asm'),
      companyId: user.companyId as string,
      name: 'Demo Company Assessment',
      period: '2026',
      ownerId: user.id,
      status: 'in_progress',
      answers: {},
      evidence: {},
      updatedAt: now(),
      strengths: [],
      needs: [],
    }
    db.assessments.push(a)
  }
  Object.assign(a.answers, answers)
  a.updatedAt = now()
  if (a.status === 'not_started') a.status = 'in_progress'
  commit()
  return out(a)
}

export async function addAssessmentEvidence(questionId: string, fileName: string) {
  await delay(200)
  const user = requireCapability('assessment.manage')
  const a = findOr404(
    db.assessments,
    (x) => x.companyId === user.companyId && x.status !== 'archived',
    'Assessment',
  )
  a.evidence[questionId] = [...(a.evidence[questionId] ?? []), fileName]
  commit()
}

/**
 * Demo shortcut: fills every unanswered question with Asteria's realistic 2026 answers and
 * attaches the matching sample evidence. Answers already given are kept. Nothing is submitted.
 */
export async function fillSampleAssessment() {
  await delay(400)
  requireCapability('assessment.manage')
  await saveAnswers({})
  const user = requireUser()
  const a = findOr404(
    db.assessments,
    (x) => x.companyId === user.companyId && x.status !== 'archived',
    'Assessment',
  )
  const sample = asteriaAssessment
  for (const [id, value] of Object.entries(sample.answers)) {
    if (!a.answers[id]) a.answers[id] = value
  }
  for (const [id, files] of Object.entries(sample.evidence)) {
    if (!a.evidence[id]?.length) a.evidence[id] = [...files]
  }
  if (a.strengths.length === 0) a.strengths = [...sample.strengths]
  a.updatedAt = now()
  commit()
  return out(a)
}

export async function submitAssessment() {
  await delay(500)
  const user = requireCapability('assessment.manage')
  const a = findOr404(
    db.assessments,
    (x) => x.companyId === user.companyId && x.status !== 'archived',
    'Assessment',
  )
  a.status = 'submitted'
  a.submittedAt = now()
  audit('Assessment submitted', a.name)
  commit()
  return out(a)
}

/** Restart for a new period: archives the current assessment. */
export async function startNewAssessment() {
  await delay(300)
  const user = requireCapability('assessment.manage')
  const current = db.assessments.find(
    (x) => x.companyId === user.companyId && x.status !== 'archived',
  )
  if (current) current.status = 'archived'
  db.assessments.push({
    id: newId('asm'),
    companyId: user.companyId as string,
    name: 'Demo Company Assessment',
    period: '2027',
    ownerId: user.id,
    status: 'in_progress',
    answers: {},
    evidence: {},
    updatedAt: now(),
    strengths: [],
    needs: current?.needs ?? [],
  })
  commit()
}

/* ---------------------------------------------------------------- actions -- */

const decorate = (a: ActionItem) => {
  const owner = db.users.find((u) => u.id === a.ownerId)
  const overdue = a.status !== 'complete' && a.dueDate < now()
  return {
    action: a,
    ownerName: owner ? fullName(owner) : 'Unassigned',
    ownerAvatar: owner?.avatar,
    overdue,
    missingEvidence: a.evidence.length === 0 && a.status !== 'draft',
  }
}

/** Managers see the whole plan; employees see only actions assigned to them. */
export async function listActions() {
  await delay()
  const user = requireUser()
  const all = db.actions.filter((a) => a.companyId === user.companyId)
  const canManage = user.role === 'ceo' || user.permissions.includes('manage_assessment')
  const visible = canManage
    ? all
    : all.filter((a) => a.ownerId === user.id || a.contributorIds.includes(user.id))
  return out({ canManage, actions: visible.map(decorate) })
}

export async function getAction(actionId: string) {
  await delay()
  const user = requireUser()
  const a = findOr404(
    db.actions,
    (x) => x.id === actionId && x.companyId === user.companyId,
    'Action',
  )
  const canManage = user.role === 'ceo' || user.permissions.includes('manage_assessment')
  if (!canManage && a.ownerId !== user.id && !a.contributorIds.includes(user.id))
    throw new ApiError('This action isn’t assigned to you.', 'forbidden')
  return out({
    ...decorate(a),
    canManage,
    courses: db.courses.filter((c) => a.linkedCourseIds.includes(c.id)),
    resources: db.resources.filter((r) => a.linkedResourceIds.includes(r.id)),
    history: a.history.map((h) => ({ ...h, by: db.users.find((u) => u.id === h.byId) })),
  })
}

export async function createAction(
  input: Omit<ActionItem, 'id' | 'companyId' | 'status' | 'evidence' | 'history'> & {
    requestCeoReview?: boolean
  },
) {
  await delay(350)
  const user = requireCapability('actions.manage')
  const { requestCeoReview, ...rest } = input
  const a: ActionItem = {
    ...rest,
    id: newId('act'),
    companyId: user.companyId as string,
    status: requestCeoReview ? 'ceo_review' : 'draft',
    evidence: [],
    history: [
      {
        at: now(),
        byId: user.id,
        label: requestCeoReview ? 'Created and sent for CEO review' : 'Created as draft',
      },
    ],
  }
  db.actions.push(a)
  if (a.ownerId !== user.id) {
    notify({
      userId: a.ownerId,
      category: 'team',
      title: 'New action assigned',
      body: a.title,
      link: `/portal/action-plan/${a.id}`,
      critical: false,
    })
  }
  commit()
  return out(a)
}

const TRANSITIONS: Record<ActionStatus, ActionStatus[]> = {
  draft: ['ceo_review', 'in_progress'],
  ceo_review: ['in_progress', 'needs_revision'],
  in_progress: ['evidence_submitted'],
  evidence_submitted: ['complete', 'needs_revision'],
  needs_revision: ['in_progress', 'evidence_submitted'],
  complete: [],
}

export async function setActionStatus(actionId: string, status: ActionStatus, note?: string) {
  await delay(300)
  const user = requireUser()
  const a = findOr404(
    db.actions,
    (x) => x.id === actionId && x.companyId === user.companyId,
    'Action',
  )
  const canManage = user.role === 'ceo' || user.permissions.includes('manage_assessment')
  const isAssignee = a.ownerId === user.id || a.contributorIds.includes(user.id)
  if (!canManage && !(isAssignee && status === 'evidence_submitted'))
    throw new ApiError('You can’t change this action’s status.', 'forbidden')
  if (a.status === 'ceo_review' && status === 'in_progress' && user.role !== 'ceo')
    throw new ApiError('Only the CEO can approve this action.', 'forbidden')
  if (!TRANSITIONS[a.status].includes(status))
    throw new ApiError(`Can’t move from ${a.status} to ${status}.`, 'conflict')
  if (status === 'complete' && a.evidence.length === 0)
    throw new ApiError('Add evidence before marking this action complete.')
  a.status = status
  a.history.push({
    at: now(),
    byId: user.id,
    label: `Status changed to ${status.replace('_', ' ')}${note ? `: ${note}` : ''}`,
  })
  if (status === 'complete' || status === 'needs_revision') {
    for (const id of new Set([a.ownerId, ...a.contributorIds])) {
      if (id === user.id) continue
      notify({
        userId: id,
        category: 'team',
        title: status === 'complete' ? 'Action accepted' : 'Action needs revision',
        body: a.title,
        link: `/portal/action-plan/${a.id}`,
        critical: false,
      })
      if (status === 'complete')
        award(
          id,
          'action_contribution',
          `action:${a.id}:accepted`,
          `Accepted contribution: ${a.title}`,
          { sourceLink: `/portal/action-plan/${a.id}` },
        )
    }
  }
  commit()
  return out(a)
}

export async function uploadActionEvidence(actionId: string, fileName: string, note?: string) {
  await delay(400)
  const user = requireUser()
  const a = findOr404(
    db.actions,
    (x) => x.id === actionId && x.companyId === user.companyId,
    'Action',
  )
  const canManage = user.role === 'ceo' || user.permissions.includes('manage_assessment')
  if (!canManage && a.ownerId !== user.id && !a.contributorIds.includes(user.id))
    throw new ApiError('This action isn’t assigned to you.', 'forbidden')
  const ev: Evidence = { id: newId('ev'), fileName, uploadedById: user.id, uploadedAt: now(), note }
  a.evidence.push(ev)
  a.history.push({ at: now(), byId: user.id, label: `Evidence uploaded: ${fileName}` })
  if (a.status === 'in_progress' || a.status === 'needs_revision') a.status = 'evidence_submitted'
  const company = db.companies.find((c) => c.id === a.companyId)
  if (company?.focalPointId && company.focalPointId !== user.id) {
    notify({
      userId: company.focalPointId,
      category: 'team',
      title: 'Evidence submitted',
      body: `${fullName(user)} added evidence to “${a.title}”.`,
      link: `/portal/action-plan/${a.id}`,
      critical: false,
    })
  }
  commit()
  return out(a)
}

export async function updateAction(
  actionId: string,
  patch: Partial<
    Pick<
      ActionItem,
      | 'title'
      | 'purpose'
      | 'ownerId'
      | 'department'
      | 'baseline'
      | 'target'
      | 'dueDate'
      | 'evidenceRequired'
      | 'contributorIds'
      | 'linkedCourseIds'
      | 'linkedResourceIds'
    >
  >,
) {
  await delay(250)
  const user = requireCapability('actions.manage')
  const a = findOr404(
    db.actions,
    (x) => x.id === actionId && x.companyId === user.companyId,
    'Action',
  )
  Object.assign(a, patch)
  a.history.push({ at: now(), byId: user.id, label: 'Details updated' })
  commit()
  return out(a)
}

/** Add an assessment need to the plan as a draft action. */
export async function addNeedToPlan(needId: string) {
  await delay(300)
  const user = requireCapability('actions.manage')
  const asm = findOr404(
    db.assessments,
    (x) => x.companyId === user.companyId && x.status !== 'archived',
    'Assessment',
  )
  const need = findOr404(asm.needs, (n) => n.id === needId, 'Need')
  const existing = db.actions.find((a) => a.needId === needId)
  if (existing) return out(existing)
  const owner = db.users.find(
    (u) =>
      u.companyId === user.companyId &&
      u.department === need.department &&
      u.invitationStatus === 'accepted',
  )
  const a: ActionItem = {
    id: newId('act'),
    companyId: user.companyId as string,
    title: need.title,
    purpose: need.description,
    principle: need.principle,
    ownerId: owner?.id ?? user.id,
    department: need.department,
    baseline: 'To be confirmed',
    target: 'To be agreed',
    dueDate: new Date(new Date(now()).getTime() + 120 * 864e5).toISOString(),
    status: 'draft',
    evidenceRequired: 'To be agreed',
    evidence: [],
    contributorIds: owner ? [owner.id] : [],
    linkedCourseIds: need.courseId ? [need.courseId] : [],
    linkedResourceIds: need.resourceId ? [need.resourceId] : [],
    needId,
    history: [{ at: now(), byId: user.id, label: 'Created from assessment need' }],
  }
  db.actions.push(a)
  commit()
  return out(a)
}
