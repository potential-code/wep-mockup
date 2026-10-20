import { useGSAP } from '@gsap/react'
import { Link } from '@tanstack/react-router'
import { gsap } from 'gsap'
import { ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import { BrushRing, ForAllBars, GearCluster } from '@/components/shared/BrandMotif'
import { Button } from '@/components/ui/button'
import { images } from '@/config/images'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { PrinciplesOrbit } from './PrinciplesOrbit'

export function HomeHero() {
  const root = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (reduced) return
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('[data-hero="bg"]', { scale: 1.12, opacity: 0, duration: 1.6, ease: 'power2.out' })
        .from('[data-hero="eyebrow"]', { y: 16, opacity: 0, duration: 0.6 }, 0.2)
        .from(
          '[data-hero="line"]',
          { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.12 },
          0.3,
        )
        .from('[data-hero="copy"]', { y: 20, opacity: 0, duration: 0.7 }, 0.9)
        .from('[data-hero="cta"]', { y: 16, opacity: 0, duration: 0.7 }, 1.05)
      gsap.to('[data-hero="bg"] img', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('[data-hero="preview"]', {
        y: -70,
        rotate: 8,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope: root, dependencies: [reduced] },
  )

  return (
    <section
      ref={root}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-blue-600 pt-28 text-white sm:pt-36"
    >
      <div data-hero="bg" aria-hidden className="absolute inset-0 -z-20 overflow-hidden">
        <img
          src={images.hero.homeHero.src}
          alt=""
          className="size-full scale-110 object-cover object-center"
          fetchPriority="high"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(0,58,96,0.9)_0%,rgba(0,84,135,0.68)_38%,rgba(0,111,168,0.22)_72%,rgba(0,140,200,0.08)_100%)]"
      />
      <div
        aria-hidden
        className="-z-10 absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[rgba(0,58,96,0.45)] to-transparent"
      />
      <GearCluster size={380} className="-z-10 -bottom-24 -left-24 opacity-70" />
      <ForAllBars className="-z-10 top-24 right-[-40px] hidden md:block" size={280} />
      <BrushRing
        size={620}
        className="-z-10 top-1/2 right-[max(-6rem,calc((100vw-1200px)/2-6rem))] hidden -translate-y-1/2 lg:block"
      />
      <div
        aria-hidden
        className="-z-10 absolute top-0 bottom-0 left-[max(1rem,calc((100vw-1200px)/2))] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"
      />
      <div className="container-public grid flex-1 items-center gap-12 pb-20 lg:grid-cols-[1.3fr_0.7fr] xl:grid-cols-[1.25fr_0.75fr]">
        <div className="grid gap-7">
          <p
            data-hero="eyebrow"
            className="font-semibold text-white/90 text-xs uppercase tracking-[0.2em] sm:text-sm"
          >
            Women’s Empowerment Principles
          </p>
          <h1 className="font-heading font-medium text-[2.5rem] leading-[1.06] sm:text-5xl xl:text-[3.6rem]">
            <span className="block overflow-hidden pb-1">
              <span data-hero="line" className="block">
                Turn commitment into
              </span>
            </span>
            <span className="block overflow-hidden pb-2">
              <span data-hero="line" className="block">
                measurable progress.
              </span>
            </span>
          </h1>
          <p data-hero="copy" className="max-w-xl text-lg text-white/90 leading-relaxed sm:text-xl">
            Connect your company with learning, practical tools, expert support and a community
            advancing gender equality.
          </p>
          <div data-hero="cta" className="flex flex-wrap gap-3">
            <Button asChild variant="coral" size="xl" className="group rounded-full">
              <Link to="/join">
                Join WEPs{' '}
                <ArrowRight
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </Button>
            <Button asChild variant="outline-light" size="xl" className="rounded-full">
              <Link to="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[340px] sm:max-w-[420px] lg:max-w-none">
          <PrinciplesOrbit />
        </div>
      </div>
    </section>
  )
}
