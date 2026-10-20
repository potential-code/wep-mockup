import { Link, useParams } from '@tanstack/react-router'
import { AlertTriangle, ArrowLeft, ArrowRight, Coins, Globe2, Loader2 } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useRef, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/shared/States'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatNumber, viewerTimeZone } from '@/lib/format'
import { useBookingContext, useBookSession, useMentor } from '@/queries/mentorship.queries'
import { BookingConfirmation, type ConfirmedBooking } from '../components/BookingConfirmation'
import { BookingStepper } from '../components/BookingStepper'
import { ContextSharing, type ShareState } from '../components/ContextSharing'
import { EarnLinks } from '../components/PointsBanner'
import { SlotPicker } from '../components/SlotPicker'
import { dayLong, timeIn, timezoneOptions, tzAbbrev, tzName } from '../lib/time'

const STEPS = ['Time', 'Purpose', 'Context', 'Confirm']
const NO_ACTION = 'none'

export function BookSessionPage() {
  const { mentorId } = useParams({ from: '/_app/portal/mentorship/book/$mentorId' })
  const mentor = useMentor(mentorId)
  const ctx = useBookingContext()
  const book = useBookSession()
  const reduce = useReducedMotion()
  // One key per booking attempt: double-clicks and retries can never book or charge twice.
  const requestKey = useRef(crypto.randomUUID())

  const [step, setStep] = useState(0)
  const [timeZone, setTimeZone] = useState(viewerTimeZone())
  const [slotId, setSlotId] = useState<string>()
  const [purpose, setPurpose] = useState('')
  const [actionId, setActionId] = useState(NO_ACTION)
  const [share, setShare] = useState<ShareState>({
    role: true,
    company: true,
    department: true,
    action: true,
  })
  const [conflict, setConflict] = useState<string>()
  const [error, setError] = useState<string>()
  const [confirmed, setConfirmed] = useState<ConfirmedBooking>()

  if (confirmed) {
    return (
      <div>
        <PageHeader title="Booking confirmed" />
        <BookingConfirmation booking={confirmed} />
      </div>
    )
  }
  if (mentor.isLoading || ctx.isLoading) return <PageSkeleton />
  if (mentor.isError || !mentor.data || !ctx.data)
    return (
      <ErrorState
        title="We couldn’t load this booking"
        message={mentor.error?.message ?? ctx.error?.message}
        onRetry={() => {
          mentor.refetch()
          ctx.refetch()
        }}
      />
    )

  const m = mentor.data
  const { balance, actions } = ctx.data
  const cost = m.profile.pointsCost
  const shortfall = Math.max(0, cost - balance.redeemable)
  const slot = m.slots.find((s) => s.id === slotId)
  const action = actions.find((a) => a.id === actionId)
  const crumbs = [
    { label: 'Mentorship', to: '/portal/mentorship' },
    { label: m.name, to: `/portal/mentorship/${mentorId}` },
    { label: 'Book a session' },
  ]

  if (shortfall > 0) {
    return (
      <div>
        <PageHeader title="Book a session" breadcrumbs={crumbs} />
        <div
          role="alert"
          className="mx-auto grid max-w-2xl gap-5 rounded-2xl border border-warning/30 bg-card p-6 shadow-card sm:p-8"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-warning-soft text-warning">
            <Coins className="size-6" aria-hidden />
          </span>
          <div className="grid gap-2">
            <h2 className="font-heading font-medium text-navy text-section">
              You need {formatNumber(shortfall)} more points
            </h2>
            <p className="text-muted-foreground">
              A session with {m.name} costs {formatNumber(cost)} redeemable points and you have{' '}
              {formatNumber(balance.redeemable)}. Complete learning activities to earn the
              difference, then come back to pick a time.
            </p>
          </div>
          <EarnLinks />
          <Button asChild variant="ghost" className="justify-self-start">
            <Link to="/portal/mentorship/$mentorId" params={{ mentorId }}>
              <ArrowLeft aria-hidden /> Back to {m.name}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const canContinue =
    (step === 0 && Boolean(slot)) || (step === 1 && purpose.trim().length >= 10) || step >= 2

  const confirm = async () => {
    if (!slot) return
    setError(undefined)
    try {
      const sharing = { ...share, action: share.action && Boolean(action) }
      await book.mutateAsync({
        slotId: slot.id,
        purpose: purpose.trim(),
        actionId: action?.id,
        shareContext: Object.values(sharing).some(Boolean),
        share: sharing,
        requestKey: requestKey.current,
      })
      setConfirmed({
        id: `bk-${requestKey.current}`,
        mentorName: m.name,
        startsAt: slot.startsAt,
        durationMin: slot.durationMin,
        timeZone,
        cost,
        balanceBefore: balance.redeemable,
        purpose: purpose.trim(),
      })
    } catch (e) {
      const err = e as Error & { code?: string }
      if (err.code === 'conflict') {
        setConflict(err.message)
        setSlotId(undefined)
        setStep(0)
        mentor.refetch()
        // A fresh attempt needs a fresh key because the failed one is now settled.
        requestKey.current = crypto.randomUUID()
      } else setError(err.message)
    }
  }

  const motionProps = {
    initial: { opacity: 0, x: reduce ? 0 : 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduce ? 0 : -24 },
    transition: { duration: 0.2 },
  }

  return (
    <div>
      <PageHeader
        title={`Book a session with ${m.name}`}
        description={`${m.profile.sessionMinutes} minutes · ${formatNumber(cost)} points`}
        breadcrumbs={crumbs}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid min-w-0 gap-5 rounded-2xl border bg-card p-5 shadow-card sm:p-6">
          <BookingStepper steps={STEPS} current={step} />

          {conflict ? (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-soft/60 p-4 text-sm"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
              <p>
                <strong>{conflict}</strong> Nothing was charged. Choose another time below.
              </p>
            </div>
          ) : null}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} {...motionProps} className="min-h-72">
              {step === 0 ? (
                <div className="grid gap-5">
                  <h2 className="font-heading font-medium text-lg text-navy">
                    Choose a timezone and time
                  </h2>
                  <div className="grid max-w-sm gap-1.5">
                    <Label htmlFor="tz" className="flex items-center gap-1.5">
                      <Globe2 className="size-4" aria-hidden /> Your timezone
                    </Label>
                    <Select value={timeZone} onValueChange={setTimeZone}>
                      <SelectTrigger id="tz" className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezoneOptions(m.timezone).map((z) => (
                          <SelectItem key={z} value={z}>
                            {tzName(z)} ({tzAbbrev(z)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <SlotPicker
                    slots={m.slots}
                    timeZone={timeZone}
                    selectedId={slotId}
                    onSelect={(s) => {
                      setSlotId(s.id)
                      setConflict(undefined)
                    }}
                  />
                </div>
              ) : null}

              {step === 1 ? (
                <div className="grid gap-5">
                  <h2 className="font-heading font-medium text-lg text-navy">
                    What would you like help with?
                  </h2>
                  <div className="grid gap-1.5">
                    <Label htmlFor="purpose">Purpose of the session</Label>
                    <Textarea
                      id="purpose"
                      rows={5}
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="For example: we want to add supplier ownership data to onboarding and need advice on a proportionate approach."
                      aria-describedby="purpose-hint"
                    />
                    <p id="purpose-hint" className="text-muted-foreground text-xs">
                      At least 10 characters. {purpose.trim().length} entered.
                    </p>
                  </div>
                  <div className="grid max-w-md gap-1.5">
                    <Label htmlFor="action">Link a company action (optional)</Label>
                    <Select value={actionId} onValueChange={setActionId}>
                      <SelectTrigger id="action" className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_ACTION}>No linked action</SelectItem>
                        {actions.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="grid gap-4">
                  <div>
                    <h2 className="font-heading font-medium text-lg text-navy">
                      Review what your expert can see
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Your purpose is always shared. Everything else is optional. Experts see
                      nothing about you beyond what you switch on here.
                    </p>
                  </div>
                  <ContextSharing value={share} onChange={setShare} hasAction={Boolean(action)} />
                </div>
              ) : null}

              {step === 3 && slot ? (
                <div className="grid gap-5">
                  <h2 className="font-heading font-medium text-lg text-navy">
                    Review points and confirm
                  </h2>
                  <dl className="grid gap-3 rounded-xl bg-surface p-5 text-sm">
                    <Row label="Redeemable balance now" value={formatNumber(balance.redeemable)} />
                    <Row label="This session" value={`− ${formatNumber(cost)}`} />
                    <div className="border-t pt-3">
                      <Row
                        strong
                        label="Balance after booking"
                        value={formatNumber(balance.redeemable - cost)}
                      />
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Lifetime points ({formatNumber(balance.lifetime)}) do not change. Cancel 24
                      hours or more before and the {formatNumber(cost)} points are restored.
                    </p>
                  </dl>
                  {error ? (
                    <p role="alert" className="text-danger text-sm">
                      {error}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div className="sticky bottom-0 -mx-5 -mb-5 flex items-center justify-between gap-3 rounded-b-2xl border-t bg-card/95 px-5 py-3 backdrop-blur sm:static sm:m-0 sm:border-0 sm:bg-transparent sm:p-0">
            <Button
              variant="ghost"
              disabled={step === 0 || book.isPending}
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft aria-hidden /> Back
            </Button>
            {step < 3 ? (
              <Button disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
                Continue <ArrowRight aria-hidden />
              </Button>
            ) : (
              <Button disabled={book.isPending || !slot} onClick={confirm}>
                {book.isPending ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden /> Booking…
                  </>
                ) : (
                  `Confirm and use ${formatNumber(cost)} points`
                )}
              </Button>
            )}
          </div>
        </div>

        <aside
          aria-label="Booking summary"
          className="h-fit rounded-2xl border bg-card p-5 shadow-card"
        >
          <div className="flex items-center gap-3">
            <UserAvatar name={m.name} src={m.avatar} className="size-12 rounded-xl" />
            <div>
              <p className="font-heading font-medium text-navy">{m.name}</p>
              <p className="text-muted-foreground text-xs">{m.profile.location}</p>
            </div>
          </div>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">When</dt>
              <dd className="font-medium text-navy">
                {slot
                  ? `${dayLong(slot.startsAt, timeZone)}, ${timeIn(slot.startsAt, timeZone)} ${tzAbbrev(timeZone, slot.startsAt)}`
                  : 'Not chosen yet'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Cost</dt>
              <dd className="font-medium text-navy">{formatNumber(cost)} points</dd>
            </div>
            {purpose.trim() ? (
              <div>
                <dt className="text-muted-foreground">Purpose</dt>
                <dd className="line-clamp-4 text-navy">{purpose.trim()}</dd>
              </div>
            ) : null}
          </dl>
        </aside>
      </div>
      {!m.slots.some((s) => s.status === 'open') ? (
        <EmptyState className="mt-6" title="No open slots" description="Check back soon." />
      ) : null}
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={strong ? 'font-semibold text-navy' : 'text-muted-foreground'}>{label}</dt>
      <dd className={strong ? 'font-bold font-heading text-navy text-xl' : 'tabular-nums'}>
        {value}
      </dd>
    </div>
  )
}
