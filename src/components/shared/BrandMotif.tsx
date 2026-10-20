import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  ClipboardCheck,
  Download,
  Presentation,
  Route,
  Search,
  Wrench,
} from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Decorative brand line-work drawn from weps.org: rounded double bars (echoing the
 * "For All Women and Girls" mark, never presented as the logo itself), line-drawn gears with
 * tool icons, and a brush-stroke ring. Always aria-hidden and pointer-events-none.
 */
type Tone = 'dark' | 'light'

const line = (tone: Tone, strong = false) =>
  tone === 'dark'
    ? `rgb(255 255 255 / ${strong ? 0.55 : 0.3})`
    : `rgb(0 119 182 / ${strong ? 0.32 : 0.18})`

const draw = (delay = 0) => ({
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 1.6, delay, ease: [0.22, 1, 0.36, 1] as const },
})

/* ---- Rounded double bars -------------------------------------------------------------- */

type BarsVariant = 'chevron' | 'stack' | 'outline'

/**
 * Two rounded bars. `chevron` meets at a point like the mark on weps.org, `stack` runs them
 * in parallel, `outline` draws the chevron as line-work only.
 */
export function ForAllBars({
  variant = 'chevron',
  tone = 'dark',
  size = 220,
  className,
}: {
  variant?: BarsVariant
  tone?: Tone
  size?: number
  className?: string
}) {
  const [front, back] =
    tone === 'dark'
      ? ['rgb(255 255 255 / 0.22)', 'rgb(255 255 255 / 0.1)']
      : ['rgb(0 163 224 / 0.16)', 'rgb(240 73 62 / 0.12)']
  const outline = variant === 'outline'
  // Bar geometry in a 200 box: the chevron's bars meet at the right-hand point.
  const bars =
    variant === 'stack'
      ? [
          { x: 10, y: 52, w: 180, rot: -32, fill: front },
          { x: 10, y: 104, w: 150, rot: -32, fill: back },
        ]
      : [
          { x: 22, y: 58, w: 156, rot: 32, fill: back },
          { x: 22, y: 98, w: 156, rot: -32, fill: front },
        ]
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      className={cn('pointer-events-none absolute', className)}
    >
      {bars.map((b, i) => (
        // Motion's x/y would replace the SVG rotate, so the slide-in moves the group instead.
        <motion.g
          key={`${b.x}-${b.y}`}
          initial={{ opacity: 0, x: -14 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1, delay: i * 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height="44"
            rx="22"
            transform={`rotate(${b.rot} 100 100)`}
            fill={outline ? 'none' : b.fill}
            stroke={outline ? line(tone, i === 1) : 'none'}
            strokeWidth={outline ? 1.25 : 0}
          />
        </motion.g>
      ))}
    </svg>
  )
}

/* ---- Line-drawn gears ----------------------------------------------------------------- */

function gearPath(r: number, teeth: number) {
  const inner = r * 0.84
  const step = (Math.PI * 2) / teeth
  const pts: string[] = []
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    const corners: [number, number][] = [
      [a, inner],
      [a + step * 0.18, r],
      [a + step * 0.32, r],
      [a + step * 0.5, inner],
    ]
    for (const [t, rad] of corners) {
      pts.push(`${(Math.cos(t) * rad).toFixed(2)} ${(Math.sin(t) * rad).toFixed(2)}`)
    }
  }
  return `M ${pts.join(' L ')} Z`
}

const GEAR_ICONS: LucideIcon[] = [
  ClipboardCheck,
  Wrench,
  Search,
  Download,
  Presentation,
  Route,
  BarChart3,
]

type Gear = { x: number; y: number; r: number; icon: number; spin: 'cw' | 'ccw' }
const CLUSTER: Gear[] = [
  { x: 120, y: 140, r: 78, icon: 1, spin: 'cw' },
  { x: 236, y: 92, r: 52, icon: 0, spin: 'ccw' },
  { x: 250, y: 214, r: 42, icon: 2, spin: 'ccw' },
  { x: 44, y: 262, r: 36, icon: 5, spin: 'ccw' },
]

/**
 * A cluster of outlined gears, each holding a line icon, like the toolbox banners on
 * weps.org. Gears turn slowly; the global reduced-motion rule stops them.
 */
