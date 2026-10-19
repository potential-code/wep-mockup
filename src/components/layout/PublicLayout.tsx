import { OFFICIAL_LINKS } from '@shared/reference'
import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { ArrowRight, ArrowUpRight, Menu, X } from 'lucide-react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react'
import { type MouseEvent, useEffect, useState } from 'react'
import { SmoothScroll, scrollToTarget } from '@/components/motion/SmoothScroll'
import { CornerArcs, DotGrid, ForAllBars } from '@/components/shared/BrandMotif'
import { PartnerLogos, WepsLogo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Header links scroll to sections of the home page rather than opening separate pages. */
const NAV = [
  { label: 'About', hash: 'about' },
  { label: 'Principles', hash: 'principles' },
  { label: 'Journey', hash: 'journey' },
  { label: 'Portal', hash: 'portal' },
  { label: 'Resources', hash: 'resources' },
  { label: 'Clinics', hash: 'clinics' },
  { label: 'Community', hash: 'community' },
] as const

/** Scrolls to a home-page section, navigating home first when needed. */
function useSectionLink() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (hash: string) => (e: MouseEvent) => {
    e.preventDefault()
    if (pathname === '/') {
      scrollToTarget(`#${hash}`)
      history.replaceState(null, '', `#${hash}`)
    } else {
      navigate({ to: '/', hash })
    }
  }
}

/** Which home section is in view, for the header's active state. */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    if (!enabled) return setActive(null)
    const els = NAV.map((n) => document.getElementById(n.hash)).filter(
      (el): el is HTMLElement => !!el,
    )
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    for (const el of els) io.observe(el)
    const onTop = () => window.scrollY < 200 && setActive(null)
    window.addEventListener('scroll', onTop, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onTop)
    }
  }, [enabled])
  return active
}

export function PublicLayout() {
  return (
    <SmoothScroll>
      <PublicHeader />
      <main id="main">
        <Outlet />
      </main>
      <PublicFooter />
    </SmoothScroll>
  )
}

