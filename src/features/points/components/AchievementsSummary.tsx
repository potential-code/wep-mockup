import type { PointsBalance } from '@shared/types'
import { Link } from '@tanstack/react-router'
import {
  ArrowUpRight,
  BookOpenCheck,
  CalendarCheck,
  type LucideIcon,
  Medal,
  Trophy,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { CountUp } from '@/components/motion/CountUp'
import { formatDate } from '@/lib/format'
import type { LedgerRow } from '@/queries/learning.queries'
import { type Achievement, countOf, levelFor, nextUp } from './achievements'
import { BadgeMedal } from './BadgeMedal'
import { ProgressLine } from './BadgesPanel'
import { LevelRing } from './BalanceSummary'
import { ActionIcon } from './LedgerTable'

const EASE = [0.32, 0.72, 0, 1] as const

/** Template-style count tiles: badges, lessons, quizzes and clinics. */
export function AchievementStats({
  achievements,
  ledger,
}: {
  achievements: Achievement[]
  ledger: LedgerRow[]
}) {
  const reduce = useReducedMotion()
  const stats: { label: string; value: number; of?: number; icon: LucideIcon }[] = [
    {
      label: 'Badges earned',
      value: achievements.filter((a) => a.earned).length,
      of: achievements.length,
      icon: Trophy,
    },
    { label: 'Lessons completed', value: countOf(ledger, 'lesson_complete'), icon: BookOpenCheck },
    { label: 'Quizzes passed', value: countOf(ledger, 'quiz_pass'), icon: Medal },
    { label: 'Clinics attended', value: countOf(ledger, 'clinic_attend'), icon: CalendarCheck },
  ]
  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 }}
          className="relative overflow-hidden rounded-2xl border bg-card p-4 shadow-card sm:p-5"
        >
          <s.icon
            className="-end-3 -bottom-3 absolute size-20 text-blue/[0.07]"
            strokeWidth={1.25}
            aria-hidden
          />
          <dt className="font-semibold text-[0.65rem] text-muted-foreground uppercase tracking-[0.16em]">
            {s.label}
          </dt>
          <dd className="mt-2 font-semibold font-heading text-3xl text-navy tabular-nums">
            <CountUp value={s.value} />
            {s.of ? (
              <span className="font-medium text-base text-muted-foreground"> / {s.of}</span>
            ) : null}
          </dd>
        </motion.div>
      ))}
    </dl>
  )
}

/** Latest point awards as a short timeline, like the template's "Recent awards". */
export function RecentAwards({ ledger }: { ledger: LedgerRow[] }) {
  const rows = ledger.filter((r) => r.amount > 0).slice(0, 7)
  return (
    <section
      aria-labelledby="recent-heading"
      className="rounded-[1.75rem] bg-navy/[0.04] p-1.5 ring-1 ring-navy/[0.06]"
    >
      <div className="h-full rounded-[calc(1.75rem-0.375rem)] bg-card p-5 shadow-card sm:p-6">
        <span className="rounded-full bg-coral-50 px-3 py-1 font-semibold text-[0.65rem] text-coral-700 uppercase tracking-[0.2em] ring-1 ring-coral/30">
          Recent awards
        </span>
        <h2 id="recent-heading" className="mt-2 font-heading font-medium text-navy text-xl">
          Points you earned lately
        </h2>
        {rows.length === 0 ? (
          <p className="mt-4 text-muted-foreground text-sm">
            Complete your first lesson to start earning.
          </p>
        ) : (
          <ol className="relative mt-5 grid gap-4 before:absolute before:start-[1.125rem] before:top-2 before:bottom-2 before:w-px before:bg-border">
            {rows.map((r) => (
              <li key={r.id} className="relative flex items-center gap-3">
                <ActionIcon action={r.action} amount={r.amount} qualifying={r.qualifying} />
                <div className="grid min-w-0 flex-1">
                  <span className="truncate font-medium text-navy text-sm">{r.sourceLabel}</span>
                  <span className="text-muted-foreground text-xs">{formatDate(r.createdAt)}</span>
                </div>
                <span className="rounded-full bg-success-soft px-2.5 py-0.5 font-semibold text-sm text-success tabular-nums">
                  +{r.amount}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

/** Compact achievements card for the employee dashboard: level, latest medals and the next badge. */
export function AchievementsSummary({
  achievements,
  balance,
}: {
  achievements: Achievement[]
  balance: PointsBalance
}) {
  const { level, next, toNext } = levelFor(balance.lifetime)
  const earned = achievements.filter((a) => a.earned)
  const upcoming = nextUp(achievements)[0]
  return (
    <section
      aria-labelledby="achievements-heading"
      className="rounded-[1.75rem] bg-navy/[0.05] p-1.5 ring-1 ring-navy/[0.07]"
    >
      <div className="relative isolate grid gap-6 overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-[linear-gradient(135deg,var(--navy-900),var(--navy)_60%,var(--navy-700))] p-5 text-white sm:p-6 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,18rem)] lg:items-center">
        <span
          aria-hidden
          className="-top-20 -left-10 -z-10 absolute size-72 rounded-full bg-[radial-gradient(circle,rgba(240,73,62,0.25),transparent_65%)]"
        />
        <div className="flex items-center gap-4">
          <LevelRing lifetime={balance.lifetime} size="md" />
          <div className="grid gap-0.5">
            <h2
              id="achievements-heading"
              className="font-medium text-[0.65rem] text-coral-50 uppercase tracking-[0.2em]"
            >
              Your achievements
            </h2>
            <p className="font-heading font-medium text-2xl">{level.name}</p>
            <p className="text-sm text-white/90">
              {balance.lifetime.toLocaleString('en-GB')} lifetime points
              {next ? ` · ${toNext} to ${next.name}` : ''}
            </p>
          </div>
        </div>
        <div className="grid gap-2">
          <p className="text-sm text-white/90">
            {earned.length} of {achievements.length} badges earned
          </p>
          <ul className="flex flex-wrap gap-1">
            {earned.slice(0, 6).map((a) => (
              <li key={a.id} title={a.label}>
                <BadgeMedal icon={a.icon} tier={a.tier} size="sm" />
                <span className="sr-only">{a.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-3 rounded-2xl bg-white p-4 text-navy shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
          {upcoming ? (
            <div className="flex items-center gap-3">
              <BadgeMedal icon={upcoming.icon} tier={upcoming.tier} earned={false} size="sm" />
              <div className="grid min-w-0 flex-1 gap-1">
                <p className="font-medium text-sm">
                  Next badge: <span className="font-semibold">{upcoming.label}</span>
                </p>
                <ProgressLine a={upcoming} />
              </div>
            </div>
          ) : (
            <p className="text-sm">Every badge earned. Well done.</p>
          )}
          <Link
            to="/portal/points"
            className="group/cta inline-flex w-fit items-center gap-2 rounded-full bg-blue py-1 ps-4 pe-1 font-medium text-sm text-white outline-none transition-transform hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
          >
            View achievements
            <span className="grid size-6 place-items-center rounded-full bg-white/20 transition-transform duration-300 group-hover/cta:-translate-y-px group-hover/cta:translate-x-0.5">
              <ArrowUpRight className="size-3.5" aria-hidden />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
