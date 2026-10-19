import { DEMO_RULES } from '@shared/rules'
import type { PointsBalance } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarCheck, Handshake, type Lock, LockOpen } from 'lucide-react'
import { SectionCard } from '@/components/shared/Cards'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Eligibility } from '@/queries/clinics.queries'

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
        title="Clinic access"
        unlocked={clinicOk}
        description="Free expert clinic for your department. Registering spends no points; you only need to reach the qualifying milestone."
        progressLabel={
          clinic ? `${clinic.qualifying} of ${clinic.required} qualifying points` : undefined
        }
        pct={clinicPct}
        shortfall={
          clinic && !clinicOk
            ? clinic.remaining.join('. ')
            : 'Milestone reached. You can register now.'
        }
        action={
          <Button asChild variant={clinicOk ? 'default' : 'outline'}>
            <Link to="/portal/clinics">
              {clinicOk ? 'Register for the clinic' : 'See clinics'}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        }
      />
      <RewardCard
        icon={Handshake}
        title="30-minute mentoring session"
        unlocked={mentorOk}
        description={`Book one-to-one time with a volunteer mentor for ${cost} redeemable points, deducted once when the booking is confirmed.`}
        progressLabel={`${balance.redeemable} of ${cost} redeemable points`}
        pct={Math.min(100, Math.round((balance.redeemable / cost) * 100))}
        shortfall={
          mentorOk
            ? 'You have enough points to book now.'
            : `${shortfall} points to go. Complete lessons (+25 each), pass a quiz (+100) or attend a clinic (+75).`
        }
        action={
          <Button asChild variant={mentorOk ? 'default' : 'outline'}>
            <Link to="/portal/mentorship">
              {mentorOk ? 'Find a mentor' : 'Browse mentors'}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        }
      />
    </div>
  )
}

function RewardCard({
  icon: Icon,
  title,
  unlocked,
  description,
  progressLabel,
  pct,
  shortfall,
  action,
}: {
  icon: typeof Lock
  title: string
  unlocked: boolean
  description: string
  progressLabel?: string
  pct: number
  shortfall: string
  action: React.ReactNode
}) {
  return (
    <SectionCard
      title={
        <span className="flex items-center gap-2">
          <Icon className="size-5 text-blue" aria-hidden />
          {title}
        </span>
      }
      action={
        unlocked ? (
          <StatusBadge tone="success" icon={LockOpen}>
            Unlocked
          </StatusBadge>
        ) : (
          <StatusBadge tone="locked">Locked</StatusBadge>
        )
      }
      bodyClassName="grid gap-3"
    >
      <p className="text-muted-foreground text-sm">{description}</p>
      {progressLabel ? (
        <div className="grid gap-1.5">
          <div className="text-navy text-sm tabular-nums">{progressLabel}</div>
          <Progress value={pct} aria-label={progressLabel} className="h-2" />
        </div>
      ) : null}
      <p className="text-sm">
        <span className="font-medium text-navy">{unlocked ? 'Ready: ' : 'How to earn: '}</span>
        {shortfall}
      </p>
      <div>{action}</div>
    </SectionCard>
  )
}
