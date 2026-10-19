// Proposed paid company certifications (brief §17). A certificate is issued only when payment
// is confirmed AND the exam is passed. Simulated Stripe checkout; no real charges.

import { DEMO_RULES } from '@shared/rules'
import type { CertificationPurchase } from '@shared/types'
import { certificationExams, certificationOfferings } from '@/mocks/seed/certifications'
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
      amount: DEMO_RULES.certificationPrice,
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
    offerings: certificationOfferings.map((o) => ({
      offering: o,
      purchase: ensurePurchaseView(companyId, o.id),
    })),
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
    offering: certificationOfferings.find((o) => o.id === p.offeringId),
    company: db.companies.find((c) => c.id === p.companyId),
  })
}

export async function startCheckout(offeringId: string) {
  await delay(300)
  const user = requireCapability('certification.purchase')
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
  const offering = certificationOfferings.find((o) => o.id === p.offeringId)
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
  const questions = certificationExams[p.offeringId] ?? []
  return out({
    purchase: p,
    offering: certificationOfferings.find((o) => o.id === p.offeringId),
    questions: questions.map(({ correctIndex: _c, explanation: _e, ...q }) => q),
    savedAnswers: p.examAnswers ?? {},
    passMark: DEMO_RULES.certificationPassMark,
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
  const questions = certificationExams[p.offeringId] ?? []
  const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length
  const score = Math.round((correct / Math.max(1, questions.length)) * 100)
  const passed = score >= DEMO_RULES.certificationPassMark
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
    body: `You scored ${score}%. The pass mark is ${DEMO_RULES.certificationPassMark}%.`,
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
    passMark: DEMO_RULES.certificationPassMark,
  })
}

export async function listAllPurchases() {
  await delay()
  requireCapability('admin.reporting')
  return out(
    db.purchases.map((p) => ({
      purchase: p,
      offering: certificationOfferings.find((o) => o.id === p.offeringId),
      company: db.companies.find((c) => c.id === p.companyId),
    })),
  )
}

export const OFFERINGS = certificationOfferings

export async function getCredential(purchaseId: string) {
  await delay()
  requireUser()
  const p = findOr404(db.purchases, (x) => x.id === purchaseId, 'Credential')
  if (p.status !== 'certificate_issued')
    throw new ApiError('No credential has been issued for this purchase.', 'not_found')
  return out({
    purchase: p,
    offering: certificationOfferings.find((o) => o.id === p.offeringId),
    company: db.companies.find((c) => c.id === p.companyId),
  })
}
