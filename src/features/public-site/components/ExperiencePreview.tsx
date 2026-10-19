import {
  BookOpen,
  CalendarCheck,
  Check,
  FileCheck2,
  Lock,
  type LucideIcon,
  TrendingUp,
  Unlock,
} from 'lucide-react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { CountUp } from '@/components/motion/CountUp'
import { CornerArcs } from '@/components/shared/BrandMotif'
import { images } from '@/config/images'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

interface Chapter {
  key: string
  icon: LucideIcon
  label: string
  title: string
  text: string
  points: string[]
  screen: () => ReactNode
}

const CHAPTERS: Chapter[] = [
  {
    key: 'progress',
    icon: TrendingUp,
    label: 'Company progress',
    title: 'See your whole team move from commitment to action',
    text: 'One view of who is activated, which pathways are complete and what needs attention next.',
    points: ['Activation by department', 'Pathway completion', 'Priorities with owners'],
    screen: ProgressScreen,
  },
  {
    key: 'learning',
    icon: BookOpen,
    label: 'Learning',
    title: 'Short pathways shaped around each department',
    text: 'HR, procurement and marketing teams learn what the Principles mean for their own work, and earn points as they go.',
    points: ['Five-module pathways', 'Points for each module', 'Certificates on completion'],
    screen: LearningScreen,
  },
  {
    key: 'clinics',
    icon: CalendarCheck,
    label: 'Clinics',
    title: 'Preparation unlocks live expert time',
    text: 'Completing a pathway opens clinics and webinars, so every session with an expert is used well.',
    points: ['Unlocks by pathway', 'Book with points', 'Notes shared after'],
    screen: ClinicsScreen,
  },
  {
    key: 'report',
    icon: FileCheck2,
    label: 'Annual report',
    title: 'Report on the WEPs indicators with confidence',
    text: 'Draft each section with evidence already gathered across the year, then submit for review.',
    points: ['Section-by-section drafting', 'Evidence linked in place', 'Year-on-year comparison'],
    screen: ReportScreen,
  },
]

/**
 * "Inside the portal" as a scroll-driven tour. Desktop: chapters scroll on the left while a
 * sticky app window on the right swaps to the matching screen. Mobile: each chapter shows
 * its own screen inline.
 */
export function ExperiencePreview() {
  const [active, setActive] = useState(0)
  const chapter = CHAPTERS[active] ?? CHAPTERS[0]
  if (!chapter) return null
  return (
    <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
      <div className="grid gap-10 lg:gap-0">
        {CHAPTERS.map((c, i) => (
          <ChapterBlock
            key={c.key}
            chapter={c}
            index={i}
            active={i === active}
            onActive={setActive}
          />
        ))}
      </div>
      <div className="hidden lg:block">
        <div className="sticky top-28">
          <AppWindow activeKey={chapter.key} active={active}>
            <chapter.screen />
          </AppWindow>
        </div>
      </div>
    </div>
  )
}

function ChapterBlock({
  chapter: c,
  index,
  active,
  onActive,
}: {
  chapter: Chapter
  index: number
  active: boolean
  onActive: (i: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    if (inView) onActive(index)
  }, [inView, index, onActive])

  return (
    <div ref={ref} className="lg:flex lg:min-h-[70vh] lg:items-center">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className={cn(
          'relative grid gap-4 border-s-2 ps-6 transition-all duration-500',
          active ? 'border-gold lg:opacity-100' : 'border-navy/10 lg:opacity-45',
        )}
      >
        <span
          className={cn(
            'inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 font-semibold text-xs uppercase tracking-[0.14em] transition-colors duration-500',
            active ? 'bg-navy text-white' : 'bg-blue-50 text-blue',
          )}
        >
          <c.icon className="size-3.5" aria-hidden /> 0{index + 1} · {c.label}
        </span>
        <h3 className="text-balance font-bold font-heading text-2xl text-navy leading-tight sm:text-3xl">
          {c.title}
        </h3>
        <p className="text-lg text-muted-foreground leading-relaxed">{c.text}</p>
        <ul className="grid gap-2 text-navy text-sm">
          {c.points.map((p, i) => (
            <motion.li
              key={p}
              initial={reduced ? false : { opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.08, ease: EASE }}
              className="flex items-center gap-2.5"
            >
              <span className="grid size-5 place-items-center rounded-full bg-gold/20 text-gold-700">
                <Check className="size-3" strokeWidth={3} aria-hidden />
              </span>
              {p}
            </motion.li>
          ))}
        </ul>
        {/* mobile: screen inline */}
        <div className="mt-2 lg:hidden">
          <AppWindow activeKey={c.key} active={index}>
            <c.screen />
          </AppWindow>
        </div>
      </motion.div>
    </div>
  )
}

