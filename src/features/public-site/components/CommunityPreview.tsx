import type { Listing } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { ExternalLink, Lock, MessageSquare, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { DemoLabel } from '@/components/shared/Cards'
import { CompanyLogo } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'

export const DISCUSSION_SNIPPETS = [
  {
    topic: 'Recruitment',
    title: 'How are you checking job adverts for gender-coded language?',
    excerpt:
      'We are building a review step hiring managers will actually use. A word list, a tool, or peer review?',
    replies: 4,
  },
  {
    topic: 'Procurement',
    title: 'Verifying women-owned suppliers without overburdening small businesses',
    excerpt:
      'What evidence do you ask for, and how do you keep the process light for smaller suppliers?',
    replies: 6,
  },
  {
    topic: 'Reporting',
    title: 'Can we report partial coverage in the first year?',
    excerpt:
      'State the coverage clearly and explain your plan to extend it in the challenges section.',
    replies: 3,
  },
]

export function DiscussionSnippets() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-heading font-semibold text-lg text-navy">Moderated discussions</h3>
        <DemoLabel>Illustrative snippets</DemoLabel>
      </div>
      {DISCUSSION_SNIPPETS.map((d) => (
        <motion.article
          key={d.title}
          whileHover={{ x: 4 }}
          className="rounded-2xl border bg-card p-5 shadow-card"
        >
          <p className="font-medium text-blue text-xs uppercase tracking-wider">{d.topic}</p>
          <h4 className="mt-1 font-heading font-semibold text-navy leading-snug">{d.title}</h4>
          <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">{d.excerpt}</p>
          <p className="mt-3 flex items-center gap-4 text-muted-foreground text-xs">
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="size-3.5" aria-hidden /> {d.replies} replies
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="size-3.5" aria-hidden /> Moderated
            </span>
          </p>
        </motion.article>
      ))}
      <p className="flex items-center gap-2 text-muted-foreground text-sm">
        <Lock className="size-4" aria-hidden /> Posting is limited to signed-in members of approved
        companies.
        <Button asChild variant="link" className="h-auto p-0">
          <Link to="/sign-in">Sign in</Link>
        </Button>
      </p>
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
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-lift"
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
        <h4 className="font-heading font-semibold text-navy leading-snug">{listing.title}</h4>
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
