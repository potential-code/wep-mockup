import { OFFICIAL_LINKS } from '@shared/reference'
import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { ArrowRight, Menu, X } from 'lucide-react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useState } from 'react'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { PartnerLogos, WepsLogo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'About', to: '/about' },
  { label: 'Principles', to: '/about', hash: 'principles' },
  { label: 'Resources', to: '/resources' },
  { label: 'Clinics', to: '/clinics' },
  { label: 'Community', to: '/directory' },
] as const

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
  const { scrollY } = useScroll()
  const [compact, setCompact] = useState(false)
  const [open, setOpen] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setCompact(y > 40))
  // biome-ignore lint/correctness/useExhaustiveDependencies: close the menu on navigation
  useEffect(() => setOpen(false), [pathname])
  // Home and About have dark heroes: header starts transparent there.
  const overHero = (pathname === '/' || pathname === '/about') && !compact

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        overHero
          ? 'bg-transparent py-4'
          : 'bg-navy/95 py-2.5 shadow-lg shadow-navy-900/20 backdrop-blur',
      )}
    >
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
        <nav aria-label="Main" className="ms-auto hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              hash={'hash' in n ? n.hash : undefined}
              className="relative rounded-lg px-3 py-2 font-medium text-sm text-white/85 transition-colors hover:text-white"
              activeProps={{
                className:
                  '!text-white after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gold',
              }}
              activeOptions={{ exact: true, includeHash: 'hash' in n }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-2 lg:ms-2">
          <Button
            asChild
            variant="ghost"
            className="hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            <Link to="/sign-in">Sign in</Link>
          </Button>
          <Button asChild variant="gold" className="hidden sm:inline-flex">
            <Link to="/join">
              Join WEPs <ArrowRight aria-hidden />
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
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  to={n.to}
                  hash={'hash' in n ? n.hash : undefined}
                  className="rounded-lg px-3 py-3 font-medium text-white/90 hover:bg-white/10"
                >
                  {n.label}
                </Link>
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
  return (
    <footer className="bg-navy-900 text-white/80">
      <div className="container-public grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="grid content-start gap-5">
          <WepsLogo className="h-8 sm:h-9" />
          <p className="max-w-sm text-sm leading-relaxed">
            The Women’s Empowerment Principles are established by UN Women and the UN Global Compact
            to help business advance gender equality in the workplace, marketplace and community.
          </p>
          <PartnerLogos />
        </div>
        <FooterCol
          title="Explore"
          links={[
            { label: 'About the WEPs', to: '/about' },
            { label: 'Resources', to: '/resources' },
            { label: 'Clinics and events', to: '/clinics' },
            { label: 'Company directory', to: '/directory' },
          ]}
        />
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
          <a href={OFFICIAL_LINKS.contact} className="hover:text-white">
            weps@unwomen.org
          </a>
          <a
            href={OFFICIAL_LINKS.about}
            target="_blank"
            rel="noreferrer"
            className="hover:text-white"
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
          <div className="flex gap-4">
            <span>Accessibility (placeholder)</span>
            <span>Privacy (placeholder)</span>
            <span>Terms (placeholder)</span>
          </div>
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
        <Link key={l.label} to={l.to} className="hover:text-white">
          {l.label}
        </Link>
      ))}
    </div>
  )
}
