import { ArrowRight } from 'lucide-react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react'
import type { MouseEvent } from 'react'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { scrollToTarget } from '@/components/motion/SmoothScroll'
import { images } from '@/config/images'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'

const THEMES = [
  {
    n: '01',
    title: 'Build capability',
    text: 'Department-based learning, official guidance and live expert clinics for every team.',
    image: images.sections.buildCapability,
    target: '#resources',
    cta: 'Explore resources',
  },
  {
    n: '02',
    title: 'Put plans into action',
    text: 'Turn a baseline into an action plan with owners, support and practical templates.',
    image: images.sections.plansIntoAction,
    target: '#clinics',
    cta: 'See clinics and events',
  },
  {
    n: '03',
    title: 'Track progress',
    text: 'Keep evidence in one place and report on the WEPs indicators with confidence.',
    image: images.sections.trackProgress,
    target: '#portal',
    cta: 'See inside the portal',
  },
] as const

export function ValueOverview() {
  return (
    <Stagger className="grid gap-6 md:grid-cols-3" gap={0.14}>
      {THEMES.map((t) => (
        <StaggerItem key={t.title} className="[perspective:1200px]">
          <TiltCard theme={t} />
        </StaggerItem>
      ))}
    </Stagger>
  )
}

function TiltCard({ theme: t }: { theme: (typeof THEMES)[number] }) {
  const reduced = usePrefersReducedMotion()
  const mx = useMotionValue(50)
  const my = useMotionValue(50)
  const rx = useSpring(0, { stiffness: 180, damping: 18 })
  const ry = useSpring(0, { stiffness: 180, damping: 18 })
  const spot = useMotionTemplate`radial-gradient(420px circle at ${mx}% ${my}%, rgba(214,164,74,0.28), transparent 45%)`

  const onMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (reduced) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    mx.set(px * 100)
    my.set(py * 100)
    ry.set((px - 0.5) * 10)
    rx.set((0.5 - py) * 10)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.button
      type="button"
      onClick={() => scrollToTarget(t.target)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
      className="group relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden rounded-3xl bg-navy-900 text-left text-white shadow-lift"
    >
      <img
        src={t.image.src}
        alt={t.image.alt}
        loading="lazy"
        className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/55 to-transparent" />
      <motion.div
        aria-hidden
        style={{ background: spot }}
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 rounded-[1.25rem] border border-white/0 transition-colors duration-500 group-hover:border-white/25"
      />
      <span
        aria-hidden
        className="absolute top-5 left-5 rounded-full border border-white/20 bg-navy-900/60 px-3 py-1 font-heading font-semibold text-gold text-xs backdrop-blur-md"
      >
        {t.n}
      </span>
      <div className="relative grid gap-3 p-6 [transform:translateZ(40px)] sm:p-7">
        <h3 className="font-bold font-heading text-2xl">{t.title}</h3>
        <span
          aria-hidden
          className="h-0.5 w-10 origin-left bg-gold transition-all duration-500 group-hover:w-20"
        />
        <p className="text-sm text-white/80 leading-relaxed">{t.text}</p>
        <span className="inline-flex items-center gap-2 font-medium text-gold text-sm">
          {t.cta}
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1.5"
            aria-hidden
          />
        </span>
      </div>
    </motion.button>
  )
}
