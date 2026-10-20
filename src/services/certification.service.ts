// Proposed paid company certifications (brief §17). A certificate is issued only when payment
// is confirmed AND the exam is passed. Simulated Stripe checkout; no real charges.

import type { CertificationOffering, CertificationPurchase, QuizQuestion } from '@shared/types'
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

const offeringOf = (id: string) => db.offerings.find((o) => o.id === id)

const ensurePurchase = (companyId: string, offeringId: string): CertificationPurchase => {
  let p = db.purchases.find(
    (x) => x.companyId === companyId && x.offeringId === offeringId && x.status !== 'refunded',
  )
  if (!p) {
    p = {
      id: newId('cp'),
      companyId,
      offeringId,
      status: 'unpaid',
      amount: offeringOf(offeringId)?.price ?? 0,
      attempts: [],
      history: [],
    }
    db.purchases.push(p)
  }
  return p
}

export async function getCertifications() {
  await delay()
  const user = requireCapability('certification.view')
  const companyId = user.companyId as string
  return out({
    canPurchase: user.role === 'ceo' || user.permissions.includes('purchase_certifications'),
    // Published offerings, plus archived ones this company already bought.
    offerings: db.offerings
      .map((o) => ({ offering: o, purchase: ensurePurchaseView(companyId, o.id) }))
      .filter(
        (r) =>
          r.offering.status === 'published' || (r.offering.status === 'archived' && r.purchase),
      ),
  })
}

const ensurePurchaseView = (companyId: string, offeringId: string) =>
  db.purchases.find(
    (x) => x.companyId === companyId && x.offeringId === offeringId && x.status !== 'refunded',
  ) ?? null

export async function getPurchase(purchaseId: string) {
  await delay()
  const user = requireCapability('certification.view')
  const p = findOr404(
    db.purchases,
    (x) => x.id === purchaseId && x.companyId === user.companyId,
    'Purchase',
  )
  return out({
    purchase: p,
    offering: offeringOf(p.offeringId),
    company: db.companies.find((c) => c.id === p.companyId),
  })
}

export async function startCheckout(offeringId: string) {
  await delay(300)
  const user = requireCapability('certification.purchase')
  if (offeringOf(offeringId)?.status !== 'published')
    throw new ApiError('This certification is not available for purchase.', 'conflict')
  const p = ensurePurchase(user.companyId as string, offeringId)
  if (
    ['paid', 'exam_in_progress', 'retry_required', 'passed', 'certificate_issued'].includes(
      p.status,
    )
  ) {
    throw new ApiError('This certification is already paid.', 'conflict')
  }
  commit()
  return out(p)
}

/** Simulated payment confirmation webhook, protected against duplicate events. */
export async function completeCheckout(
  purchaseId: string,
  outcome: 'success' | 'cancelled' | 'failed',
) {
  await delay(outcome === 'success' ? 1400 : 700)
  const user = requireCapability('certification.purchase')
  const p = findOr404(
    db.purchases,
    (x) => x.id === purchaseId && x.companyId === user.companyId,
    'Purchase',
  )
  if (p.status === 'paid' || p.status === 'certificate_issued') return out(p) // duplicate event
  const offering = offeringOf(p.offeringId)
  if (outcome === 'success') {
    p.status = 'paid'
    p.paidAt = now()
    p.purchasedById = user.id
    p.paymentRef = `DEMO-PI-${Math.floor(10000 + Math.random() * 89999)}`
    p.history.push(
      { at: now(), label: 'Payment confirmed (demo)' },
      { at: now(), label: 'Exam available' },
    )
    notify({
      userId: user.id,
      category: 'certification',
      title: 'Payment confirmed: exam available',
      body: `${offering?.title} exam is ready.`,
      link: `/portal/certification/exam/${p.id}`,
      critical: false,
    })
    audit('Certification purchased (demo)', offering?.title ?? p.offeringId, `USD ${p.amount}`)
  } else {
    p.status = outcome === 'cancelled' ? 'checkout_cancelled' : 'payment_failed'
    p.history.push({
      at: now(),
      label: outcome === 'cancelled' ? 'Checkout cancelled' : 'Payment failed (demo card declined)',
    })
  }
  commit()
  return out(p)
}

export async function getExam(purchaseId: string) {
  await delay()
  const user = requireCapability('certification.exam')
  const p = findOr404(
    db.purchases,
    (x) => x.id === purchaseId && x.companyId === user.companyId,
    'Purchase',
  )
  if (!['paid', 'exam_in_progress', 'retry_required'].includes(p.status))
    throw new ApiError('The exam unlocks after payment is confirmed.', 'forbidden')
  const questions = db.certExams[p.offeringId] ?? []
  return out({
    purchase: p,
    offering: offeringOf(p.offeringId),
    questions: questions.map(({ correctIndex: _c, explanation: _e, ...q }) => q),
    savedAnswers: p.examAnswers ?? {},
    passMark: offeringOf(p.offeringId)?.passMark ?? 80,
  })
}

export async function saveExamProgress(purchaseId: string, answers: Record<string, number>) {
  await delay(150)
  const user = requireCapability('certification.exam')
  const p = findOr404(
    db.purchases,
    (x) => x.id === purchaseId && x.companyId === user.companyId,
    'Purchase',
  )
  p.examAnswers = answers
  if (p.status === 'paid' || p.status === 'retry_required') p.status = 'exam_in_progress'
  commit()
}

