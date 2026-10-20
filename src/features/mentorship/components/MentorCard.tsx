import { Link } from '@tanstack/react-router'
import { Clock, Globe2, Sparkles, Star, UsersRound } from 'lucide-react'
import { motion } from 'motion/react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { viewerTimeZone } from '@/lib/format'
import { dateTimeIn } from '../lib/time'
import type { MentorRow } from '../lib/types'

export function MentorCard({ mentor, canBook }: { mentor: MentorRow; canBook: boolean }) {
  const p = mentor.profile
  const tz = viewerTimeZone()
  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="relative flex h-full flex-col rounded-2xl border bg-card p-5 shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="flex items-start gap-4">
        <UserAvatar name={mentor.name} src={mentor.avatar} className="size-16 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-medium text-lg text-navy leading-tight">
            <Link
              to="/portal/mentorship/$mentorId"
              params={{ mentorId: p.userId }}
              className="after:absolute after:inset-0 hover:underline"
            >
              {mentor.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-muted-foreground text-sm">{p.headline}</p>
          <p className="mt-1 flex items-center gap-1 text-sm">
            <Star className="size-4 fill-coral text-coral" aria-hidden />
            <span className="font-semibold text-navy">{p.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">· {p.sessionsDelivered} sessions</span>
          </p>
        </div>
      </div>

      {mentor.reasons.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="sr-only">Recommended because:</span>
          {mentor.reasons.map((r) => (
            <StatusBadge key={r} tone="coral" icon={Sparkles}>
              {r}
            </StatusBadge>
          ))}
        </div>
      ) : null}

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Expertise">
        {p.expertise.map((e) => (
          <li key={e} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-blue-600 text-xs">
            {e}
          </li>
        ))}
      </ul>

      <dl className="mt-4 grid gap-1.5 text-muted-foreground text-sm">
        <div className="flex gap-2">
          <dt className="sr-only">Sectors</dt>
          <dd className="flex items-start gap-2">
            <UsersRound className="mt-0.5 size-4 shrink-0" aria-hidden />
            {p.sectors.join(', ')}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="sr-only">Languages</dt>
          <dd className="flex items-start gap-2">
            <Globe2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            {p.languages.join(', ')}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="sr-only">Format</dt>
          <dd className="flex items-start gap-2">
            <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
            {p.sessionMinutes} min ·{' '}
            {p.formats.includes('group') ? 'One-to-one and group clinics' : 'One-to-one'}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div className="text-sm">
          <p className="text-muted-foreground text-xs">Next available</p>
          <p className="font-medium text-navy">
            {mentor.nextSlot ? dateTimeIn(mentor.nextSlot, tz) : 'No open slots'}
          </p>
        </div>
        <Button
          asChild
          size="sm"
          variant={canBook ? 'default' : 'outline'}
          className="relative z-10"
        >
          <Link to="/portal/mentorship/$mentorId" params={{ mentorId: p.userId }}>
            {canBook ? 'View & book' : 'View profile'}
          </Link>
        </Button>
      </div>
    </motion.article>
  )
}
