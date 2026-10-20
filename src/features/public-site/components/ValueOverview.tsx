import { ArrowRight, BarChart3, GraduationCap, ListChecks, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { scrollToTarget } from '@/components/motion/SmoothScroll'
import { images } from '@/config/images'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

const THEMES: {
  n: string
  title: string
  text: string
  points: string[]
  icon: LucideIcon
  image: { src: string; alt: string }
  target: string
  cta: string
}[] = [
  {
    n: '01',
    title: 'Build capability',
    text: 'Department-based learning, official guidance and live expert clinics for every team.',
    points: ['Pathways by department', 'Official WEPs guidance', 'Live expert clinics'],
    icon: GraduationCap,
    image: images.sections.buildCapability,
    target: '#resources',
    cta: 'Explore resources',
  },
  {
    n: '02',
    title: 'Put plans into action',
    text: 'Turn a baseline into an action plan with owners, support and practical templates.',
    points: ['Baseline assessment', 'Owners and due dates', 'Templates and mentoring'],
    icon: ListChecks,
    image: images.sections.plansIntoAction,
    target: '#clinics',
    cta: 'See clinics and events',
  },
  {
    n: '03',
    title: 'Track progress',
    text: 'Keep evidence in one place and report on the WEPs indicators with confidence.',
    points: ['Evidence in one place', 'Progress by department', 'Annual WEPs reporting'],
    icon: BarChart3,
    image: images.sections.trackProgress,
    target: '#portal',
    cta: 'See inside the portal',
  },
]

const EASE = [0.22, 1, 0.36, 1] as const
const AUTOPLAY_MS = 6000

/**
 * Three expanding image panels. Hover, focus or tap a panel to open it; the others fold to
 * a narrow strip with a vertical title. Advances on its own until the visitor interacts.
 */
export function ValueOverview() {
  const reduced = usePrefersReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, { margin: '-20% 0px' })
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const autoplay = !reduced && !paused && inView

  // `active` restarts the timer after each step.
  // biome-ignore lint/correctness/useExhaustiveDependencies: active is the restart signal
  useEffect(() => {
    if (!autoplay) return
    const t = window.setTimeout(() => setActive((a) => (a + 1) % THEMES.length), AUTOPLAY_MS)
    return () => window.clearTimeout(t)
  }, [autoplay, active])

  const open = (i: number) => {
    setPaused(true)
    setActive(i)
  }

  return (
    <motion.div
      ref={root}
      initial={reduced ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: EASE }}
      className="flex flex-col gap-3 md:h-[480px] md:flex-row"
      onMouseLeave={() => setPaused(false)}
    >
      {THEMES.map((t, i) => (
        <Panel
          key={t.n}
          theme={t}
          active={i === active}
          autoplay={autoplay && i === active}
          reduced={reduced}
          onOpen={() => open(i)}
        />
      ))}
    </motion.div>
  )
}

function Panel({
  theme: t,
  active,
  autoplay,
  reduced,
  onOpen,
}: {
  theme: (typeof THEMES)[number]
  active: boolean
  autoplay: boolean
  reduced: boolean
  onOpen: () => void
}) {
  const Icon = t.icon
  const id = `value-${t.n}`
  return (
    <motion.div
      animate={{ flexGrow: active ? 3.4 : 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.7, ease: EASE }}
      onMouseEnter={onOpen}
      className={cn(
        'group relative isolate min-h-24 basis-0 overflow-hidden rounded-3xl bg-navy-900 text-white shadow-lift',
        active ? 'min-h-[420px] md:min-h-0' : 'md:min-w-24',
      )}
    >
      <motion.img
        src={t.image.src}
        alt={t.image.alt}
        loading="lazy"
        animate={{ scale: active ? 1.04 : 1.18 }}
        transition={{ duration: 1.2, ease: EASE }}
        className="-z-20 absolute inset-0 size-full object-cover"
      />
      <div
        className={cn(
          '-z-10 absolute inset-0 transition-colors duration-700',
          active
            ? 'bg-gradient-to-t from-navy-900 via-navy-900/55 to-navy-900/5'
            : 'bg-[linear-gradient(180deg,rgba(0,84,135,0.86),rgba(23,36,58,0.92))]',
        )}
      />

      {/* The whole panel is the toggle; the CTA inside is a separate control. */}
      <button
        type="button"
        aria-expanded={active}
        aria-controls={id}
        onClick={onOpen}
        onFocus={onOpen}
        className="absolute inset-0 z-0 rounded-3xl focus-visible:outline-2 focus-visible:outline-white focus-visible:-outline-offset-4"
      >
        <span className="sr-only">{t.title}</span>
      </button>

      <div className="pointer-events-none relative flex h-full flex-col p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <motion.span
            animate={active ? { rotate: 0, scale: 1 } : { rotate: -8, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className={cn(
              'grid size-11 shrink-0 place-items-center rounded-2xl transition-colors duration-500',
              active ? 'bg-coral-600 text-white' : 'bg-white/12 text-white ring-1 ring-white/20',
            )}
          >
            <Icon className="size-5" aria-hidden />
          </motion.span>
          <span className="font-heading text-sm text-white/90 tabular-nums">{t.n}</span>
        </div>

        {/* Folded: vertical title on desktop, plain title on mobile. */}
        {!active ? (
          <p
            aria-hidden
            className="mt-auto font-heading font-medium text-lg md:mx-auto md:mt-8 md:rotate-180 md:text-xl md:[writing-mode:vertical-rl]"
          >
            {t.title}
          </p>
        ) : null}

        <AnimatePresence initial={false}>
          {active ? (
            <motion.div
              id={id}
              key="open"
              initial={reduced ? false : 'hidden'}
              animate="show"
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } } }}
              className="mt-auto grid max-w-lg gap-3"
            >
              {[
                <h3 key="h" className="font-heading font-medium text-2xl sm:text-3xl">
                  {t.title}
                </h3>,
                <span key="r" aria-hidden className="block h-0.5 w-12 bg-coral" />,
                <p key="p" className="text-white/90 leading-relaxed">
                  {t.text}
                </p>,
                <ul key="l" className="flex flex-wrap gap-2">
                  {t.points.map((pt) => (
                    <li
                      key={pt}
                      className="rounded-full bg-white/12 px-3 py-1 text-sm ring-1 ring-white/20 backdrop-blur"
                    >
                      {pt}
                    </li>
                  ))}
                </ul>,
                <button
                  key="c"
                  type="button"
                  onClick={() => scrollToTarget(t.target)}
                  className="group/cta pointer-events-auto mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 font-medium text-navy text-sm transition-colors hover:bg-coral-600 hover:text-white"
                >
                  {t.cta}
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1"
                    aria-hidden
                  />
                </button>,
              ].map((el) => (
                <motion.div
                  key={el.key}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                  }}
                >
                  {el}
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Autoplay progress */}
      {active ? (
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
          <motion.div
            key={autoplay ? 'run' : 'idle'}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: autoplay ? 1 : 0 }}
            transition={{ duration: autoplay ? AUTOPLAY_MS / 1000 : 0.3, ease: 'linear' }}
            className="h-full origin-left bg-coral"
          />
        </div>
      ) : null}
    </motion.div>
  )
}
