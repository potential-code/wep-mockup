import { motion, useMotionValue, useSpring } from 'motion/react'
import type { MouseEvent, ReactNode } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

/** Pulls its child a few pixels toward the cursor, then springs back on leave. */
export function Magnetic({
  children,
  strength = 0.3,
  className,
}: {
  children: ReactNode
  /** Share of the cursor offset applied, 0–1. */
  strength?: number
  className?: string
}) {
  const reduced = usePrefersReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 })
  const onMove = (e: MouseEvent<HTMLSpanElement>) => {
    if (reduced) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }
  return (
    <motion.span
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={cn('inline-flex', className)}
    >
      {children}
    </motion.span>
  )
}
