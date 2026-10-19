import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { images } from '@/config/images'

const THEMES = [
  {
    n: '01',
    title: 'Build capability',
    text: 'Department-based learning, official guidance and live expert clinics for every team.',
    image: images.sections.buildCapability,
    to: '/resources',
    cta: 'Explore resources',
  },
  {
    n: '02',
    title: 'Put plans into action',
    text: 'Turn a baseline into an action plan with owners, support and practical templates.',
    image: images.sections.plansIntoAction,
    to: '/clinics',
    cta: 'See clinics and events',
  },
  {
    n: '03',
    title: 'Track progress',
    text: 'Keep evidence in one place and report on the WEPs indicators with confidence.',
    image: images.sections.trackProgress,
    to: '/about',
    hash: 'portal',
    cta: 'How the portal connects',
  },
] as const

export function ValueOverview() {
  return (
    <Stagger className="grid gap-6 md:grid-cols-3" gap={0.1}>
      {THEMES.map((t) => (
        <StaggerItem key={t.title}>
          <motion.div whileHover={{ y: -6 }} className="h-full">
            <Link
              to={t.to}
              hash={'hash' in t ? t.hash : undefined}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl bg-navy-900 text-white shadow-card"
            >
              <img
                src={t.image.src}
                alt={t.image.alt}
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/60 to-transparent" />
              <div className="relative grid gap-3 p-6 sm:p-7">
                <span className="font-heading font-bold text-gold text-sm">{t.n}</span>
                <h3 className="font-bold font-heading text-2xl">{t.title}</h3>
                <p className="text-sm text-white/80 leading-relaxed">{t.text}</p>
                <span className="inline-flex items-center gap-2 font-medium text-sm">
                  {t.cta}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </div>
            </Link>
          </motion.div>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
