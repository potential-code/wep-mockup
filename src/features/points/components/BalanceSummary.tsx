import { DEMO_RULES } from '@shared/rules'
import type { PointsBalance } from '@shared/types'
import { Award, GraduationCap, Wallet } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { type ReactNode, useId } from 'react'
import { CountUp } from '@/components/motion/CountUp'
import { cn } from '@/lib/utils'
import { LEVELS, levelFor } from './achievements'
import { BadgeMedal } from './BadgeMedal'

const EASE = [0.32, 0.72, 0, 1] as const

/** Medal inside a ring that fills towards the next level. */
export function LevelRing({ lifetime, size = 'lg' }: { lifetime: number; size?: 'md' | 'lg' }) {
  const reduce = useReducedMotion()
  const gradient = `ring-${useId().replace(/:/g, '')}`
  const { level, pct } = levelFor(lifetime)
  const r = 46
  const c = 2 * Math.PI * r
  return (
    <div
      className={cn(
        'relative grid shrink-0 place-items-center',
        size === 'lg' ? 'size-40' : 'size-28',
      )}
    >
      <svg viewBox="0 0 100 100" className="-rotate-90 absolute inset-0 size-full" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.14"
          strokeWidth="3"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={`url(#${gradient})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={reduce ? false : { strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - pct / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: EASE }}
          style={reduce ? { strokeDashoffset: c * (1 - pct / 100) } : undefined}
        />
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3dfb2" />
            <stop offset="1" stopColor="#d6a44a" />
          </linearGradient>
        </defs>
      </svg>
      <BadgeMedal
        icon={Award}
        tier={level.tier}
        size={size === 'lg' ? 'lg' : 'md'}
        ribbon={false}
      />
    </div>
  )
}

function Tile({
  icon,
  label,
  children,
  className,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid content-start gap-1.5 rounded-[1.25rem] bg-white/[0.07] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/10',
        className,
      )}
    >
      <dt className="flex items-center gap-2 font-medium text-sm text-white/80">
        {icon}
        {label}
      </dt>
      {children}
    </div>
  )
}

/** Celebratory hero: level medal and ring, lifetime total, and the two spendable/qualifying balances. */
export function BalanceSummary({ balance }: { balance: PointsBalance }) {
  const reduce = useReducedMotion()
  const { level, index, next, toNext } = levelFor(balance.lifetime)
  const target = DEMO_RULES.qualifyingPointsForClinic
  const qPct = Math.min(100, Math.round((balance.qualifying / target) * 100))

  return (
    <section
      aria-label="Your points"
      className="rounded-[2rem] bg-navy/[0.06] p-1.5 ring-1 ring-navy/[0.08]"
    >
      <div className="relative isolate overflow-hidden rounded-[calc(2rem-0.375rem)] bg-[linear-gradient(135deg,var(--navy-900),var(--navy)_55%,var(--navy-700))] p-6 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] sm:p-8">
        {/* Decorative glow and concentric rings. */}
        <span
          aria-hidden
          className="-top-24 -left-16 -z-10 absolute size-96 rounded-full bg-[radial-gradient(circle,rgba(214,164,74,0.28),transparent_65%)]"
        />
        <svg
          aria-hidden
          viewBox="0 0 400 400"
          className="-right-24 -bottom-40 -z-10 pointer-events-none absolute size-[34rem] text-white/[0.05]"
        >
          {[60, 100, 140, 180].map((r) => (
            <circle
              key={r}
              cx="200"
              cy="200"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
        </svg>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-start">
            <motion.div
              initial={reduce ? false : { scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 16 }}
              className="text-white"
            >
              <LevelRing lifetime={balance.lifetime} />
            </motion.div>
            <div className="grid min-w-0 gap-2">
              <span className="mx-auto w-fit rounded-full bg-gold/20 px-3 py-1 font-semibold text-[0.65rem] text-gold-50 uppercase tracking-[0.2em] ring-1 ring-gold/40 sm:mx-0">
                Level {index + 1} of {LEVELS.length} · {level.name}
              </span>
              <p className="text-sm text-white/75">Lifetime points</p>
              <p className="font-bold font-heading text-6xl leading-none tabular-nums sm:text-7xl">
                <CountUp value={balance.lifetime} />
              </p>
              <p className="max-w-sm text-sm text-white/75">
                {next ? (
                  <>
                    <strong className="text-white">{toNext} points</strong> to reach {next.name}.
                  </>
                ) : (
                  'Top level reached. Your lifetime total never goes down when you spend.'
                )}
              </p>
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Tile
              icon={<Wallet className="size-4 text-[#cfe6f3]" aria-hidden />}
              label="Redeemable points"
            >
              <dd className="font-bold font-heading text-3xl tabular-nums">
                <CountUp value={balance.redeemable} />
              </dd>
              <p className="text-sm text-white/70">
                Spend on rewards, such as mentoring ({DEMO_RULES.mentorSessionCost} points).
              </p>
            </Tile>
            <Tile
              icon={<GraduationCap className="size-4 text-gold" aria-hidden />}
              label="Qualifying learning points"
            >
              <dd className="font-bold font-heading text-3xl tabular-nums">
                {balance.qualifying}
                <span className="font-medium text-base text-white/60"> / {target}</span>
              </dd>
              <div
                className="h-2 overflow-hidden rounded-full bg-white/15"
                role="progressbar"
                aria-label="Progress to clinic access"
                aria-valuemin={0}
                aria-valuemax={target}
                aria-valuenow={balance.qualifying}
              >
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#f3dfb2] to-gold"
                  initial={reduce ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: qPct / 100 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: EASE }}
                  style={{ originX: 0, scaleX: reduce ? qPct / 100 : undefined }}
                />
              </div>
              <p className="text-sm text-white/70">Spending never reduces clinic access.</p>
            </Tile>
          </dl>
        </div>
      </div>
    </section>
  )
}
