import { OFFICIAL_LINKS, PRINCIPLES } from '@shared/reference'
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { GearCluster } from '@/components/shared/BrandMotif'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

/** Tint per Principle, sampled from the official icon artwork. */
const TINT = ['#d9c7ea', '#b4b1e3', '#a8cbea', '#a4dcd5', '#b6d98d', '#f0dd7a', '#f5c38c']
const DURATION = 7000

/**
 * The seven Principles as an interactive showcase: a selectable index on the left and a
 * large detail panel on the right. Auto-advances while in view; pauses on hover or focus.
 */
export function PrincipleCards() {
  const reduced = usePrefersReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, { amount: 0.4 })
  const [index, setIndex] = useState(0)
  const [hold, setHold] = useState(false)
  const [paused, setPaused] = useState(false)
  const [dir, setDir] = useState(1)
  const running = inView && !hold && !paused && !reduced

  const go = (n: number) => {
    const next = (n + PRINCIPLES.length) % PRINCIPLES.length
    setDir(next > index || (index === PRINCIPLES.length - 1 && next === 0) ? 1 : -1)
    setIndex(next)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: restart the timer on each change
  useEffect(() => {
    if (!running) return
    const t = window.setTimeout(() => go(index + 1), DURATION)
    return () => window.clearTimeout(t)
  }, [running, index])

  // Mobile: keep the active chip visible in the horizontal strip (no vertical page jump).
  const list = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const ol = list.current
    const li = ol?.children[index] as HTMLElement | undefined
    if (!ol || !li || ol.scrollWidth <= ol.clientWidth) return
    ol.scrollTo({ left: li.offsetLeft - 16, behavior: reduced ? 'auto' : 'smooth' })
  }, [index, reduced])

  const p = PRINCIPLES[index] ?? PRINCIPLES[0]
  if (!p) return null
  const tint = TINT[index] ?? TINT[0]

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover only pauses auto-play
    <div
      ref={root}
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocusCapture={() => setHold(true)}
      onBlurCapture={() => setHold(false)}
      className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10"
    >
      {/* index */}
      <motion.ol
        ref={list}
        initial={reduced ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
        className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:overflow-visible lg:px-0 lg:pb-0"
        aria-label="The seven Principles"
      >
        {PRINCIPLES.map((item, i) => {
          const active = i === index
          return (
            <motion.li
              key={item.id}
              variants={{
                hidden: { opacity: 0, x: -24 },
                visible: { opacity: 1, x: 0, transition: { ease: [0.22, 1, 0.36, 1] } },
              }}
              className="shrink-0 snap-start"
            >
              <button
                type="button"
                onClick={() => go(i)}
                aria-pressed={active}
                className={cn(
                  'group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl px-4 py-3 text-left transition-colors duration-300',
                  active ? 'text-white' : 'text-navy hover:bg-white hover:shadow-card',
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="principle-active"
                    transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                    className="-z-0 absolute inset-0 rounded-2xl bg-navy shadow-lift"
                  />
                ) : null}
                <span
                  className={cn(
                    'relative font-semibold font-heading text-sm tabular-nums transition-colors',
                    active ? 'text-coral-300' : 'text-navy/35 group-hover:text-blue',
                  )}
                >
                  0{item.id}
                </span>
                <img
                  src={item.icon}
                  alt=""
                  className={cn(
                    'relative size-9 rounded-xl transition-transform duration-300',
                    active ? 'scale-110' : 'group-hover:scale-105',
                  )}
                />
                <span className="relative whitespace-nowrap font-heading font-medium lg:whitespace-normal">
                  {item.short}
                </span>
                {active && running ? (
                  <motion.span
                    key={`bar-${index}`}
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: DURATION / 1000, ease: 'linear' }}
                    className="absolute inset-x-4 bottom-1.5 h-0.5 origin-left rounded-full bg-coral"
                  />
                ) : null}
              </button>
            </motion.li>
          )
        })}
      </motion.ol>

      {/* detail */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="relative isolate flex min-h-[460px] flex-col overflow-hidden rounded-[2rem] bg-navy-900 p-7 text-white shadow-lift sm:p-10"
      >
        <motion.div
          aria-hidden
          animate={{ backgroundColor: tint }}
          transition={{ duration: 0.8 }}
          className="-z-10 -top-24 -right-24 absolute size-80 rounded-full opacity-30 blur-3xl"
        />
        <GearCluster size={300} className="-z-10 -bottom-20 -right-20" />
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={p.id}
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * 40 }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * -40 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-1 flex-col"
            aria-live="polite"
          >
            <span
              aria-hidden
              className="-right-2 absolute bottom-0 font-medium font-heading text-[10rem] text-transparent leading-none [-webkit-text-stroke:1.5px_rgba(255,255,255,0.12)] sm:text-[14rem]"
            >
              {p.id}
            </span>
            <motion.img
              src={p.icon}
              alt=""
              initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="size-20 rounded-full shadow-[0_0_0_8px_rgba(255,255,255,0.06),0_12px_40px_-8px_rgba(0,0,0,0.6)] sm:size-24"
            />
            <p className="mt-8 flex items-center gap-3 font-semibold text-coral-300 text-xs uppercase tracking-[0.2em]">
              <span aria-hidden className="h-px w-8 bg-coral" /> Principle {p.id} of 7
            </p>
            <h3 className="mt-3 max-w-lg text-balance font-medium font-heading text-2xl leading-tight sm:text-3xl">
              {p.title}
            </h3>
            <p className="mt-4 max-w-lg text-lg text-white/75 leading-relaxed">{p.description}</p>
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="group mt-6 inline-flex w-fit items-center gap-1.5 font-medium text-coral-300"
            >
              <span className="bg-[length:0%_1px] bg-gradient-to-r bg-left-bottom bg-no-repeat from-coral to-coral pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
                Official principle page
              </span>
              <ArrowUpRight
                className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
              <span className="sr-only">(opens weps.org)</span>
            </a>
          </motion.div>
        </AnimatePresence>

        <div className="relative mt-8 flex items-center justify-between gap-4 border-white/10 border-t pt-6">
          <div className="flex gap-1.5" aria-hidden>
            {PRINCIPLES.map((item, i) => (
              <span
                key={item.id}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-500',
                  i === index ? 'w-8 bg-coral' : 'w-1.5 bg-white/25',
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!reduced ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPaused((v) => !v)}
                className="rounded-full text-white/90 hover:bg-white/10 hover:text-white"
                aria-label={paused ? 'Resume auto-play' : 'Pause auto-play'}
              >
                {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
              </Button>
            ) : null}
            <Button
              variant="outline-light"
              size="icon"
              onClick={() => go(index - 1)}
              className="rounded-full"
              aria-label="Previous principle"
            >
              <ChevronLeft aria-hidden />
            </Button>
            <Button
              variant="coral"
              size="icon"
              onClick={() => go(index + 1)}
              className="rounded-full"
              aria-label="Next principle"
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
        </div>
      </motion.div>

      <p className="text-muted-foreground text-sm lg:col-span-2">
        Established by UN Women and the UN Global Compact.{' '}
        <a
          href={OFFICIAL_LINKS.about}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-blue underline-offset-4 hover:underline"
        >
          Read all seven Principles in full on weps.org
        </a>
      </p>
    </div>
  )
}
