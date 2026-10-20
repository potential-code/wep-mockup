import { Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: { box: 'size-8', icon: 'size-4', dot: 'size-2.5' },
  md: { box: 'size-10', icon: 'size-5', dot: 'size-3' },
  lg: { box: 'size-12', icon: 'size-6', dot: 'size-3.5' },
  xl: { box: 'size-16', icon: 'size-8', dot: 'size-4' },
} as const

/**
 * The concierge's face: a navy-to-blue orb with a sparkle and an optional online dot.
 * `thinking` quickens the sparkle's pulse while a reply is being prepared.
 */
export function ConciergeAvatar({
  size = 'md',
  online = false,
  thinking = false,
  className,
}: {
  size?: keyof typeof SIZES
  online?: boolean
  thinking?: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  const s = SIZES[size]
  return (
    <span className={cn('relative inline-grid shrink-0', s.box, className)} aria-hidden>
      <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg,var(--coral),var(--blue),var(--navy),var(--coral))] p-[2px]">
        <span className="grid size-full place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,var(--blue)_0%,var(--navy)_60%,var(--navy-900)_100%)] text-white shadow-[inset_0_1px_6px_rgb(255_255_255/0.25)]">
          <motion.span
            className="grid place-items-center"
            animate={reduce ? undefined : { scale: [1, 1.12, 1], rotate: [0, 8, 0] }}
            transition={{
              duration: thinking ? 1.2 : 3.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className={cn(s.icon, 'drop-shadow-[0_0_6px_rgb(240_73_62/0.6)]')} />
          </motion.span>
        </span>
      </span>
      {online ? (
        <span className={cn('absolute right-0 bottom-0 grid', s.dot)}>
          {reduce ? null : (
            <span className="absolute inset-0 animate-ping rounded-full bg-success/60" />
          )}
          <span className="relative rounded-full bg-success ring-2 ring-white" />
        </span>
      ) : null}
    </span>
  )
}
