import { Link, useNavigate, useParams } from '@tanstack/react-router'
import {
  Award,
  Check,
  CreditCard,
  FileBadge2,
  Loader2,
  PlayCircle,
  ShieldAlert,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/shared/States'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { useCertifications, useStartCheckout } from '@/queries/certification.queries'
import { ProcessTimeline, ProposedNotice, statusOf } from '../components/cert-shared'

export function OfferingDetailPage() {
  const { offeringId } = useParams({ from: '/_app/portal/certification/$offeringId' })
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useCertifications()
  const start = useStartCheckout()

  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />
  const row = data?.offerings.find((r) => r.offering.id === offeringId)
  if (!data || !row)
    return (
      <EmptyState
        title="Certification not found"
        action={
          <Button asChild variant="outline">
            <Link to="/portal/certification">Back to certifications</Link>
          </Button>
        }
      />
    )
  const { offering: o, purchase } = row
  const status = statusOf(purchase)
  const canPay = ['unpaid', 'checkout_cancelled', 'payment_failed'].includes(status)
  const canExam = ['paid', 'exam_in_progress', 'retry_required'].includes(status)

  const buy = async () => {
    const p = await start.mutateAsync(o.id)
    navigate({ to: '/portal/certification/checkout/$purchaseId', params: { purchaseId: p.id } })
  }

  let action: React.ReactNode = null
  if (status === 'certificate_issued' && purchase) {
    action = (
      <Button asChild size="lg">
        <Link
          to="/portal/certification/credential/$purchaseId"
          params={{ purchaseId: purchase.id }}
        >
          <FileBadge2 /> View credential
        </Link>
      </Button>
    )
  } else if (canExam && purchase && data.canPurchase) {
    action = (
      <Button asChild size="lg">
        <Link to="/portal/certification/exam/$purchaseId" params={{ purchaseId: purchase.id }}>
          <PlayCircle />{' '}
          {status === 'exam_in_progress'
            ? 'Continue exam'
            : status === 'retry_required'
              ? 'Retry exam'
              : 'Start exam'}
        </Link>
      </Button>
    )
  } else if (canPay && data.canPurchase) {
    action = (
      <Button size="lg" onClick={buy} disabled={start.isPending}>
        {start.isPending ? <Loader2 className="animate-spin" /> : <CreditCard />}
        {start.isPending
          ? 'Preparing checkout…'
          : status === 'unpaid'
            ? 'Purchase for company'
            : 'Try payment again'}
      </Button>
    )
  } else if (!data.canPurchase) {
    action = (
      <p className="flex items-start gap-2 rounded-xl border bg-surface p-3 text-sm">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
        Read-only view. Only the CEO or an admin with purchasing authority can pay for or sit this
        company exam.
      </p>
    )
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        breadcrumbs={[{ label: 'Certification', to: '/portal/certification' }, { label: o.title }]}
        title={o.title}
        description={o.focus}
        actions={<WorkflowStatus status={status} />}
      />
      <ProposedNotice />
      <SectionCard title="How it works" description="Both payment and a passed exam are needed.">
        <ProcessTimeline status={status} />
        <p className="mt-5 rounded-xl bg-blue-50 p-3 text-navy text-sm">
          Payment alone never issues a certificate, and a passed exam without confirmed payment
          doesn’t either. The sample certificate is issued only when both are complete.
        </p>
      </SectionCard>
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          <SectionCard title="What it covers">
            {o.image ? (
              <img
                src={o.image}
                alt=""
                className="mb-4 aspect-[21/9] w-full rounded-xl object-cover"
              />
            ) : null}
            <ul className="grid gap-2">
              {o.scope.map((s) => (
                <li key={s} className="flex gap-2">
                  <Check className="mt-1 size-4 shrink-0 text-blue" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-muted-foreground text-sm">
              Exam: {o.examQuestions} questions, {o.passMark}% to pass. Retake limits and marking
              methodology are configurable decisions still to be confirmed.
            </p>
          </SectionCard>
          <SectionCard title="Purchase history">
            {purchase && purchase.history.length > 0 ? (
              <ol className="grid gap-3 border-s ps-4">
                {purchase.history.map((h) => (
                  <li key={`${h.at}-${h.label}`} className="relative text-sm">
                    <span
                      className="absolute -start-[1.3rem] top-1.5 size-2 rounded-full bg-blue"
                      aria-hidden
                    />
                    <p className="font-medium text-navy">{h.label}</p>
                    <p className="text-muted-foreground text-xs">{formatDateTime(h.at)}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-muted-foreground text-sm">
                No activity yet for this certification.
              </p>
            )}
          </SectionCard>
        </div>
        <SectionCard title="Price" className="lg:sticky lg:top-4">
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <dt>Certification fee</dt>
              <dd>{formatCurrency(o.price, o.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Other charges</dt>
              <dd>None</dd>
            </div>
            <div className="flex justify-between border-t pt-2 font-heading font-semibold text-base text-navy">
              <dt>Total</dt>
              <dd>{formatCurrency(o.price, o.currency)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-muted-foreground text-xs">Demo payment: no real charge.</p>
          <div className="mt-4 grid gap-3">{action}</div>
          {purchase?.paymentRef ? (
            <p className="mt-3 flex items-center gap-1.5 text-muted-foreground text-xs">
              <Award className="size-3.5" aria-hidden /> Payment ref {purchase.paymentRef}
            </p>
          ) : null}
        </SectionCard>
      </div>
    </div>
  )
}
