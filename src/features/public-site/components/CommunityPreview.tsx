import type { Listing } from '@shared/types'
import {
  BarChart3,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Truck,
  UserSearch,
} from 'lucide-react'
import { motion } from 'motion/react'
import { CompanyLogo } from '@/components/shared/UserAvatar'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'

export const DISCUSSION_SNIPPETS = [
  {
    topic: 'Recruitment',
    icon: UserSearch,
    title: 'How are you checking job adverts for gender-coded language?',
    excerpt:
      'We are building a review step hiring managers will actually use. A word list, a tool, or peer review?',
    replies: 4,
  },
  {
    topic: 'Procurement',
    icon: Truck,
    title: 'Verifying women-owned suppliers without overburdening small businesses',
    excerpt:
      'What evidence do you ask for, and how do you keep the process light for smaller suppliers?',
    replies: 6,
  },
  {
    topic: 'Reporting',
    icon: BarChart3,
    title: 'Can we report partial coverage in the first year?',
    excerpt:
      'State the coverage clearly and explain your plan to extend it in the challenges section.',
    replies: 3,
  },
]

const AUTHORS = [
  'HR lead · Retail',
  'Procurement manager · Hospitality',
  'Sustainability lead · Finance',
]

export function DiscussionSnippets() {
  const reduced = usePrefersReducedMotion()
  return (
    <div className="grid content-start gap-4">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-wrap items-center gap-2"
      >
        <h3 className="font-heading font-medium text-lg text-navy">Moderated discussions</h3>
      </motion.div>
      <ol className="relative grid gap-4">
        <motion.span
          aria-hidden
          initial={reduced ? false : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute start-5 top-6 bottom-6 w-px origin-top bg-gradient-to-b from-coral via-blue/40 to-transparent"
        />
        {DISCUSSION_SNIPPETS.map((d, i) => (
          <motion.li
            key={d.title}
            initial={reduced ? false : { opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex gap-4"
          >
            <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-white font-heading font-medium text-blue text-sm shadow-card ring-4 ring-surface transition-colors duration-300 group-hover:bg-navy group-hover:text-coral">
              <d.icon className="size-4" aria-hidden />
            </span>
            <article className="flex-1 rounded-2xl border bg-white p-5 shadow-card transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-blue/30 group-hover:shadow-lift">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-medium text-blue text-xs">
                  {d.topic}
                </span>
                <span className="text-muted-foreground text-xs">{AUTHORS[i]}</span>
              </div>
              <h4 className="mt-2 font-heading font-medium text-navy leading-snug">{d.title}</h4>
              <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">{d.excerpt}</p>
              <p className="mt-3 flex items-center gap-4 text-muted-foreground text-xs">
                <span className="inline-flex items-center gap-1 transition-colors group-hover:text-blue">
                  <MessageSquare
                    className="size-3.5 transition-transform group-hover:scale-110"
                    aria-hidden
                  />{' '}
                  {d.replies} replies
                </span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-success" aria-hidden /> Moderated
                </span>
              </p>
            </article>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}

export function ListingCard({
  listing,
  companyName,
  companyLogo,
}: {
  listing: Listing
  companyName: string
  companyLogo?: string
}) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="group shine flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={listing.image}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="grid flex-1 content-start gap-2 p-5">
        <p className="font-medium text-blue text-xs uppercase tracking-wider">
          {listing.type} · {listing.category}
        </p>
        <h4 className="font-heading font-medium text-navy leading-snug">{listing.title}</h4>
        <p className="line-clamp-2 text-muted-foreground text-sm">{listing.value}</p>
        <p className="mt-auto flex items-center gap-2 border-t pt-3 text-sm">
          <CompanyLogo name={companyName} src={companyLogo} className="size-6 rounded" />
          <span className="font-medium text-navy">{companyName}</span>
          <ExternalLink className="ms-auto size-3.5 text-muted-foreground" aria-hidden />
          <span className="sr-only">Members can view the provider’s site</span>
        </p>
      </div>
    </motion.article>
  )
}
