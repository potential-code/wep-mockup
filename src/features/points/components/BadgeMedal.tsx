import { Lock, type LucideIcon } from 'lucide-react'
import { useId } from 'react'
import { cn } from '@/lib/utils'
import type { MedalTier } from './achievements'

// Brand-only finishes: each tier is a light, mid and deep stop of one brand colour.
const FINISH: Record<
  MedalTier | 'locked',
  { light: string; mid: string; deep: string; ribbon: string; icon: string }
> = {
  gold: { light: '#f3dfb2', mid: '#d6a44a', deep: '#9b7225', ribbon: '#153b55', icon: '#0c2537' },
  blue: { light: '#cfe6f3', mid: '#167cb3', deep: '#12699a', ribbon: '#d6a44a', icon: '#ffffff' },
  navy: { light: '#1d4a69', mid: '#153b55', deep: '#0c2537', ribbon: '#d6a44a', icon: '#f3dfb2' },
  locked: { light: '#f4f7fa', mid: '#dde6ee', deep: '#cdd9e4', ribbon: '#cdd9e4', icon: '#5b7287' },
}

// Font size drives the icon (size-[1em]) so it scales with the medal.
const SIZE = {
  sm: 'size-12 text-base',
  md: 'size-20 text-[1.6rem]',
  lg: 'size-28 text-4xl',
  xl: 'size-36 text-5xl',
} as const

/** Rosette edge: a 24-point star between two radii, so the medal reads as an award, not an icon. */
const ROSETTE = (() => {
  const points: string[] = []
  const n = 24
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? 40 : 36.5
    const a = (Math.PI * i) / n - Math.PI / 2
    points.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(44 + r * Math.sin(a)).toFixed(2)}`)
  }
  return points.join(' ')
})()

/** Layered SVG medal: ribbon tails, rosette rim, bevelled face and the badge icon. */
export function BadgeMedal({
  icon: Icon,
  tier,
  earned = true,
  size = 'md',
  ribbon = true,
  className,
}: {
  icon: LucideIcon
  tier: MedalTier
  earned?: boolean
  size?: keyof typeof SIZE
  ribbon?: boolean
  className?: string
}) {
  const id = useId().replace(/:/g, '')
  const f = FINISH[earned ? tier : 'locked']
  return (
    <span
      className={cn(
        'group/medal relative inline-grid shrink-0 place-items-center',
        SIZE[size],
        className,
      )}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={f.light} />
            <stop offset="0.55" stopColor={f.mid} />
            <stop offset="1" stopColor={f.deep} />
          </linearGradient>
          <radialGradient id={`${id}-face`} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor={f.light} />
            <stop offset="0.6" stopColor={f.mid} />
            <stop offset="1" stopColor={f.deep} />
          </radialGradient>
        </defs>
        {ribbon ? (
          <g opacity={earned ? 1 : 0.7}>
            <path d="M33 66 L24 97 L35 91 L41 99 L48 72 Z" fill={f.ribbon} />
            <path d="M67 66 L76 97 L65 91 L59 99 L52 72 Z" fill={f.ribbon} />
            <path d="M33 66 L24 97 L35 91 L41 99 L48 72 Z" fill="#000" opacity="0.12" />
          </g>
        ) : null}
        <polygon points={ROSETTE} fill={`url(#${id}-rim)`} />
        <circle cx="50" cy="44" r="31" fill={f.deep} opacity="0.35" />
        <circle cx="50" cy="44" r="29" fill={`url(#${id}-face)`} />
        <circle
          cx="50"
          cy="44"
          r="25"
          fill="none"
          stroke="#ffffff"
          strokeOpacity={earned ? 0.35 : 0.6}
          strokeWidth="1"
          strokeDasharray={earned ? undefined : '2 2.5'}
        />
        <path
          d="M27 36 A25 25 0 0 1 62 21"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.45"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {/* Light sweep on hover, clipped to the face. Transform only; skipped for reduced motion. */}
      {earned ? (
        <span
          aria-hidden
          className="pointer-events-none absolute top-[15%] left-[21%] size-[58%] overflow-hidden rounded-full"
        >
          <span className="-translate-x-[120%] absolute inset-y-0 w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/medal:translate-x-[260%] group-hover:translate-x-[260%] motion-reduce:hidden" />
        </span>
      ) : null}
      <span className="absolute top-[44%] left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center">
        {earned ? (
          <Icon className="size-[1em]" style={{ color: f.icon }} strokeWidth={1.75} aria-hidden />
        ) : (
          <Lock className="size-[0.8em]" style={{ color: f.icon }} strokeWidth={1.75} aria-hidden />
        )}
      </span>
    </span>
  )
}
