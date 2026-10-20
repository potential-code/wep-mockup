import type { CertificationOffering, CertificationPurchase, PurchaseStatus } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Check, CircleDot, ListChecks } from 'lucide-react'
import { motion } from 'motion/react'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface OfferingRow {
  offering: CertificationOffering
  purchase: CertificationPurchase | null
}

export const statusOf = (p: CertificationPurchase | null): PurchaseStatus => p?.status ?? 'unpaid'

/** Notice shown wherever the certifications appear: they are a proposed demo feature. */
export function ProposedNotice() {
  return (
    <aside
      className="flex flex-wrap items-center gap-2 text-sm"
      aria-label="Proposed feature notice"
    >
      <p className="text-muted-foreground">Illustrative certifications. Payments are simulated.</p>
    </aside>
  )
}

const STEPS = [
  'Purchase',
  'Payment confirmed',
  'Exam available',
  'Exam submitted',
  'Passed / Retry',
  'Certificate issued',
]

const DONE_COUNT: Record<PurchaseStatus, number> = {
  unpaid: 0,
  checkout_cancelled: 0,
  payment_failed: 0,
  paid: 3,
  exam_in_progress: 3,
  retry_required: 4,
  passed: 5,
  certificate_issued: 6,
  refunded: 0,
}

export function ProcessTimeline({ status }: { status: PurchaseStatus }) {
  const done = DONE_COUNT[status]
  return (
    <ol className="grid gap-0 sm:grid-cols-6" aria-label="Certification process">
      {STEPS.map((label, i) => {
        const state = i < done ? 'done' : i === done ? 'current' : 'todo'
        const retry = i === 4 && status === 'retry_required'
        return (
          <li
            key={label}
            className="relative flex gap-3 pb-5 sm:grid sm:justify-items-center sm:gap-2 sm:pb-0 sm:text-center"
          >
            <span
              className={cn(
                'relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 bg-card text-xs font-semibold',
                state === 'done' && 'border-success bg-success text-white',
                state === 'current' && 'border-blue text-blue',
                state === 'todo' && 'border-border text-muted-foreground',
                retry && 'border-danger bg-danger-soft text-danger',
              )}
            >
              {state === 'done' ? (
                <Check className="size-4" aria-hidden />
              ) : state === 'current' ? (
                <CircleDot className="size-4" aria-hidden />
              ) : (
                i + 1
              )}
            </span>
            {i < STEPS.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  'absolute start-4 top-8 h-[calc(100%-2rem)] w-0.5 sm:start-1/2 sm:top-4 sm:h-0.5 sm:w-full',
                  i < done - 1 ? 'bg-success' : 'bg-border',
                )}
              />
            ) : null}
            <span
              className={cn(
                'pt-1 text-sm sm:pt-0',
                state === 'todo' ? 'text-muted-foreground' : 'font-medium text-navy',
              )}
            >
              {label}
              <span className="sr-only">
                {state === 'done'
                  ? ' (complete)'
                  : state === 'current'
                    ? ' (current step)'
                    : ' (not started)'}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function OfferingCard({ row, index }: { row: OfferingRow; index: number }) {
  const { offering: o, purchase } = row
  const status = statusOf(purchase)
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.06 }}
      whileHover={{ y: -3 }}
      className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-lift"
    >
      {o.image ? (
        <img src={o.image} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" />
      ) : null}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <WorkflowStatus status={status} />
          <span className="font-heading font-medium text-navy">
            {formatCurrency(o.price, o.currency)}
          </span>
        </div>
        <div className="grid gap-1.5">
          <h2 className="font-heading font-medium text-lg text-navy leading-snug">{o.title}</h2>
          <p className="text-muted-foreground text-sm">{o.focus}</p>
        </div>
        <ul className="grid gap-1.5 text-sm">
          {o.scope.slice(0, 3).map((s) => (
            <li key={s} className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
              <span>{s}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-auto grid gap-1.5 rounded-xl bg-surface p-3 text-sm">
          <div className="flex items-center gap-2">
            <ListChecks className="size-4 text-blue" aria-hidden />
            <dt className="sr-only">Exam</dt>
            <dd>
              {o.examQuestions} questions · {o.passMark}% to pass
            </dd>
          </div>
        </dl>
        <Button asChild variant="outline">
          <Link to="/portal/certification/$offeringId" params={{ offeringId: o.id }}>
            View details <ArrowRight />
          </Link>
        </Button>
      </div>
    </motion.article>
  )
}
