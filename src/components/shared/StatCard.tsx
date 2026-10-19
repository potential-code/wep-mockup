import { Link } from '@tanstack/react-router'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { CountUp } from '@/components/motion/CountUp'
import { cn } from '@/lib/utils'

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
  tone?: 'blue' | 'navy' | 'gold' | 'success' | 'danger'
  className?: string
}) {
  const toneCls = {
    blue: 'bg-blue-50 text-blue',
    navy: 'bg-secondary text-navy',
    gold: 'bg-gold-50 text-gold-700',
    success: 'bg-success-soft text-success',
    danger: 'bg-danger-soft text-danger',
  }[tone]
  const body = (
    <motion.div
      whileHover={to ? { y: -3 } : undefined}
      transition={{ duration: 0.18 }}
      className={cn(
        'group relative h-full overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition-shadow',
        to && 'hover:shadow-lift',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-muted-foreground text-sm">{label}</p>
        {Icon ? (
          <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', toneCls)}>
            <Icon className="size-[18px]" aria-hidden />
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-heading font-bold text-3xl text-navy tabular-nums">
        {typeof value === 'number' ? (
          <CountUp value={value} decimals={decimals} suffix={suffix} />
        ) : (
          value
        )}
      </p>
      {progress !== undefined ? (
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className="h-full rounded-full bg-blue"
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      ) : null}
      {hint ? <p className="mt-2 text-muted-foreground text-xs leading-relaxed">{hint}</p> : null}
      {to ? (
        <ArrowUpRight
          className="absolute right-4 bottom-4 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      ) : null}
    </motion.div>
  )
  return to ? (
    <Link
      to={to}
      search={search}
      className="block rounded-2xl focus-visible:outline-2"
      aria-label={`${label}: ${value}${suffix ?? ''}. Open records`}
    >
      {body}
    </Link>
  ) : (
    body
  )
}
