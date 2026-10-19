import { DEMO_RULES } from '@shared/rules'
import type { PointsBalance } from '@shared/types'
import { Link } from '@tanstack/react-router'
import {
  ArrowUpRight,
  CalendarCheck,
  Handshake,
  Lock,
  LockOpen,
  type LucideIcon,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Eligibility } from '@/queries/clinics.queries'

const EASE = [0.32, 0.72, 0, 1] as const

/** Reward opportunities with locked/unlocked state, the shortfall and how to earn the rest. */
export function RewardsPanel({
  balance,
  clinic,
}: {
  balance: PointsBalance
  clinic?: Eligibility
}) {
  const cost = DEMO_RULES.mentorSessionCost
  const mentorOk = balance.redeemable >= cost
  const shortfall = Math.max(0, cost - balance.redeemable)
  const clinicOk = Boolean(clinic?.eligible)
  const clinicPct = clinic
    ? Math.min(100, Math.round((clinic.qualifying / Math.max(1, clinic.required)) * 100))
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <RewardCard
        icon={CalendarCheck}
        title="Expert clinic access"
        price="Free · milestone"
        unlocked={clinicOk}
        description="A live expert clinic for your department. Registering spends no points; you only need to reach the qualifying milestone."
        progressLabel={
          clinic ? `${clinic.qualifying} of ${clinic.required} qualifying points` : undefined
        }
        pct={clinicPct}
        hint={
          clinic && !clinicOk
            ? clinic.remaining.join('. ')
            : 'Milestone reached. You can register now.'
        }
        to="/portal/clinics"
        cta={clinicOk ? 'Register for the clinic' : 'See clinics'}
      />
      <RewardCard
        icon={Handshake}
        title={`${DEMO_RULES.mentorSessionMinutes}-minute mentoring session`}
        price={`${cost} points`}
        unlocked={mentorOk}
        description={`One-to-one time with a volunteer mentor. ${cost} redeemable points are deducted once, when the booking is confirmed.`}
        progressLabel={`${balance.redeemable} of ${cost} redeemable points`}
        pct={Math.min(100, Math.round((balance.redeemable / cost) * 100))}
        hint={
          mentorOk
            ? 'You have enough points to book now.'
            : `${shortfall} points to go. Complete lessons (+25 each), pass a quiz (+100) or attend a clinic (+75).`
        }
        to="/portal/mentorship"
        cta={mentorOk ? 'Find a mentor' : 'Browse mentors'}
      />
    </div>
  )
}

function RewardCard({
  icon: Icon,
  title,
  price,
  unlocked,
  description,
  progressLabel,
  pct,
  hint,
  to,
  cta,
}: {
  icon: LucideIcon
  title: string
  price: string
  unlocked: boolean
  description: string
  progressLabel?: string
  pct: number
  hint: ReactNode
  to: string
  cta: string
}) {
  const reduce = useReducedMotion()
  return (
    <article className="group rounded-[1.75rem] bg-navy/[0.04] p-1.5 ring-1 ring-navy/[0.06]">
      <div className="flex h-full flex-col overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-card shadow-card transition-shadow duration-500 group-hover:shadow-lift">
        <div
          className={cn(
            'relative flex items-center gap-4 px-5 py-5',
            unlocked
              ? 'bg-[radial-gradient(90%_120%_at_0%_0%,rgba(214,164,74,0.35),transparent_60%),linear-gradient(135deg,var(--navy-900),var(--navy))] text-white'
              : 'bg-[linear-gradient(135deg,var(--surface),#e9eff5)] text-navy',
          )}
        >
          <span
            className={cn(
              'grid size-14 shrink-0 place-items-center rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]',
              unlocked
                ? 'bg-gradient-to-br from-gold to-gold-700 text-navy-900'
                : 'bg-white text-blue ring-1 ring-border',
            )}
          >
            <Icon className="size-7" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="grid min-w-0 flex-1 gap-1">
            <h3 className="font-heading font-semibold text-lg leading-tight">{title}</h3>
            <span className={cn('text-sm', unlocked ? 'text-white/75' : 'text-muted-foreground')}>
              {price}
            </span>
          </div>
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 self-start rounded-full px-2.5 py-1 font-semibold text-xs',
              unlocked ? 'bg-gold text-navy-900' : 'bg-white text-navy ring-1 ring-border',
            )}
          >
            {unlocked ? (
              <LockOpen className="size-3.5" aria-hidden />
            ) : (
              <Lock className="size-3.5" aria-hidden />
            )}
            {unlocked ? 'Unlocked' : 'Locked'}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-5">
          <p className="text-muted-foreground text-sm">{description}</p>
          {progressLabel ? (
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy tabular-nums">{progressLabel}</span>
                <span className="font-semibold text-navy tabular-nums">{pct}%</span>
              </div>
              <div
                className="h-2.5 overflow-hidden rounded-full bg-secondary"
                role="progressbar"
                aria-label={progressLabel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
              >
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    unlocked
                      ? 'bg-gradient-to-r from-gold to-gold-700'
                      : 'bg-gradient-to-r from-blue to-blue-600',
                  )}
                  initial={reduce ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: pct / 100 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: EASE }}
                  style={{ originX: 0, scaleX: reduce ? pct / 100 : undefined }}
                />
              </div>
            </div>
          ) : null}
          <p className="rounded-xl bg-surface px-3 py-2.5 text-sm">
            <span className="font-medium text-navy">{unlocked ? 'Ready: ' : 'How to earn: '}</span>
            {hint}
          </p>
          <Link
            to={to}
            className={cn(
              'group/cta mt-auto inline-flex w-fit items-center gap-3 rounded-full py-1.5 ps-5 pe-1.5 font-medium text-sm outline-none transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]',
              unlocked
                ? 'bg-blue text-white hover:bg-blue-600'
                : 'bg-secondary text-navy hover:bg-blue-50',
            )}
          >
            {cta}
            <span
              className={cn(
                'grid size-7 place-items-center rounded-full transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/cta:-translate-y-px group-hover/cta:translate-x-0.5',
                unlocked ? 'bg-white/20' : 'bg-white',
              )}
            >
              <ArrowUpRight className="size-4" aria-hidden />
            </span>
          </Link>
        </div>
      </div>
    </article>
  )
}
