import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Decorative brand line-work: concentric arcs, the "For All" double bar echoed in outline,
 * dot grids and edge rules. Always aria-hidden and pointer-events-none. Lines draw in once
 * when they scroll into view.
 */
type Corner = 'tl' | 'tr' | 'bl' | 'br'
type Tone = 'dark' | 'light'

const CORNER: Record<Corner, string> = {
  tl: 'top-0 left-0',
  tr: 'top-0 right-0 -scale-x-100',
  bl: 'bottom-0 left-0 -scale-y-100',
  br: 'bottom-0 right-0 -scale-100',
}

const stroke = (tone: Tone, accent = false) =>
  accent ? 'var(--gold)' : tone === 'dark' ? 'rgb(255 255 255 / 0.16)' : 'rgb(21 59 85 / 0.12)'

const draw = (delay = 0) => ({
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 1.6, delay, ease: [0.22, 1, 0.36, 1] as const },
})

/** Concentric quarter arcs anchored to a corner. */
export function CornerArcs({
  corner = 'tr',
  tone = 'dark',
  size = 320,
  className,
}: {
  corner?: Corner
  tone?: Tone
  size?: number
  className?: string
}) {
  const radii = [60, 110, 160, 210, 260]
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 300"
      width={size}
      height={size}
      className={cn('pointer-events-none absolute', CORNER[corner], className)}
      fill="none"
    >
      {radii.map((r, i) => (
        <motion.path
          key={r}
          d={`M ${r} 0 A ${r} ${r} 0 0 1 0 ${r}`}
          stroke={stroke(tone, i === 2)}
          strokeWidth={i === 2 ? 1.5 : 1}
          strokeDasharray={i === 4 ? '2 6' : undefined}
          {...draw(i * 0.12)}
        />
      ))}
      <motion.circle
        cx={160 * Math.cos(Math.PI / 4)}
        cy={160 * Math.sin(Math.PI / 4)}
        r="4"
        fill="var(--gold)"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9, type: 'spring', stiffness: 260, damping: 16 }}
      />
    </svg>
  )
}

/** Two rounded diagonal bars in outline, echoing the "For All Women and Girls" mark. */
export function ForAllBars({
  tone = 'dark',
  className,
  size = 220,
}: {
  tone?: Tone
  className?: string
  size?: number
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      className={cn('pointer-events-none absolute', className)}
    >
      <motion.rect
        x="20"
        y="78"
        width="170"
        height="44"
        rx="22"
        transform="rotate(-38 100 100)"
        stroke={stroke(tone)}
        strokeWidth="1.25"
        {...draw(0)}
      />
      <motion.rect
        x="10"
        y="130"
        width="140"
        height="44"
        rx="22"
        transform="rotate(-38 100 100)"
        stroke={stroke(tone, true)}
        strokeWidth="1.25"
        {...draw(0.2)}
      />
    </svg>
  )
}

/** A small dot matrix. */
export function DotGrid({
  tone = 'dark',
  cols = 8,
  rows = 5,
  className,
}: {
  tone?: Tone
  cols?: number
  rows?: number
  className?: string
}) {
  return (
    <svg
      aria-hidden
      width={cols * 16}
      height={rows * 16}
      className={cn('pointer-events-none absolute', className)}
    >
      {Array.from({ length: cols * rows }, (_, i) => (
        <circle
          // biome-ignore lint/suspicious/noArrayIndexKey: static decorative grid
          key={i}
          cx={(i % cols) * 16 + 2}
          cy={Math.floor(i / cols) * 16 + 2}
          r="1.5"
          fill={tone === 'dark' ? 'rgb(255 255 255 / 0.22)' : 'rgb(21 59 85 / 0.16)'}
        />
      ))}
    </svg>
  )
}

/** A thin rule with a gold lead segment, for top or bottom edges of a section. */
export function EdgeRule({ tone = 'dark', className }: { tone?: Tone; className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-x-0 h-px', className)}>
      <motion.div
        className="h-full origin-left"
        style={{
          background: `linear-gradient(90deg, var(--gold) 0 12%, ${stroke(tone)} 12% 100%)`,
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}

/** Thin corner brackets that frame a block. Parent must be `relative`. */
export function CornerBrackets({ tone = 'light', className }: { tone?: Tone; className?: string }) {
  const c = tone === 'dark' ? 'border-white/25' : 'border-navy/15'
  const base = 'pointer-events-none absolute size-5'
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0', className)}>
      <span
        className={cn(base, c, '-top-px -left-px rounded-tl-lg border-t-2 border-l-2 !border-gold')}
      />
      <span className={cn(base, c, '-top-px -right-px rounded-tr-lg border-t border-r')} />
      <span className={cn(base, c, '-bottom-px -left-px rounded-bl-lg border-b border-l')} />
      <span
        className={cn(
          base,
          c,
          '-right-px -bottom-px rounded-br-lg border-r-2 border-b-2 !border-gold',
        )}
      />
    </div>
  )
}
