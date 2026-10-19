import { POINTS_RULES } from '@shared/rules'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatNumber } from '@/lib/format'

export interface PointsSummary {
  redeemable: number
  lifetime: number
  cost: number
  shortfall: number
}

/** Ways to earn points, linked to the learning and clinic pages that award them. */
export function EarnLinks({ className }: { className?: string }) {
  const links = [
    {
      to: '/portal/learn',
      label: `Complete lessons (+${POINTS_RULES.lesson_complete.amount} each)`,
    },
    { to: '/portal/clinics', label: `Attend a clinic (+${POINTS_RULES.clinic_attend.amount})` },
    { to: '/portal/points', label: 'See all ways to earn' },
  ]
  return (
    <ul className={className ?? 'flex flex-wrap gap-2'}>
      {links.map((l) => (
        <li key={l.to}>
          <Button asChild variant="outline" size="sm">
            <Link to={l.to}>
              {l.label} <ArrowRight aria-hidden />
            </Link>
          </Button>
        </li>
      ))}
    </ul>
  )
}

export function PointsBanner({ points }: { points: PointsSummary }) {
  const enough = points.shortfall === 0
  const pct = Math.min(100, Math.round((points.redeemable / points.cost) * 100))
  return (
    <section
      aria-label="Your points for mentoring"
      className="grid gap-4 rounded-2xl border bg-card p-5 shadow-card sm:p-6 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-8"
    >
      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-gold-50 text-gold-700">
          <Coins className="size-6" aria-hidden />
        </span>
        <div>
          <p className="font-medium text-muted-foreground text-sm">Redeemable points</p>
          <p className="font-bold font-heading text-3xl text-navy tabular-nums">
            {formatNumber(points.redeemable)}
          </p>
          <p className="text-muted-foreground text-xs">
            {formatNumber(points.lifetime)} earned in total
          </p>
        </div>
      </div>
      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="font-medium text-navy">
            One 30-minute session costs {formatNumber(points.cost)} points
          </span>
          <span className="text-muted-foreground tabular-nums">{pct}%</span>
        </div>
        <Progress value={pct} aria-label="Progress towards one mentoring session" />
        {enough ? (
          <p className="text-sm text-success">You have enough points to book now.</p>
        ) : (
          <p className="text-sm text-warning">
            You need <strong>{formatNumber(points.shortfall)} more points</strong> to book a
            session.
          </p>
        )}
      </div>
      {enough ? null : (
        <div className="grid gap-2 border-t pt-4 lg:col-span-2">
          <p className="font-medium text-navy text-sm">Earn points through learning</p>
          <EarnLinks />
        </div>
      )}
    </section>
  )
}
