import { useGSAP } from '@gsap/react'
import { Link } from '@tanstack/react-router'
import { gsap } from 'gsap'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { images } from '@/config/images'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { PortalPreview } from './PortalPreview'

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
        .from(
          '[data-float]',
          { y: 50, opacity: 0, scale: 0.94, duration: 1, stagger: 0.18, ease: 'power3.out' },
          0.8,
        )
      gsap.utils.toArray<HTMLElement>('[data-float]').forEach((el, i) => {
        gsap.to(el, {
          y: i % 2 ? 10 : -10,
          duration: 3 + i * 0.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.8,
        })
      })
      gsap.to('[data-hero="bg"] img', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('[data-hero="preview"]', {
        y: -50,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope: root, dependencies: [reduced] },
  )

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden bg-navy-900 pt-28 pb-20 text-white sm:pt-36 lg:pb-28"
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
        className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(8,26,40,0.96)_8%,rgba(21,59,85,0.86)_52%,rgba(21,59,85,0.55)_100%)]"
      />
      <div
        aria-hidden
        className="-z-10 absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-900 to-transparent"
      />
      <div className="container-public grid items-center gap-12 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="grid gap-7">
          <p
            data-hero="eyebrow"
            className="font-medium text-gold text-xs uppercase tracking-[0.2em] sm:text-sm"
          >
            Women’s Empowerment Principles
          </p>
          <h1 className="font-bold font-heading text-[2.5rem] leading-[1.06] sm:text-5xl xl:text-[3.5rem]">
            <span className="block overflow-hidden pb-1">
              <span data-hero="line" className="block">
                Turn commitment into
              </span>
            </span>
            <span className="block overflow-hidden pb-2">
              <span data-hero="line" className="block text-gold">
                measurable progress.
              </span>
            </span>
          </h1>
          <p data-hero="copy" className="max-w-xl text-lg text-white/80 leading-relaxed sm:text-xl">
            Connect your company with learning, practical tools, expert support and a community
            advancing gender equality.
          </p>
          <div data-hero="cta" className="flex flex-wrap gap-3">
            <Button asChild variant="gold" size="xl">
              <Link to="/join">
                Join WEPs <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline-light" size="xl">
              <Link to="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
        <div className="hidden pb-8 lg:block">
          <PortalPreview />
        </div>
      </div>
      <a
        href="#value"
        aria-label="Scroll to content"
        className="-translate-x-1/2 absolute bottom-6 left-1/2 hidden size-10 place-items-center rounded-full border border-white/30 text-white/80 transition hover:bg-white/10 sm:grid"
      >
        <ChevronDown className="size-5" aria-hidden />
      </a>
    </section>
  )
}
