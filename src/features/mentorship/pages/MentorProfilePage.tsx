import { Link, useParams } from '@tanstack/react-router'
import { CalendarPlus, Clock, Coins, Globe2, MapPin, ShieldCheck, Star } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Reveal } from '@/components/motion/Reveal'
import { SectionCard } from '@/components/shared/Cards'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { formatNumber, viewerTimeZone } from '@/lib/format'
import { useBookingContext, useMentor } from '@/queries/mentorship.queries'
import { AvailabilityPreview } from '../components/AvailabilityPreview'
import { EarnLinks } from '../components/PointsBanner'
import { dateTimeIn } from '../lib/time'

const PREPARATION = [
  'Write one or two sentences on what you want to leave the session with.',
  'Have the relevant policy, data or action from your company plan to hand.',
  'Choose what context to share with your expert. You stay in control of this at booking.',
]

export function MentorProfilePage() {
  const { mentorId } = useParams({ from: '/_app/portal/mentorship/$mentorId' })
  const mentor = useMentor(mentorId)
  const ctx = useBookingContext()

  if (mentor.isLoading) return <PageSkeleton />
  if (mentor.isError || !mentor.data)
    return (
      <ErrorState
        title="We couldn’t find this expert"
        message={mentor.error?.message}
        onRetry={() => mentor.refetch()}
      />
    )
  const m = mentor.data
  const p = m.profile
  const shortfall = ctx.data?.shortfall ?? 0
  const balance = ctx.data?.balance.redeemable ?? 0
  const tz = viewerTimeZone()
  const hasSlots = Boolean(m.nextSlot)

  const bookCard = (
    <div className="grid gap-4 rounded-2xl border bg-card p-5 shadow-card lg:sticky lg:top-24">
      <dl className="grid gap-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4" aria-hidden /> Session length
          </dt>
          <dd className="font-semibold text-navy">{p.sessionMinutes} minutes</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Coins className="size-4" aria-hidden /> Cost
          </dt>
          <dd className="font-semibold text-navy">{formatNumber(p.pointsCost)} points</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Your redeemable points</dt>
          <dd className="font-semibold text-navy tabular-nums">{formatNumber(balance)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Next available</dt>
          <dd className="text-right font-medium text-navy">
            {m.nextSlot ? dateTimeIn(m.nextSlot, tz) : 'None open'}
          </dd>
        </div>
      </dl>
      {shortfall > 0 ? (
        <div className="grid gap-3 rounded-xl bg-warning-soft/60 p-4">
          <p className="text-sm">
            You need <strong>{formatNumber(shortfall)} more points</strong> to book this session.
          </p>
          <EarnLinks className="grid gap-2" />
        </div>
      ) : hasSlots ? (
        <Button asChild size="lg">
          <Link to="/portal/mentorship/book/$mentorId" params={{ mentorId }}>
            <CalendarPlus aria-hidden /> Book a session
          </Link>
        </Button>
      ) : (
        <p className="rounded-xl bg-muted p-3 text-muted-foreground text-sm">
          This expert has no open slots right now. Check back soon.
        </p>
      )}
      <p className="flex items-start gap-2 text-muted-foreground text-xs">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        Cancel 24 hours or more before and your points are restored.
      </p>
    </div>
  )

  return (
    <div>
      <PageHeader
        title={m.name}
        description={p.headline}
        breadcrumbs={[{ label: 'Mentorship', to: '/portal/mentorship' }, { label: m.name }]}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
        <div className="grid min-w-0 gap-6">
          <Reveal>
            <SectionCard>
              <div className="flex flex-col gap-5 sm:flex-row">
                <UserAvatar name={m.name} src={m.avatar} className="size-28 rounded-2xl" />
                <div className="grid gap-3">
                  <p className="text-muted-foreground">{m.title}</p>
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="size-4 fill-gold text-gold" aria-hidden />
                      <strong className="text-navy">{p.rating.toFixed(1)}</strong>
                      <span className="text-muted-foreground">
                        ({p.sessionsDelivered} sessions)
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="size-4" aria-hidden /> {p.location}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Globe2 className="size-4" aria-hidden /> {p.languages.join(', ')}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.formats.map((f) => (
                      <StatusBadge key={f} tone="info" icon={null}>
                        {f === 'one_to_one' ? 'One-to-one' : 'Group clinics'}
                      </StatusBadge>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          </Reveal>

          <SectionCard title="About">
            <p className="max-w-3xl leading-relaxed">{p.bio}</p>
          </SectionCard>

          <SectionCard title="Support themes" description="Where this expert can help most.">
            <ul className="flex flex-wrap gap-2">
              {p.expertise.map((e) => (
                <li key={e} className="rounded-full bg-blue-50 px-3 py-1 text-blue-600 text-sm">
                  {e}
                </li>
              ))}
            </ul>
            <p className="mt-4 mb-2 font-medium text-muted-foreground text-sm">Principles</p>
            <div className="flex flex-wrap gap-2">
              {p.principles.map((id) => (
                <PrincipleTag key={id} id={id} />
              ))}
            </div>
            <p className="mt-4 mb-1 font-medium text-muted-foreground text-sm">Sectors</p>
            <p className="text-sm">{p.sectors.join(' · ')}</p>
          </SectionCard>

          <SectionCard
            title="How to prepare"
            description="A little preparation makes 30 minutes count."
          >
            <ul className="grid gap-2 text-sm">
              {PREPARATION.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Availability: next two weeks"
            description={`Shown in your timezone (${tz.replace(/_/g, ' ')}).`}
          >
            <AvailabilityPreview slots={m.slots} mentorId={mentorId} bookable={shortfall === 0} />
          </SectionCard>
        </div>
        <aside aria-label="Booking summary">{bookCard}</aside>
      </div>
    </div>
  )
}
