import { Link } from '@tanstack/react-router'
import { CalendarClock, Coins, Gauge, Handshake } from 'lucide-react'
import type { ReactNode } from 'react'
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDateTime } from '@/lib/format'
import type { Eligibility } from '@/queries/clinics.queries'

function InfoTile({
  icon: Icon,
  label,
  to,
  children,
}: {
  icon: typeof Gauge
  label: string
  to: string
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      className="group grid content-start gap-2 rounded-2xl border bg-card p-5 shadow-card transition-shadow hover:shadow-lift"
    >
      <span className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
        <Icon className="size-4 text-blue" aria-hidden />
        {label}
      </span>
      {children}
    </Link>
  )
}

export function PersonalCards({
  pathPercent,
  lifetime,
  redeemable,
  clinicTitle,
  clinicId,
  clinic,
  clinicRegistered,
  next,
}: {
  pathPercent: number
  lifetime: number
  redeemable: number
  clinicTitle?: string
  clinicId?: string
  clinic: Eligibility
  clinicRegistered: boolean
  next?: { title: string; at?: string; to: string }
}) {
  return (
    <section aria-label="Your progress" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Pathway complete"
        value={pathPercent}
        suffix="%"
        icon={Gauge}
        progress={pathPercent}
        to="/portal/learn"
      />
      <StatCard
        label="Redeemable points"
        value={redeemable}
        icon={Coins}
        tone="navy"
        hint={`${lifetime} earned in total`}
        to="/portal/points"
      />
      <InfoTile
        icon={CalendarClock}
        label="Next clinic"
        to={clinicId ? `/portal/clinics/${clinicId}` : '/portal/clinics'}
      >
        <p className="font-heading font-medium text-navy leading-snug">{clinicTitle ?? '—'}</p>
        {clinicRegistered ? (
          <StatusBadge tone="info">Registered</StatusBadge>
        ) : clinic.eligible ? (
          <StatusBadge tone="success">Eligible: register now</StatusBadge>
        ) : (
          <StatusBadge tone="locked">
            Locked · {clinic.qualifying}/{clinic.required} pts
          </StatusBadge>
        )}
      </InfoTile>
      <InfoTile icon={Handshake} label="Next booked session" to={next?.to ?? '/portal/mentorship'}>
        {next ? (
          <>
            <p className="font-heading font-medium text-navy leading-snug">{next.title}</p>
            <p className="text-muted-foreground text-sm">{formatDateTime(next.at)}</p>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Nothing booked yet</p>
        )}
      </InfoTile>
    </section>
  )
}
