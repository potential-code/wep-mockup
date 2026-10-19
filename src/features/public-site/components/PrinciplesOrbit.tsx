import { PRINCIPLES } from '@shared/reference'
import { motion } from 'motion/react'
import { scrollToTarget } from '@/components/motion/SmoothScroll'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'

/**
 * Hero visual: the seven official Principle icons orbiting a central mark on slow,
 * concentric brand rings. Each icon jumps to the Principles section.
 */
export function PrinciplesOrbit() {
  const reduced = usePrefersReducedMotion()
  const R = 41 // orbit radius, % of the box
  return (
    <div
      data-hero="preview"
      className="relative mx-auto aspect-square w-full max-w-[480px] [--spin:60s]"
    >
      {/* rings */}
      <svg aria-hidden viewBox="0 0 400 400" className="absolute inset-0 size-full" fill="none">
        <defs>
          <radialGradient id="orbit-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#167CB3" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#153B55" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="orbit-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D6A44A" stopOpacity="0" />
            <stop offset="50%" stopColor="#D6A44A" />
            <stop offset="100%" stopColor="#D6A44A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="200" fill="url(#orbit-glow)" />
        <motion.circle
          cx="200"
          cy="200"
          r="164"
          stroke="rgb(255 255 255 / 0.18)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.6, ease: 'easeInOut' }}
        />
        <circle
          cx="200"
          cy="200"
          r="196"
          stroke="rgb(255 255 255 / 0.1)"
          strokeDasharray="2 8"
          className={
            reduced
              ? ''
              : 'origin-center [transform-box:fill-box] animate-[spin_120s_linear_infinite]'
          }
        />
        <circle
          cx="200"
          cy="200"
          r="118"
          stroke="rgb(255 255 255 / 0.12)"
          strokeDasharray="1 5"
          className={
            reduced
              ? ''
              : 'origin-center [transform-box:fill-box] animate-[spin_90s_linear_infinite_reverse]'
          }
        />
        <circle
          cx="200"
          cy="200"
          r="164"
          stroke="url(#orbit-gold)"
          strokeWidth="2"
          strokeDasharray="160 870"
          className={
            reduced
              ? ''
              : 'origin-center [transform-box:fill-box] animate-[spin_14s_linear_infinite]'
          }
        />
      </svg>

      {/* centre mark */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.9, type: 'spring', stiffness: 120, damping: 14 }}
        className="absolute inset-[31%] grid place-items-center rounded-full border border-white/20 bg-white/[0.07] text-center shadow-[0_0_80px_-10px_rgba(214,164,74,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-md"
      >
        <div>
          <p className="font-bold font-heading text-6xl text-gold leading-none sm:text-7xl">7</p>
          <p className="mt-1 font-medium text-[11px] text-white/80 uppercase tracking-[0.22em]">
            Principles
          </p>
        </div>
      </motion.div>

      {/* orbiting icons */}
      <div
        className={
          reduced
            ? 'absolute inset-0'
            : 'group/orbit absolute inset-0 animate-[spin_var(--spin)_linear_infinite] hover:[animation-play-state:paused]'
        }
      >
        {PRINCIPLES.map((p, i) => {
          const a = (i / PRINCIPLES.length) * Math.PI * 2 - Math.PI / 2
          return (
            <div
              key={p.id}
              className="-translate-x-1/2 -translate-y-1/2 absolute"
              style={{ left: `${50 + R * Math.cos(a)}%`, top: `${50 + R * Math.sin(a)}%` }}
            >
              <div
                className={
                  reduced
                    ? ''
                    : 'animate-[spin_var(--spin)_linear_infinite_reverse] group-hover/orbit:[animation-play-state:paused]'
                }
              >
                <motion.button
                  type="button"
                  onClick={() => scrollToTarget('#principles')}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 1.1 + i * 0.09,
                    type: 'spring',
                    stiffness: 200,
                    damping: 14,
                  }}
                  whileHover={{ scale: 1.15 }}
                  className="group relative grid size-14 place-items-center rounded-2xl border border-white/25 bg-white/90 p-1.5 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)] sm:size-16"
                  aria-label={`Principle ${p.id}: ${p.short}`}
                >
                  <img src={p.icon} alt="" className="size-full rounded-xl" />
                  <span className="-translate-x-1/2 pointer-events-none absolute top-full left-1/2 mt-2 whitespace-nowrap rounded-full bg-navy-900/90 px-2.5 py-1 font-medium text-[11px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {p.id}. {p.short}
                  </span>
                </motion.button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
