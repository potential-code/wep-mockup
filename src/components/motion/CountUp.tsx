import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'

/** Animates a number from 0 when it scrolls into view. */
export function CountUp({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  duration = 1.2,
}: {
  value: number
  decimals?: number
  suffix?: string
  prefix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduced = usePrefersReducedMotion()
  const mv = useMotionValue(reduced ? value : 0)
  const text = useTransform(
    mv,
    (v) =>
      `${prefix}${v.toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`,
  )
  useEffect(() => {
    if (!inView) return
    if (reduced) return mv.set(value)
    const c = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] })
    return () => c.stop()
  }, [inView, value, reduced, mv, duration])
  return <motion.span ref={ref}>{text}</motion.span>
}
