import { principleById } from '@shared/reference'
import { Link } from '@tanstack/react-router'
import { CalendarDays, Clock, Globe, MonitorPlay, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { ClinicStatusBadge } from './ClinicStatusBadge'
import type { ClinicRowData } from './clinic-types'
import { clinicDateLabel, clinicTimeRange, FORMAT_LABEL } from './clinic-utils'

/** Session card for the clinics list. */
export function ClinicCard({ row }: { row: ClinicRowData }) {
  const { event: e, status } = row
  const past = e.status === 'completed'
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }} className="h-full">
      <Link
        to="/portal/clinics/$eventId"
        params={{ eventId: e.id }}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-lift focus-visible:outline-2 focus-visible:outline-blue"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
          <img
            src={e.image}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute start-3 top-3 flex gap-2">
            <ClinicStatusBadge status={status} className="bg-card" />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground text-xs">
            <span className="font-medium text-blue uppercase tracking-wide">
              {e.type === 'clinic' ? 'Clinic' : 'Webinar'}
            </span>
            <span>
              P{e.principle} · {principleById(e.principle).short}
            </span>
          </div>
          <h3 className="font-heading font-semibold text-navy leading-snug">{e.title}</h3>
          <div className="flex items-center gap-2 text-sm">
            <UserAvatar name={row.facilitatorName} src={row.facilitatorAvatar} className="size-7" />
            <span className="text-muted-foreground">{row.facilitatorName}</span>
          </div>
          <dl className="mt-auto grid gap-1.5 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              <dt className="sr-only">Date</dt>
              <dd>{clinicDateLabel(e.startsAt)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 shrink-0" aria-hidden />
              <dt className="sr-only">Time</dt>
              <dd>
                {clinicTimeRange(e.startsAt, e.durationMin)} · {e.durationMin} min
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <MonitorPlay className="size-4 shrink-0" aria-hidden />
              <dt className="sr-only">Format</dt>
              <dd>
                {FORMAT_LABEL[e.format]} · <Globe className="-mt-0.5 inline size-3.5" aria-hidden />{' '}
                {e.language}
              </dd>
            </div>
            {!past ? (
              <div className="flex items-center gap-2">
                <Users className="size-4 shrink-0" aria-hidden />
                <dt className="sr-only">Places</dt>
                <dd className={row.placesLeft === 0 ? 'font-medium text-warning' : undefined}>
                  {row.placesLeft === 0 ? 'No places left' : `${row.placesLeft} places left`}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </Link>
    </motion.div>
  )
}

/** Compact one-line session row, reusable on dashboards. */
export function ClinicRow({ row }: { row: ClinicRowData }) {
  const e = row.event
  return (
    <Link
      to="/portal/clinics/$eventId"
      params={{ eventId: e.id }}
      className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-blue"
    >
      <div className="grid w-12 shrink-0 place-items-center rounded-lg bg-blue-50 py-1.5 text-blue">
        <span className="font-semibold text-lg leading-none">{new Date(e.startsAt).getDate()}</span>
        <span className="text-[11px] uppercase">
          {new Date(e.startsAt).toLocaleString('en-GB', { month: 'short' })}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-navy text-sm">{e.title}</p>
        <p className="truncate text-muted-foreground text-xs">
          {clinicTimeRange(e.startsAt, e.durationMin)} · {row.facilitatorName}
        </p>
      </div>
      <ClinicStatusBadge status={row.status} />
    </Link>
  )
}