/** A stylised portal window: title bar, slim nav rail and a content area that swaps. */
function AppWindow({
  activeKey,
  active,
  children,
}: {
  activeKey: string
  active: number
  children: ReactNode
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="-inset-6 -z-10 absolute rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_70%_30%,rgba(22,124,179,0.18),transparent_70%),radial-gradient(50%_50%_at_20%_90%,rgba(214,164,74,0.16),transparent_70%)]"
      />
      <div className="overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-lift">
        <div className="flex items-center gap-2 border-b bg-surface px-4 py-3">
          <span className="size-2.5 rounded-full bg-[#ff6159]" />
          <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="size-2.5 rounded-full bg-[#28c941]" />
          <span className="ms-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-muted-foreground text-xs shadow-[var(--shadow-field)]">
            WEPs portal · {CHAPTERS.find((c) => c.key === activeKey)?.label}
          </span>
        </div>
        <div className="flex min-h-[380px]">
          <div className="relative isolate hidden w-14 shrink-0 flex-col items-center gap-3 overflow-hidden bg-navy py-4 sm:flex">
            <CornerArcs corner="bl" size={120} className="-z-10" />
            {CHAPTERS.map((c, i) => (
              <span
                key={c.key}
                className={cn(
                  'relative grid size-9 place-items-center rounded-xl text-white/60 transition-colors duration-300',
                  i === active && 'text-gold',
                )}
              >
                {i === active ? (
                  <motion.span
                    layoutId="app-rail"
                    className="absolute inset-0 rounded-xl bg-white/12"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                ) : null}
                <c.icon className="relative size-4" aria-hidden />
              </span>
            ))}
          </div>
          <div className="relative flex-1 overflow-hidden p-5 sm:p-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeKey}
                initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <p className="mt-3 text-end text-[11px] text-muted-foreground uppercase tracking-wider">
        Illustrative preview · proposed portal
      </p>
    </div>
  )
}

function Bar({
  value,
  delay = 0,
  className,
}: {
  value: number
  delay?: number
  className?: string
}) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-secondary', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, delay, ease: EASE }}
        className="h-full rounded-full bg-[linear-gradient(90deg,var(--blue),#5fb3dc)]"
      />
    </div>
  )
}

function Ring({ value }: { value: number }) {
  const c = 2 * Math.PI * 42
  return (
    <svg
      viewBox="0 0 100 100"
      className="-rotate-90 size-28"
      role="img"
      aria-label={`${value} percent`}
    >
      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--secondary)" strokeWidth="10" />
      <motion.circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - value / 100) }}
        transition={{ duration: 1.2, ease: EASE }}
      />
    </svg>
  )
}

function ProgressScreen() {
  const depts = [
    ['Human resources', 92],
    ['Procurement', 70],
    ['Marketing', 58],
    ['Operations', 45],
  ] as const
  return (
    <div className="grid gap-5">
      <p className="font-heading font-semibold text-navy">Company progress</p>
      <div className="flex items-center gap-5">
        <div className="relative">
          <Ring value={75} />
          <p className="absolute inset-0 grid place-items-center font-bold font-heading text-2xl text-navy">
            <CountUp value={75} suffix="%" />
          </p>
        </div>
        <div>
          <p className="font-semibold text-navy">Team activated</p>
          <p className="text-muted-foreground text-sm">18 of 24 invited colleagues</p>
          <p className="mt-2 inline-flex rounded-full bg-success-soft px-2.5 py-0.5 font-medium text-success text-xs">
            +4 this month
          </p>
        </div>
      </div>
      <div className="grid gap-3">
        {depts.map(([d, v], i) => (
          <div key={d} className="grid gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-navy">{d}</span>
              <span className="font-semibold text-navy">{v}%</span>
            </div>
            <Bar value={v} delay={0.2 + i * 0.1} />
          </div>
        ))}
      </div>
    </div>
  )
}