export function GearCluster({
  tone = 'dark',
  size = 320,
  icons,
  className,
}: {
  tone?: Tone
  size?: number
  /** Indexes into the icon set, one per gear. */
  icons?: number[]
  className?: string
}) {
  const stroke = line(tone, true)
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 300"
      width={size}
      height={size}
      fill="none"
      className={cn('pointer-events-none absolute', className)}
    >
      {CLUSTER.map((g, i) => {
        const Icon = GEAR_ICONS[(icons?.[i] ?? g.icon) % GEAR_ICONS.length] ?? Wrench
        const iconSize = g.r * 0.62
        return (
          <g key={`${g.x}-${g.y}`} transform={`translate(${g.x} ${g.y})`}>
            <g
              className={cn(
                'origin-center [transform-box:fill-box]',
                g.spin === 'cw'
                  ? 'animate-[spin_80s_linear_infinite]'
                  : 'animate-[spin_70s_linear_infinite_reverse]',
              )}
            >
              <motion.path
                d={gearPath(g.r, Math.max(8, Math.round(g.r / 6)))}
                stroke={stroke}
                strokeWidth={1.2}
                strokeLinejoin="round"
                {...draw(i * 0.15)}
              />
            </g>
            <circle r={g.r * 0.5} stroke={line(tone)} strokeWidth={1} />
            <Icon
              x={-iconSize / 2}
              y={-iconSize / 2}
              width={iconSize}
              height={iconSize}
              color={stroke}
              strokeWidth={1.25}
              absoluteStrokeWidth
            />
          </g>
        )
      })}
    </svg>
  )
}

/* ---- Brush ring ----------------------------------------------------------------------- */

const STROKES = [
  { dr: 0, w: 7, start: 200, sweep: 250, o: 0.9 },
  { dr: 4, w: 3, start: 215, sweep: 220, o: 0.6 },
  { dr: -5, w: 2, start: 190, sweep: 280, o: 0.5 },
  { dr: 8, w: 1.2, start: 260, sweep: 140, o: 0.45 },
  { dr: -9, w: 1, start: 120, sweep: 90, o: 0.4 },
]

function arc(r: number, startDeg: number, sweepDeg: number) {
  const a0 = (startDeg * Math.PI) / 180
  const a1 = ((startDeg + sweepDeg) * Math.PI) / 180
  const p = (a: number) =>
    `${(150 + Math.cos(a) * r).toFixed(2)} ${(150 + Math.sin(a) * r).toFixed(2)}`
  return `M ${p(a0)} A ${r} ${r} 0 ${sweepDeg > 180 ? 1 : 0} 1 ${p(a1)}`
}

/** An open, hand-painted ring, after the hero artwork on weps.org. */
export function BrushRing({
  tone = 'dark',
  size = 320,
  className,
}: {
  tone?: Tone
  size?: number
  className?: string
}) {
  const colour = tone === 'dark' ? '255 255 255' : '0 163 224'
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 300"
      width={size}
      height={size}
      fill="none"
      className={cn('pointer-events-none absolute', className)}
    >
      {STROKES.map((s, i) => (
        <motion.path
          key={`${s.dr}-${s.start}`}
          d={arc(120 + s.dr, s.start, s.sweep)}
          stroke={`rgb(${colour} / ${s.o * (tone === 'dark' ? 0.55 : 0.4)})`}
          strokeWidth={s.w}
          strokeLinecap="round"
          strokeDasharray={i === 3 ? '18 6 4 8' : undefined}
          {...draw(i * 0.1)}
        />
      ))}
    </svg>
  )
}

/* ---- Rules and frames ----------------------------------------------------------------- */

/** A thin rule with a coral lead segment, for the top or bottom edge of a section. */
export function EdgeRule({ tone = 'dark', className }: { tone?: Tone; className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-x-0 h-px', className)}>
      <motion.div
        className="h-full origin-left"
        style={{
          background: `linear-gradient(90deg, var(--coral) 0 12%, ${line(tone)} 12% 100%)`,
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
        className={cn(
          base,
          c,
          '-top-px -left-px rounded-tl-lg border-t-2 border-l-2 !border-coral',
        )}
      />
      <span className={cn(base, c, '-top-px -right-px rounded-tr-lg border-t border-r')} />
      <span className={cn(base, c, '-bottom-px -left-px rounded-bl-lg border-b border-l')} />
      <span
        className={cn(
          base,
          c,
          '-right-px -bottom-px rounded-br-lg border-r-2 border-b-2 !border-coral',
        )}
      />
    </div>
  )
}
