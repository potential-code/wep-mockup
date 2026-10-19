import { useGSAP } from '@gsap/react'
import { JOURNEY_STAGES } from '@shared/reference'
import { gsap } from 'gsap'
import { useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

/** The six official WEPs journey stages with a scroll-scrubbed progress line (no pinning). */
export function JourneyTimeline({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const root = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const dark = tone === 'dark'

  useGSAP(
    () => {
      if (reduced) {
        for (const el of gsap.utils.toArray<HTMLElement>('[data-step]')) el.dataset.active = 'true'
        return
      }
      const mm = gsap.matchMedia()
      const make = (axis: 'x' | 'y', start: string, end: string) => {
        gsap.fromTo('[data-line-fill]', axis === 'x' ? { scaleX: 0 } : { scaleY: 0 }, {
          ...(axis === 'x' ? { scaleX: 1 } : { scaleY: 1 }),
          ease: 'none',
          scrollTrigger: { trigger: root.current, start, end, scrub: 0.6 },
        })
      }
      mm.add('(min-width: 1024px)', () => make('x', 'top 80%', 'bottom 70%'))
      mm.add('(max-width: 1023px)', () => make('y', 'top 70%', 'bottom 60%'))
      for (const el of gsap.utils.toArray<HTMLElement>('[data-step]')) {
        gsap.from(el, {
          y: 24,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            onEnter: () => {
              el.dataset.active = 'true'
            },
            onLeaveBack: () => {
              el.dataset.active = 'false'
            },
          },
        })
      }
      return () => mm.revert()
    },
    { scope: root, dependencies: [reduced] },
  )

  return (
    <div ref={root} className="relative">
      {/* horizontal rail (desktop) */}
      <div
        aria-hidden
        className={cn(
          'absolute start-0 end-0 top-5 hidden h-0.5 lg:block',
          dark ? 'bg-white/15' : 'bg-border',
        )}
      >
        <div data-line-fill className="h-full origin-left bg-gold" />
      </div>
      {/* vertical rail (mobile) */}
      <div
        aria-hidden
        className={cn(
          'absolute start-5 top-2 bottom-2 w-0.5 lg:hidden',
          dark ? 'bg-white/15' : 'bg-border',
        )}
      >
        <div data-line-fill className="h-full origin-top bg-gold" />
      </div>
      <ol className="grid gap-8 lg:grid-cols-6 lg:gap-6">
        {JOURNEY_STAGES.map((s, i) => (
          <li
            key={s.id}
            data-step
            data-active="false"
            className="group relative ps-16 lg:ps-0 lg:pt-16"
          >
            <span
              className={cn(
                'absolute start-0 top-0 grid size-10 place-items-center rounded-full border-2 font-bold font-heading text-sm transition-colors duration-500',
                dark
                  ? 'border-white/30 bg-navy-900 text-white group-data-[active=true]:border-gold group-data-[active=true]:bg-gold group-data-[active=true]:text-navy-900'
                  : 'border-border bg-white text-navy group-data-[active=true]:border-gold group-data-[active=true]:bg-gold',
              )}
            >
              {i + 1}
            </span>
            <h3
              className={cn(
                'font-heading font-semibold text-xl',
                dark ? 'text-white' : 'text-navy',
              )}
            >
              {s.title}
            </h3>
            <p
              className={cn(
                'mt-2 text-sm leading-relaxed',
                dark ? 'text-white/70' : 'text-muted-foreground',
              )}
            >
              {s.description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}
