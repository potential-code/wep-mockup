import { DEMO_RULES } from '@shared/rules'
import type { PointsBalance } from '@shared/types'
import { Award, GraduationCap, Wallet } from 'lucide-react'
import { CountUp } from '@/components/motion/CountUp'
import { Progress } from '@/components/ui/progress'

/** One lead number with two plainly explained companions — not three equal giant cards. */
export function BalanceSummary({ balance }: { balance: PointsBalance }) {
  const pct = Math.min(
    100,
    Math.round((balance.qualifying / DEMO_RULES.qualifyingPointsForClinic) * 100),
  )
  return (
    <section
      aria-label="Your points"
      className="grid overflow-hidden rounded-2xl border bg-card shadow-card lg:grid-cols-[1.1fr_1fr]"
    >
      <div className="relative grid gap-2 bg-navy p-6 text-white sm:p-8">
        <p className="flex items-center gap-2 font-medium text-sm text-white/75">
          <Award className="size-4 text-gold" aria-hidden />
          Lifetime points
        </p>
        <p className="font-heading font-bold text-5xl tabular-nums sm:text-6xl">
          <CountUp value={balance.lifetime} />
        </p>
        <p className="max-w-sm text-sm text-white/75">
          Everything you have earned across learning, clinics and contributions. This is a record of
          achievement and never goes down when you spend points.
        </p>
      </div>
      <dl className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-1 lg:divide-x-0 lg:divide-y">
        <div className="grid gap-1 p-5 sm:p-6">
          <dt className="flex items-center gap-2 font-medium text-navy text-sm">
            <Wallet className="size-4 text-blue" aria-hidden />
            Redeemable points
          </dt>
          <dd className="font-heading font-bold text-3xl text-navy tabular-nums">
            <CountUp value={balance.redeemable} />
          </dd>
          <p className="text-muted-foreground text-sm">
            What you can spend, for example on a {DEMO_RULES.mentorSessionMinutes}-minute mentoring
            session ({DEMO_RULES.mentorSessionCost} points).
          </p>
        </div>
        <div className="grid gap-1 p-5 sm:p-6">
          <dt className="flex items-center gap-2 font-medium text-navy text-sm">
            <GraduationCap className="size-4 text-blue" aria-hidden />
            Qualifying learning points
          </dt>
          <dd className="font-heading font-bold text-3xl text-navy tabular-nums">
            {balance.qualifying}
            <span className="font-medium text-base text-muted-foreground">
              {' '}
              / {DEMO_RULES.qualifyingPointsForClinic}
            </span>
          </dd>
          <Progress value={pct} aria-label="Progress to clinic access" className="mt-1 h-2" />
          <p className="text-muted-foreground text-sm">
            Earned from your designated pathway course. Spending points never reduces clinic access.
          </p>
        </div>
      </dl>
    </section>
  )
}