export async function submitExam(purchaseId: string, answers: Record<string, number>) {
  await delay(900)
  const user = requireCapability('certification.exam')
  const p = findOr404(
    db.purchases,
    (x) => x.id === purchaseId && x.companyId === user.companyId,
    'Purchase',
  )
  if (!p.paidAt)
    throw new ApiError('Payment must be confirmed before a certificate can be issued.', 'forbidden')
  const questions = db.certExams[p.offeringId] ?? []
  const passMark = offeringOf(p.offeringId)?.passMark ?? 80
  const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length
  const score = Math.round((correct / Math.max(1, questions.length)) * 100)
  const passed = score >= passMark
  p.attempts.push({ at: now(), score, byId: user.id })
  p.examAnswers = undefined
  p.history.push({
    at: now(),
    label: `Exam submitted: ${score}% (${passed ? 'passed' : 'retry required'})`,
  })
  if (passed) {
    p.status = 'certificate_issued'
    p.credentialRef = `WEPS-DEMO-CERT-2026-${String(db.purchases.filter((x) => x.credentialRef).length + 13).padStart(4, '0')}`
    p.issuedAt = now()
    p.history.push({ at: now(), label: 'Sample certificate issued' })
  } else {
    p.status = 'retry_required'
  }
  notify({
    userId: user.id,
    category: 'certification',
    title: passed ? 'Certificate issued' : 'Exam not passed yet',
    body: `You scored ${score}%. The pass mark is ${passMark}%.`,
    link: passed
      ? `/portal/certification/credential/${p.id}`
      : `/portal/certification/exam/${p.id}`,
    critical: false,
  })
  commit()
  return out({
    purchase: p,
    score,
    correct,
    total: questions.length,
    passed,
    passMark,
  })
}

export async function listAllPurchases() {
  await delay()
  requireCapability('admin.reporting')
  return out(
    db.purchases.map((p) => ({
      purchase: p,
      offering: offeringOf(p.offeringId),
      company: db.companies.find((c) => c.id === p.companyId),
    })),
  )
}

/* ------------------------------------------------------------ admin: offerings -- */

/** Every offering, including drafts, with its purchase counts. */
export async function listAdminOfferings() {
  await delay()
  requireCapability('admin.manage')
  return out(
    db.offerings.map((o) => {
      const list = db.purchases.filter((p) => p.offeringId === o.id)
      return {
        offering: o,
        purchases: list.filter((p) => p.paidAt && p.status !== 'refunded').length,
        issued: list.filter((p) => p.status === 'certificate_issued').length,
      }
    }),
  )
}

export async function getAdminOffering(id: string) {
  await delay()
  requireCapability('admin.manage')
  const offering = findOr404(db.offerings, (o) => o.id === id, 'Certification')
  const list = db.purchases.filter((p) => p.offeringId === id)
  const paid = list.filter((p) => p.paidAt && p.status !== 'refunded')
  return out({
    offering,
    questions: db.certExams[id] ?? [],
    stats: {
      purchases: paid.length,
      revenue: paid.reduce((n, p) => n + p.amount, 0),
      attempts: list.reduce((n, p) => n + p.attempts.length, 0),
      issued: list.filter((p) => p.status === 'certificate_issued').length,
    },
  })
}

/** Problems that stop an offering being published. */
export function offeringProblems(o: CertificationOffering, questions: QuizQuestion[]) {
  const e: string[] = []
  if (!o.title.trim()) e.push('Title is required.')
  if (o.status !== 'published') return e
  if (!o.focus.trim()) e.push('Add a short summary to publish.')
  if (o.scope.filter((s) => s.trim()).length === 0) e.push('Add at least one topic to publish.')
  if (!(o.price > 0)) e.push('Set a price above zero to publish.')
  if (!(o.passMark > 0 && o.passMark <= 100)) e.push('The pass mark must be between 1 and 100.')
  if (questions.length < 3) e.push('Add at least 3 exam questions to publish.')
  return e
}

export async function saveOffering(offering: CertificationOffering, questions: QuizQuestion[]) {
  await delay(300)
  requireCapability('admin.manage')
  const problems = offeringProblems(offering, questions)
  if (problems.length) throw new ApiError(problems[0] as string)
  const prev = offeringOf(offering.id)
  const saved: CertificationOffering = {
    ...offering,
    scope: offering.scope.map((s) => s.trim()).filter(Boolean),
    examQuestions: questions.length,
    updatedAt: now(),
  }
  const i = db.offerings.findIndex((o) => o.id === saved.id)
  if (i >= 0) db.offerings[i] = saved
  else db.offerings.push(saved)
  db.certExams[saved.id] = questions
  audit(
    prev?.status !== saved.status
      ? `Certification ${saved.status === 'draft' ? 'saved as draft' : saved.status}`
      : 'Certification updated',
    saved.title,
  )
  commit()
  return out(saved)
}

/** Only an offering nobody has bought can be deleted; otherwise archive it. */
export async function deleteOffering(id: string) {
  await delay(300)
  requireCapability('admin.manage')
  const o = findOr404(db.offerings, (x) => x.id === id, 'Certification')
  if (db.purchases.some((p) => p.offeringId === id && p.status !== 'unpaid'))
    throw new ApiError('Companies have bought this certification. Archive it instead.')
  db.offerings = db.offerings.filter((x) => x.id !== id)
  db.purchases = db.purchases.filter((p) => p.offeringId !== id)
  delete db.certExams[id]
  audit('Certification deleted', o.title)
  commit()
  return out({ id })
}

export async function getCredential(purchaseId: string) {
  await delay()
  requireUser()
  const p = findOr404(db.purchases, (x) => x.id === purchaseId, 'Credential')
  if (p.status !== 'certificate_issued')
    throw new ApiError('No credential has been issued for this purchase.', 'not_found')
  return out({
    purchase: p,
    offering: offeringOf(p.offeringId),
    company: db.companies.find((c) => c.id === p.companyId),
  })
}
