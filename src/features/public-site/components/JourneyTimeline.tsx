import { useGSAP } from '@gsap/react'
import { JOURNEY_STAGES } from '@shared/reference'
import { gsap } from 'gsap'
import { BarChart3, type LucideIcon, Megaphone, PenLine, Rocket, Search, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

const ICONS: Record<string, LucideIcon> = {
  consider: Search,
  sign: PenLine,
  activate: Rocket,
  engage: Users,
  sustain: BarChart3,
  report: Megaphone,
}

const N = JOURNEY_STAGES.length
const W = 1200
const BAND = 140
const nodeY = (i: number) => (i % 2 === 0 ? 34 : BAND - 34)
const nodeX = (i: number) => ((i + 0.5) / N) * W

/** A smooth wave through every stage node, entering and leaving at mid-height. */
function wavePath() {
  const pts = [
    [0, BAND / 2],
    ...JOURNEY_STAGES.map((_, i) => [nodeX(i), nodeY(i)]),
    [W, BAND / 2],
  ] as [number, number][]
  let d = `M ${pts[0]?.[0]} ${pts[0]?.[1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1] as [number, number]
    const [x1, y1] = pts[i] as [number, number]
    const mx = (x0 + x1) / 2
    d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`
  }
  return d
}
const PATH = wavePath()

/**
 * The six official WEPs journey stages. Desktop: a gold wave draws across as you scroll,
 * lighting each stage node, with stage cards alternating above and below. Mobile: a vertical
 * rail with the same scroll-driven fill.
 */
