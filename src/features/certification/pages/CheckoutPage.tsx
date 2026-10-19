import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { CheckCircle2, CreditCard, Loader2, Lock, RotateCcw, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { celebrate } from '@/components/motion/Celebrate'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { CompanyLogo } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/format'
import { useCompleteCheckout, usePurchase } from '@/queries/certification.queries'

type Phase = 'form' | 'processing' | 'success' | 'failed' | 'cancelled'

export function CheckoutPage() {
  const { purchaseId } = useParams({ from: '/_app/portal/certification/checkout/$purchaseId' })
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = usePurchase(purchaseId)
  const complete = useCompleteCheckout()
  const [phase, setPhase] = useState<Phase>('form')
  const [card, setCard] = useState('4242 4242 4242 4242')
  const [expiry, setExpiry] = useState('12 / 29')
  const [cvc, setCvc] = useState('123')

  if (isLoading) return <PageSkeleton />
  if (error || !data?.offering)
    return <ErrorState message={error?.message ?? 'Checkout not found'} onRetry={() => refetch()} />
  const { purchase, offering, company } = data
  const alreadyPaid = [
    'paid',
    'exam_in_progress',
    'retry_required',
    'passed',
    'certificate_issued',
  ].includes(purchase.status)
  const effective: Phase = alreadyPaid && phase === 'form' ? 'success' : phase
  const amount = formatCurrency(purchase.amount, offering.currency)

  const run = async (outcome: 'success' | 'failed' | 'cancelled') => {
    setPhase('processing')
    try {
      await complete.mutateAsync({ id: purchaseId, outcome })
      setPhase(outcome === 'success' ? 'success' : outcome)
      if (outcome === 'success') celebrate()
    } catch {
      setPhase('form')
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Certification', to: '/portal/certification' },
          { label: offering.title, to: `/portal/certification/${offering.id}` },
          { label: 'Checkout' },
        ]}
        title="Checkout"
        description="Simulated Stripe-style payment for a proposed demo certification."
      />
      <div className="flex items-center justify-center gap-3 rounded-2xl border-2 border-gold bg-gold-50 px-4 py-4 text-center">
        <Lock className="size-5 text-gold-700" aria-hidden />
        <p className="font-heading font-bold text-gold-700 text-lg uppercase tracking-wide">
          Demo payment — no real charge
        </p>
      </div>
      <div className="grid items-start gap-6 md:grid-cols-5">
        <aside
          className="grid gap-4 rounded-2xl border bg-card p-5 shadow-card md:col-span-2"
          aria-label="Order summary"
        >
          <div className="flex items-center gap-3">
            <CompanyLogo name={company?.name ?? ''} src={company?.logo} className="size-10" />
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">Billing company</p>
              <p className="truncate font-semibold text-navy">{company?.name}</p>
            </div>
          </div>
          <dl className="grid gap-2 border-t pt-4 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs">Item</dt>
              <dd className="font-medium text-navy">{offering.title}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Currency</dt>
              <dd>{offering.currency}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Certification fee</dt>
              <dd>{amount}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Separately identified charges</dt>
              <dd>None</dd>
            </div>
            <div className="flex justify-between border-t pt-2 font-heading font-semibold text-base text-navy">
              <dt>Total due</dt>
              <dd>{amount}</dd>
            </div>
          </dl>
        </aside>
        <div className="rounded-2xl border bg-card p-5 shadow-card md:col-span-3 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={effective}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {effective === 'form' ? (
                <form
                  className="grid gap-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    run('success')
                  }}
                >
                  <h2 className="flex items-center gap-2 font-heading font-semibold text-lg text-navy">
                    <CreditCard className="size-5 text-blue" aria-hidden /> Payment details
                  </h2>
                  <div className="grid gap-1.5">
                    <Label htmlFor="card">Card number (test card)</Label>
                    <Input
                      id="card"
                      inputMode="numeric"
                      autoComplete="off"
                      value={card}
                      onChange={(e) => setCard(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="exp">Expiry</Label>
                      <Input
                        id="exp"
                        autoComplete="off"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        autoComplete="off"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="mt-1">
                    Pay {amount}
                  </Button>
                  <p className="text-center text-muted-foreground text-xs">
                    The test card is prefilled. No card data is sent anywhere.
                  </p>
                  <fieldset className="mt-2 grid gap-2 rounded-xl border border-dashed p-3">
                    <legend className="px-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                      Demo controls
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => run('failed')}
                      >
                        Simulate decline
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => run('cancelled')}
                      >
                        Cancel checkout
                      </Button>
                    </div>
                  </fieldset>
                </form>
              ) : effective === 'processing' ? (
                <div
                  className="grid place-items-center gap-3 py-12 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <Loader2 className="size-10 animate-spin text-blue" aria-hidden />
                  <p className="font-heading font-semibold text-navy">Processing demo payment…</p>
                  <p className="text-muted-foreground text-sm">Please don’t close this page.</p>
                </div>
              ) : effective === 'success' ? (
                <div className="grid place-items-center gap-3 py-6 text-center">
                  <CheckCircle2 className="size-12 text-success" aria-hidden />
                  <h2 className="font-heading font-semibold text-navy text-xl">
                    Payment confirmed (demo)
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {amount} for {offering.title}. The exam is now available.
                  </p>
                  <p className="rounded-lg bg-surface px-3 py-1.5 font-mono text-sm">
                    Payment reference: {purchase.paymentRef ?? '—'}
                  </p>
                  <Button
                    size="lg"
                    onClick={() =>
                      navigate({
                        to: '/portal/certification/exam/$purchaseId',
                        params: { purchaseId },
                      })
                    }
                  >
                    Start exam
                  </Button>
                  <Button asChild variant="ghost">
                    <Link to="/portal/certification">Back to certifications</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid place-items-center gap-3 py-8 text-center" role="alert">
                  <XCircle
                    className={
                      effective === 'failed'
                        ? 'size-12 text-danger'
                        : 'size-12 text-muted-foreground'
                    }
                    aria-hidden
                  />
                  <h2 className="font-heading font-semibold text-navy text-xl">
                    {effective === 'failed' ? 'Payment declined (demo)' : 'Checkout cancelled'}
                  </h2>
                  <p className="max-w-sm text-muted-foreground text-sm">
                    {effective === 'failed'
                      ? 'The simulated card was declined. Nothing was charged and no exam has been unlocked.'
                      : 'You left checkout. Nothing was charged and no exam has been unlocked.'}
                  </p>
                  <Button size="lg" onClick={() => setPhase('form')}>
                    <RotateCcw /> Try payment again
                  </Button>
                  <Button asChild variant="ghost">
                    <Link to="/portal/certification">Back to certifications</Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
