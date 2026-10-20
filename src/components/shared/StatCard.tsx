import { Link } from '@tanstack/react-router'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { CountUp } from '@/components/motion/CountUp'
import { cn } from '@/lib/utils'

export type StatTone = 'blue' | 'navy' | 'coral' | 'success' | 'danger'

/** Brand-coloured surfaces for KPI tiles. Text colours are picked per surface for contrast. */
export const STAT_TONES: Record<
  StatTone,
  { surface: string; text: string; muted: string; track: string; fill: string; icon: string }
> = {
  navy: {
    surface: 'bg-[linear-gradient(135deg,var(--navy-900),var(--navy)_55%,var(--navy-700))]',
    text: 'text-white',
    muted: 'text-white/90',
    track: 'bg-white/20',
    fill: 'bg-coral',
    icon: 'text-white/85',
  },
  blue: {
    surface: 'bg-[linear-gradient(135deg,#00639a,var(--blue-600)_45%,var(--blue))]',
    text: 'text-white',
    muted: 'text-white/90',
    track: 'bg-white/25',
    fill: 'bg-white',
    icon: 'text-white/85',
  },
  coral: {
    surface: 'bg-[linear-gradient(135deg,var(--coral-600),#c4352c_55%,var(--coral-700))]',
    text: 'text-white',
    muted: 'text-white',
    track: 'bg-white/25',
    fill: 'bg-white',
    icon: 'text-white/85',
  },
  success: {
    surface: 'bg-[linear-gradient(135deg,var(--navy),var(--blue-600)_60%,var(--blue))]',
    text: 'text-white',
    muted: 'text-white/90',
    track: 'bg-white/25',
    fill: 'bg-coral',
    icon: 'text-white/85',
  },
  danger: {
    surface: 'bg-[linear-gradient(135deg,var(--navy-900),var(--navy-700)_60%,#7a2a26)]',
    text: 'text-white',
    muted: 'text-white/90',
    track: 'bg-white/20',
    fill: 'bg-coral',
    icon: 'text-white/85',
  },
}

/** KPI card. When `to` is set the whole card opens the underlying records. */
export function StatCard({
  label,
  value,
  suffix,
  decimals,
  hint,
  icon: Icon,
  to,
  search,
  progress,
  tone = 'blue',
  className,
}: {
  label: string
  value: number | string
  suffix?: string
  decimals?: number
  hint?: ReactNode
  icon?: LucideIcon
  to?: string
  search?: Record<string, unknown>
  progress?: number
  tone?: StatTone
  className?: string
}) {
  const reduce = useReducedMotion()
  const t = STAT_TONES[tone]
  const body = (
    <motion.div
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative isolate h-full overflow-hidden rounded-2xl p-5 shadow-card transition-shadow hover:shadow-lift',
        t.surface,
        t.text,
        className,
      )}
    >
      {/* Soft glow and a light sweep on hover, purely decorative. */}
      <span
        aria-hidden
        className="-top-16 -right-16 -z-10 absolute size-44 rounded-full bg-white/15 blur-2xl transition-transform duration-500 group-hover:scale-125"
      />
      <span
        aria-hidden
        className="-z-10 -translate-x-full absolute inset-y-0 left-0 w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[260%]"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn('font-medium text-sm', t.muted)}>{label}</p>
          <p className="mt-2 font-semibold font-heading text-3xl tabular-nums sm:text-4xl">
            {typeof value === 'number' ? (
              <CountUp value={value} decimals={decimals} suffix={suffix} />
            ) : (
              value
            )}
          </p>
        </div>
        {Icon ? (
          <motion.span
            aria-hidden
            className={cn('shrink-0', t.icon)}
            initial={reduce ? false : { opacity: 0, scale: 0.6, rotate: -12 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
          >
            <motion.span
              className="block"
              animate={reduce ? undefined : { y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            >
              <Icon
                className="size-12 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 sm:size-14"
                strokeWidth={1.5}
              />
            </motion.span>
          </motion.span>
        ) : null}
      </div>
      {progress !== undefined ? (
        <div
          className={cn('mt-3 h-1.5 overflow-hidden rounded-full', t.track)}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className={cn('h-full rounded-full', t.fill)}
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </div>
      ) : null}
      {hint ? <p className={cn('mt-2 text-xs leading-relaxed', t.muted)}>{hint}</p> : null}
      {to ? (
        <ArrowUpRight
          className="absolute right-4 bottom-4 size-4 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      ) : null}
    </motion.div>
  )
  return to ? (
    <Link
      to={to}
      search={search}
      className="block h-full rounded-2xl focus-visible:outline-2"
      aria-label={`${label}: ${value}${suffix ?? ''}. Open records`}
    >
      {body}
    </Link>
  ) : (
    body
  )
}
