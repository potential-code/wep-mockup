import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  BookOpenCheck,
  CalendarCheck,
  FileBarChart2,
  type LucideIcon,
} from 'lucide-react'
import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'
import { CornerArcs, DotGrid, EdgeRule, ForAllBars } from '@/components/shared/BrandMotif'
import { WepsLogo } from '@/components/shared/Logo'
import { images } from '@/config/images'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

export interface AuthBullet {
  icon: LucideIcon
  text: string
}

const DEFAULT_BULLETS: AuthBullet[] = [
  { icon: BookOpenCheck, text: 'Learning pathways for every department' },
  { icon: CalendarCheck, text: 'Live clinics and one-to-one expert time' },
  { icon: FileBarChart2, text: 'Annual WEPs reporting, built from your evidence' },
]

const ease = [0.22, 1, 0.36, 1] as const
const panel: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
}
const rise: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}

/**
 * Split layout for sign-in, password reset, invitation and Join. The image panel stays fixed on
 * desktop and collapses to a band on mobile. `wide` gives long forms (Join) more room.
 */
export function AuthShell({
  children,
  eyebrow = 'Women’s Empowerment Principles',
  headline = 'Your company’s WEPs work, in one place.',
  text = 'Learning, expert support and reporting connected around one company record.',
  bullets = DEFAULT_BULLETS,
  image = images.hero.signin,
  wide = false,
}: {
  children: ReactNode
  eyebrow?: string
  headline?: string
  text?: string
  bullets?: AuthBullet[]
  image?: { src: string }
  wide?: boolean
}) {
  const reduced = usePrefersReducedMotion()
  return (
    <div
      className={cn(
        'grid min-h-svh grid-cols-1',
        wide
          ? 'lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] xl:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]'
          : 'lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]',
      )}
    >
      <aside className="relative isolate flex flex-col justify-between overflow-hidden bg-navy-900 px-6 py-6 text-white sm:px-10 lg:sticky lg:top-0 lg:h-svh lg:self-start lg:py-10">
        <motion.img
          src={image.src}
          alt=""
          className="-z-20 absolute inset-0 size-full object-cover object-top"
          initial={{ scale: 1.15 }}
          animate={reduced ? { scale: 1.05 } : { scale: [1.15, 1.04, 1.1] }}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  duration: 24,
                  ease: 'easeInOut',
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: 'reverse',
                }
          }
        />
        <div className="-z-10 absolute inset-0 bg-[linear-gradient(160deg,rgba(8,26,40,0.94)_0%,rgba(21,59,85,0.82)_50%,rgba(12,37,55,0.7)_100%)]" />
        <div className="-z-10 absolute inset-0 bg-[radial-gradient(60%_50%_at_0%_100%,rgba(214,164,74,0.22),transparent_70%)]" />
        <CornerArcs corner="tr" tone="dark" size={300} className="-z-10 opacity-90" />
        <ForAllBars
          tone="dark"
          size={260}
          className="-z-10 -right-16 bottom-24 hidden opacity-80 lg:block"
        />
        <DotGrid tone="dark" cols={6} rows={4} className="-z-10 top-24 right-10 hidden lg:block" />
        <EdgeRule tone="dark" className="bottom-0" />

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <Link to="/" aria-label="WEPs portal home" className="block w-fit rounded">
            <WepsLogo className="h-8 sm:h-10" />
          </Link>
        </motion.div>

        <motion.div
          variants={panel}
          initial="hidden"
          animate="show"
          className="mt-8 mb-2 grid max-w-md gap-4 lg:mb-6"
        >
          <motion.p
            variants={rise}
            className="flex items-center gap-3 font-medium text-gold text-xs uppercase tracking-[0.2em]"
          >
            <span aria-hidden className="h-px w-8 bg-gold" />
            {eyebrow}
          </motion.p>
          <motion.h2
            variants={rise}
            className="text-balance font-bold font-heading text-2xl leading-tight sm:text-3xl lg:text-4xl"
          >
            {headline}
          </motion.h2>
          <motion.p variants={rise} className="hidden text-white/80 sm:block lg:text-lg">
            {text}
          </motion.p>
          {bullets.length ? (
            <motion.ul variants={panel} className="mt-2 hidden gap-2.5 lg:grid">
              {bullets.map((b) => (
                <motion.li
                  key={b.text}
                  variants={rise}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white/90 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-md"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gold/15 text-gold ring-1 ring-gold/30">
                    <b.icon className="size-4" aria-hidden />
                  </span>
                  {b.text}
                </motion.li>
              ))}
            </motion.ul>
          ) : null}
        </motion.div>
      </aside>

      <main
        id="main"
        className="relative isolate flex min-w-0 flex-col overflow-hidden bg-background"
      >
        <div
          aria-hidden
          className="-z-10 absolute inset-0 bg-[radial-gradient(50%_40%_at_100%_0%,rgba(22,124,179,0.10),transparent_70%),radial-gradient(45%_35%_at_0%_100%,rgba(214,164,74,0.12),transparent_70%)]"
        />
        <CornerArcs corner="tr" tone="light" size={240} className="-z-10" />
        <DotGrid tone="light" cols={7} rows={4} className="-z-10 bottom-8 left-6 hidden sm:block" />
        <div className="px-6 pt-6 sm:px-10 lg:px-14 lg:pt-8">
          <Link
            to="/"
            className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-transparent px-3 text-muted-foreground text-sm transition-all hover:border-border hover:bg-white hover:text-navy hover:shadow-card -ms-3"
          >
            <ArrowLeft
              className="size-4 transition-transform group-hover:-translate-x-0.5"
              aria-hidden
            />{' '}
            Back to the public site
          </Link>
        </div>
        <div
          className={cn(
            'flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:px-10 lg:px-14',
            !wide && 'lg:items-center',
          )}
        >
          <div
            className={cn(
              'w-full min-w-0',
              wide ? 'max-w-3xl' : 'max-w-md',
              // staggered entrance for short forms. Not on wide pages: the lingering transform
              // would trap Join's fixed mobile action bar.
              !wide &&
                '[&>*>*]:fill-mode-both [&>*>*]:animate-in [&>*>*]:fade-in [&>*>*]:slide-in-from-bottom-3 [&>*>*]:duration-700',
              !wide &&
                '[&>*>*:nth-child(2)]:delay-100 [&>*>*:nth-child(3)]:delay-200 [&>*>*:nth-child(4)]:delay-300 [&>*>*:nth-child(n+5)]:delay-500',
            )}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
