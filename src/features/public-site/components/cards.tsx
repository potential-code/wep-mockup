import type { ClinicEvent, Resource } from '@shared/types'
import { ArrowUpRight, CalendarDays, Clock, Lock, MapPin } from 'lucide-react'
import { motion } from 'motion/react'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { formatDate, formatTime, timeZoneLabel } from '@/lib/format'

const FORMAT_LABEL: Record<string, string> = {
  pdf: 'PDF',
  pptx: 'Slides',
  docx: 'Document',
  xlsx: 'Spreadsheet',
  link: 'Web page',
  video: 'Video',
}

export function PublicResourceCard({ resource: r }: { resource: Resource }) {
  const body = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
        <img
          src={r.image}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute start-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-medium text-navy text-xs backdrop-blur">
          {FORMAT_LABEL[r.format] ?? r.format}
          {r.pages ? ` · ${r.pages} pp` : ''}
        </span>
        {r.official ? (
          <span className="absolute end-3 top-3 rounded-full bg-gold px-2.5 py-1 font-semibold text-navy-900 text-xs">
            Official WEPs
          </span>
        ) : null}
      </div>
      <div className="grid flex-1 content-start gap-3 p-5">
        <PrincipleTag id={r.principle} linked={false} className="w-fit" />
        <h3 className="font-heading font-semibold text-lg text-navy leading-snug">{r.title}</h3>
        <p className="line-clamp-3 text-muted-foreground text-sm">{r.description}</p>
        <p className="mt-auto flex items-center justify-between pt-2 text-muted-foreground text-xs">
          <span>{r.publisher}</span>
          {r.official && r.sourceUrl ? (
            <span className="inline-flex items-center gap-1 font-medium text-blue">
              View on weps.org <ArrowUpRight className="size-3.5" aria-hidden />
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Lock className="size-3.5" aria-hidden /> Members
            </span>
          )}
        </p>
      </div>
    </>
  )
  const cls =
    'group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-lift'
  return r.official && r.sourceUrl ? (
    <motion.a
      whileHover={{ y: -4 }}
      href={r.sourceUrl}
      target="_blank"
      rel="noreferrer"
      className={cls}
      aria-label={`${r.title} (opens weps.org)`}
    >
      {body}
    </motion.a>
  ) : (
    <motion.article whileHover={{ y: -4 }} className={cls}>
      {body}
    </motion.article>
  )
}

export function eligibilityNote(e: ClinicEvent) {
  if (e.prerequisiteCourseId || e.minQualifyingPoints)
    return 'Complete your department pathway to unlock'
  return 'Open to all signed-in members'
}

export function PublicEventCard({
  event: e,
  facilitatorName,
  facilitatorAvatar,
}: {
  event: ClinicEvent
  facilitatorName: string
  facilitatorAvatar?: string
}) {
  const locked = Boolean(e.prerequisiteCourseId || e.minQualifyingPoints)
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-navy-900">
        <img
          src={e.image}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 to-transparent" />
        <span className="absolute start-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-medium text-navy text-xs capitalize">
          {e.type} · {e.format.replace('_', ' ')}
        </span>
        <div className="absolute start-4 bottom-3 end-4 flex items-center gap-2 text-sm text-white">
          <CalendarDays className="size-4" aria-hidden />
          <span className="font-medium">
            {formatDate(e.startsAt, { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
      <div className="grid flex-1 content-start gap-3 p-5">
        <PrincipleTag id={e.principle} linked={false} className="w-fit" />
        <h3 className="font-heading font-semibold text-lg text-navy leading-snug">{e.title}</h3>
        <p className="line-clamp-2 text-muted-foreground text-sm">{e.topic}</p>
        <dl className="grid gap-1.5 text-muted-foreground text-sm">
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
            <dt className="sr-only">Time</dt>
            <dd>
              {formatTime(e.startsAt)} · {e.durationMin} min
              <span className="block text-xs">{timeZoneLabel()}</span>
            </dd>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            <dt className="sr-only">Facilitator</dt>
            <dd className="flex items-center gap-2">
              {facilitatorAvatar ? (
                <img src={facilitatorAvatar} alt="" className="size-5 rounded-full object-cover" />
              ) : null}
              {facilitatorName}
            </dd>
          </div>
        </dl>
        <p className="mt-auto flex items-center gap-2 border-t pt-3 text-xs">
          <Lock className="size-3.5 text-gold-700" aria-hidden />
          <span className="font-medium text-navy">
            {locked ? 'Complete your department pathway to unlock' : 'Open to signed-in members'}
          </span>
        </p>
      </div>
    </motion.article>
  )
}