function LearningScreen() {
  return (
    <div className="grid gap-4">
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={images.courses.fairProgressionPay.src}
          alt=""
          loading="lazy"
          className="h-36 w-full object-cover"
        />
        <span className="absolute start-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-medium text-navy text-xs">
          HR pathway
        </span>
      </div>
      <div>
        <p className="font-heading font-semibold text-lg text-navy">Fair progression and pay</p>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-muted-foreground">Module 3 of 5</span>
          <span className="font-semibold text-navy">
            <CountUp value={60} suffix="%" />
          </span>
        </div>
        <Bar value={60} className="mt-2" />
      </div>
      <ol className="grid gap-2">
        {['Why pay gaps persist', 'Reading your pay data', 'Setting fair bands'].map((m, i) => (
          <motion.li
            key={m}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            className="flex items-center gap-3 rounded-xl border bg-white px-3 py-2 text-sm"
          >
            <span
              className={cn(
                'grid size-6 place-items-center rounded-full text-xs',
                i < 2 ? 'bg-success text-white' : 'border-2 border-blue text-blue',
              )}
            >
              {i < 2 ? <Check className="size-3.5" aria-hidden /> : i + 1}
            </span>
            <span className="flex-1 text-navy">{m}</span>
            <span className="font-medium text-gold-700 text-xs">+25 pts</span>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}

function ClinicsScreen() {
  return (
    <div className="grid gap-4">
      <p className="font-heading font-semibold text-navy">Clinic access</p>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="flex items-start gap-3 rounded-2xl bg-success-soft p-4 ring-1 ring-success/20"
      >
        <motion.span
          initial={{ rotate: -30, scale: 0.6 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="grid size-10 place-items-center rounded-xl bg-success text-white"
        >
          <Unlock className="size-5" aria-hidden />
        </motion.span>
        <div>
          <p className="font-semibold text-navy">Gender-responsive procurement clinic</p>
          <p className="text-muted-foreground text-sm">
            Unlocked · Wed 4 Nov · 14:00 · 5 places left
          </p>
        </div>
      </motion.div>
      <div className="flex items-start gap-3 rounded-2xl bg-secondary p-4">
        <span className="grid size-10 place-items-center rounded-xl bg-white text-muted-foreground">
          <Lock className="size-5" aria-hidden />
        </span>
        <div className="flex-1">
          <p className="font-semibold text-navy">Inclusive hiring webinar</p>
          <p className="text-muted-foreground text-sm">One lesson left to unlock</p>
          <Bar value={80} className="mt-2" />
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border bg-white p-4">
        <img
          src={images.people.sofiaBennett.src}
          alt=""
          className="size-10 rounded-full object-cover"
        />
        <div className="flex-1 text-sm">
          <p className="font-semibold text-navy">Sofia Bennett</p>
          <p className="text-muted-foreground">Procurement mentor · 1:1 sessions</p>
        </div>
        <span className="rounded-full bg-gold-50 px-2.5 py-1 font-medium text-gold-700 text-xs">
          60 pts
        </span>
      </div>
    </div>
  )
}

function ReportScreen() {
  const sections = [
    'Leadership',
    'Workplace',
    'Marketplace',
    'Community',
    'Data',
    'Challenges',
    'Plans',
    'Sign-off',
  ]
  return (
    <div className="grid gap-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-heading font-semibold text-navy">Annual report 2026</p>
          <p className="text-muted-foreground text-sm">Due 1 Dec 2026</p>
        </div>
        <p className="font-bold font-heading text-4xl text-navy">
          <CountUp value={5} />
          <span className="text-muted-foreground text-xl"> / 8</span>
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {sections.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 * i, type: 'spring', stiffness: 260, damping: 20 }}
            className={cn(
              'grid gap-1 rounded-xl p-2.5 text-center text-[11px]',
              i < 5 ? 'bg-navy text-white' : 'border border-dashed bg-white text-muted-foreground',
            )}
          >
            {i < 5 ? (
              <Check className="mx-auto size-3.5 text-gold" aria-hidden />
            ) : (
              <span className="mx-auto size-3.5 rounded-full border" />
            )}
            {s}
          </motion.div>
        ))}
      </div>
      <div className="rounded-2xl bg-surface p-4 text-sm">
        <p className="font-semibold text-navy">Evidence linked</p>
        <p className="text-muted-foreground">
          Pay gap summary, supplier list and training records attached to their sections.
        </p>
      </div>
    </div>
  )
}