function PublicHeader() {
  const { pathname } = useLocation()
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 })
  const [compact, setCompact] = useState(false)
  const [open, setOpen] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setCompact(y > 40))
  const sectionLink = useSectionLink()
  const active = useActiveSection(pathname === '/')
  // biome-ignore lint/correctness/useExhaustiveDependencies: close the menu on navigation
  useEffect(() => setOpen(false), [pathname])
  // Home has a dark hero: header starts transparent there.
  const overHero = pathname === '/' && !compact

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        overHero
          ? 'bg-transparent py-4'
          : 'bg-navy/90 py-2.5 shadow-lg shadow-navy-900/25 backdrop-blur-xl',
      )}
    >
      {pathname === '/' ? (
        <motion.div
          aria-hidden
          style={{ scaleX: progress }}
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-gold via-[#f0cf8a] to-gold"
        />
      ) : null}
      <div className="container-public flex items-center gap-6">
        <Link
          to="/"
          className="shrink-0 rounded focus-visible:outline-white"
          aria-label="WEPs portal home"
        >
          <WepsLogo
            className={cn('transition-all duration-300', compact ? 'h-6 sm:h-7' : 'h-7 sm:h-9')}
          />
        </Link>
        <nav aria-label="Main" className="isolate ms-auto hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={`/#${n.hash}`}
              onClick={sectionLink(n.hash)}
              data-active={active === n.hash}
              aria-current={active === n.hash ? 'location' : undefined}
              className="nav-link group px-2.5 py-2 font-medium xl:px-3.5 text-sm text-white/80 transition-colors duration-300 hover:text-white data-[active=true]:text-white"
            >
              <span className="relative inline-block transition-transform duration-300 group-hover:-translate-y-px">
                {n.label}
              </span>
            </a>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-2 lg:ms-2">
          <Button
            asChild
            variant="ghost"
            className="nav-link hidden text-white hover:bg-transparent hover:text-white sm:inline-flex"
          >
            <Link to="/sign-in">Sign in</Link>
          </Button>
          <Button asChild variant="gold" className="group hidden rounded-full px-5 sm:inline-flex">
            <Link to="/join">
              Join WEPs{' '}
              <ArrowRight
                className="transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.nav
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-white/10 border-t bg-navy lg:hidden"
          >
            <div className="container-public grid gap-1 py-4">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.label}
                  href={`/#${n.hash}`}
                  onClick={(e) => {
                    setOpen(false)
                    sectionLink(n.hash)(e)
                  }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center justify-between rounded-lg px-3 py-3 font-medium text-white/90 hover:bg-white/10"
                >
                  {n.label}
                  <ArrowRight className="size-4 text-gold" aria-hidden />
                </motion.a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="outline-light">
                  <Link to="/sign-in">Sign in</Link>
                </Button>
                <Button asChild variant="gold">
                  <Link to="/join">Join WEPs</Link>
                </Button>
              </div>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

function PublicFooter() {
  const sectionLink = useSectionLink()
  return (
    <footer className="relative isolate overflow-hidden bg-navy-900 text-white/80">
      <CornerArcs corner="tr" size={360} className="-z-10 opacity-70" />
      <ForAllBars className="-bottom-16 -left-10 -z-10" size={260} />
      <DotGrid className="-z-10 right-10 bottom-24 hidden md:block" cols={10} rows={4} />
      <div
        aria-hidden
        className="-z-10 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />
      <div className="container-public grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="grid content-start gap-5">
          <WepsLogo className="h-8 sm:h-9" />
          <p className="max-w-sm text-sm leading-relaxed">
            The Women’s Empowerment Principles are established by UN Women and the UN Global Compact
            to help business advance gender equality in the workplace, marketplace and community.
          </p>
          <PartnerLogos />
        </div>
        <div className="grid content-start gap-3 text-sm">
          <p className="font-heading font-semibold text-white">Explore</p>
          {NAV.map((n) => (
            <a
              key={n.hash}
              href={`/#${n.hash}`}
              onClick={sectionLink(n.hash)}
              className="w-fit transition-all hover:translate-x-1 hover:text-gold"
            >
              {n.label}
            </a>
          ))}
        </div>
        <FooterCol
          title="Get started"
          links={[
            { label: 'Join WEPs', to: '/join' },
            { label: 'Application status', to: '/application-status' },
            { label: 'Sign in', to: '/sign-in' },
          ]}
        />
        <div className="grid content-start gap-3 text-sm">
          <p className="font-heading font-semibold text-white">Contact</p>
          <a href={OFFICIAL_LINKS.contact} className="w-fit transition-colors hover:text-gold">
            weps@unwomen.org
          </a>
          <a
            href={OFFICIAL_LINKS.about}
            target="_blank"
            rel="noreferrer"
            className="w-fit transition-colors hover:text-gold"
          >
            Official site: weps.org
          </a>
        </div>
      </div>
      <div className="border-white/10 border-t">
        <div className="container-public flex flex-wrap items-center justify-between gap-3 py-5 text-white/60 text-xs">
          <p>
            Portal mockup · Proposed features and illustrative demo data for review. Not a live WEPs
            service.
          </p>
          <a
            href="https://www.potential.com"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1 text-white/70 transition-colors hover:text-white"
          >
            Powered by{' '}
            <span className="font-semibold text-gold group-hover:underline">Potential.com</span>
            <ArrowUpRight
              className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden
            />
          </a>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div className="grid content-start gap-3 text-sm">
      <p className="font-heading font-semibold text-white">{title}</p>
      {links.map((l) => (
        <Link
          key={l.label}
          to={l.to}
          className="w-fit transition-all hover:translate-x-1 hover:text-gold"
        >
          {l.label}
        </Link>
      ))}
    </div>
  )
}