export function JourneyTimeline({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const root = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const dark = tone === 'dark'

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>('[data-step]')
      if (reduced) {
        for (const el of steps) el.dataset.active = 'true'
        gsap.set('[data-wave-fill]', { clipPath: 'inset(0 0% 0 0)' })
        gsap.set('[data-rail-fill]', { scaleY: 1 })
        return
      }
      const mm = gsap.matchMedia()
      const setActive = (p: number) => {
        for (const el of steps) {
          const i = Number(el.dataset.index)
          el.dataset.active = String(p >= (i + 0.35) / N)
        }
      }
      mm.add('(min-width: 1024px)', () => {
        gsap.fromTo(
          '[data-wave-fill]',
          { clipPath: 'inset(0 100% 0 0)' },
          {
            clipPath: 'inset(0 0% 0 0)',
            ease: 'none',
            scrollTrigger: {
              trigger: '[data-wave]',
              start: 'top 75%',
              end: 'bottom 35%',
              scrub: 0.6,
              onUpdate: (st) => setActive(st.progress),
            },
          },
        )
      })
      mm.add('(max-width: 1023px)', () => {
        gsap.fromTo(
          '[data-rail-fill]',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top 70%',
              end: 'bottom 60%',
              scrub: 0.6,
              onUpdate: (st) => setActive(st.progress),
            },
          },
        )
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [reduced] },
  )

  const card = (i: number) => {
    const s = JOURNEY_STAGES[i]
    if (!s) return null
    const Icon = ICONS[s.id] ?? Search
    return (
      <motion.article
        data-card
        initial={reduced ? false : { opacity: 0, y: i % 2 === 0 ? -28 : 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'group/card relative h-full rounded-2xl border p-5 transition-all duration-500',
          dark
            ? 'border-white/10 bg-white/[0.04] backdrop-blur-sm hover:border-gold/40 hover:bg-white/[0.08]'
            : 'border-border bg-card shadow-card hover:shadow-lift',
          'hover:-translate-y-1 group-data-[active=true]:border-gold/30',
        )}
      >
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'grid size-10 place-items-center rounded-xl transition-colors duration-500',
              dark ? 'bg-white/10 text-white/70' : 'bg-blue-50 text-blue',
              'group-data-[active=true]:bg-gold group-data-[active=true]:text-navy-900',
            )}
          >
            <Icon className="size-5" aria-hidden />
          </span>
          <span
            className={cn(
              'font-bold font-heading text-3xl tabular-nums transition-colors duration-500',
              dark ? 'text-white/10' : 'text-navy/10',
              'group-data-[active=true]:text-gold/60',
            )}
          >
            0{i + 1}
          </span>
        </div>
        <h3
          className={cn(
            'mt-4 font-heading font-semibold text-xl',
            dark ? 'text-white' : 'text-navy',
          )}
        >
          {s.title}
        </h3>
        <p
          className={cn(
            'mt-1.5 text-sm leading-relaxed',
            dark ? 'text-white/65' : 'text-muted-foreground',
          )}
        >
          {s.description}
        </p>
      </motion.article>
    )
  }

  return (
    <div ref={root} className="relative">
      {/* Desktop: alternating cards around a drawn wave */}
      <ol
        className="hidden grid-cols-6 lg:grid"
        style={{ gridTemplateRows: `auto ${BAND}px auto` }}
      >
        <li aria-hidden data-wave className="relative col-span-6 col-start-1 row-start-2">
          <svg
            aria-hidden
            viewBox={`0 0 ${W} ${BAND}`}
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible"
            fill="none"
          >
            <path
              d={PATH}
              stroke={dark ? 'rgb(255 255 255 / 0.14)' : 'var(--border)'}
              strokeWidth="2"
              strokeDasharray="4 6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <svg
            aria-hidden
            data-wave-fill
            viewBox={`0 0 ${W} ${BAND}`}
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible drop-shadow-[0_0_8px_rgba(214,164,74,0.7)]"
            fill="none"
            style={{ clipPath: 'inset(0 100% 0 0)' }}
          >
            <path
              d={PATH}
              stroke="var(--gold)"
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </li>
        {JOURNEY_STAGES.map((s, i) => {
          const top = i % 2 === 0
          // distance from the card edge to the node centre, through the wave band
          const reach = top ? nodeY(i) : BAND - nodeY(i)
          return (
            <li
              key={s.id}
              data-step
              data-index={i}
              data-active="false"
              className={cn('group relative px-2', top ? 'row-start-1' : 'row-start-3')}
              style={{ gridColumnStart: i + 1 }}
            >
              <span
                aria-hidden
                className={cn(
                  '-translate-x-1/2 absolute left-1/2 w-px transition-colors duration-500',
                  dark ? 'bg-white/15' : 'bg-border',
                  'group-data-[active=true]:bg-gold/60',
                )}
                style={top ? { top: '100%', height: reach } : { bottom: '100%', height: reach }}
              />
              <span
                className={cn(
                  '-translate-x-1/2 absolute left-1/2 z-10 grid size-10 place-items-center rounded-full border-2 font-bold font-heading text-sm transition-all duration-500',
                  dark
                    ? 'border-white/30 bg-navy-900 text-white'
                    : 'border-border bg-white text-navy',
                  'group-data-[active=true]:scale-110 group-data-[active=true]:border-gold group-data-[active=true]:bg-gold group-data-[active=true]:text-navy-900 group-data-[active=true]:shadow-[0_0_0_6px_rgba(214,164,74,0.18),0_0_24px_rgba(214,164,74,0.6)]',
                )}
                style={
                  top
                    ? { top: `calc(100% + ${reach - 20}px)` }
                    : { bottom: `calc(100% + ${reach - 20}px)` }
                }
              >
                {i + 1}
              </span>
              {card(i)}
            </li>
          )
        })}
      </ol>

      {/* Mobile and tablet: vertical rail */}
      <div className="relative lg:hidden">
        <div
          aria-hidden
          className={cn(
            'absolute start-5 top-2 bottom-2 w-0.5',
            dark ? 'bg-white/15' : 'bg-border',
          )}
        >
          <div
            data-rail-fill
            className="h-full origin-top bg-gold shadow-[0_0_10px_rgba(214,164,74,0.8)]"
          />
        </div>
        <ol className="grid gap-5">
          {JOURNEY_STAGES.map((s, i) => (
            <li
              key={s.id}
              data-step
              data-index={i}
              data-active="false"
              className="group relative ps-16"
            >
              <span
                className={cn(
                  'absolute start-0 top-5 grid size-10 place-items-center rounded-full border-2 font-bold font-heading text-sm transition-all duration-500',
                  dark
                    ? 'border-white/30 bg-navy-900 text-white'
                    : 'border-border bg-white text-navy',
                  'group-data-[active=true]:border-gold group-data-[active=true]:bg-gold group-data-[active=true]:text-navy-900',
                )}
              >
                {i + 1}
              </span>
              {card(i)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
