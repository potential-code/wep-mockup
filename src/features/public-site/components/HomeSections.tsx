import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarDays, ChevronDown, Clock, GraduationCap, Lock } from 'lucide-react'
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { Magnetic } from '@/components/motion/Magnetic'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { BrushRing, EdgeRule, ForAllBars, GearCluster } from '@/components/shared/BrandMotif'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { CardGridSkeleton, ErrorState } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { images } from '@/config/images'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { formatDate, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { usePublicEvents } from '@/queries/clinics.queries'
import { usePublicListings } from '@/queries/community.queries'
import { usePublicResources } from '@/queries/resources.queries'
import { DiscussionSnippets, ListingCard } from './CommunityPreview'
import { PublicResourceCard } from './cards'
import { SectionHeading } from './SectionHeading'

const EASE = [0.22, 1, 0.36, 1] as const

const FEATURED = [
  'Transparency and Accountability Roadmap',
  'Gender Action Plan Template',
  'Procurement Toolbox',
]

export function FeaturedResources() {
  const { data, isLoading, isError, refetch } = usePublicResources()
  const [showAll, setShowAll] = useState(false)
  const featured = FEATURED.map((t) => data?.find((r) => r.official && r.title.includes(t))).filter(
    (r) => r !== undefined,
  )
  const more = (data ?? []).filter((r) => !featured.includes(r))
  return (
    <section
      id="resources"
      className="relative isolate overflow-hidden py-20 sm:py-28"
      aria-labelledby="resources-h"
    >
      <EdgeRule tone="light" className="top-0" />
      <ForAllBars tone="light" className="-z-10 -right-12 top-16 hidden md:block" size={260} />
      <div className="container-public">
        <SectionHeading
          id="resources-h"
          eyebrow="Learning and resources"
          title="Official guidance, ready to use"
          description="Start with the WEPs materials companies rely on. Each opens on weps.org; the thumbnails are proposed portal artwork."
        />
        {isLoading ? (
          <CardGridSkeleton count={3} />
        ) : isError ? (
          <ErrorState
            message="We could not load the featured resources."
            onRetry={() => refetch()}
          />
        ) : (
          <>
            <Stagger className="grid gap-6 md:grid-cols-3" gap={0.12}>
              {featured.map((r) => (
                <StaggerItem key={r.id} className="h-full">
                  <div className="h-full [&>*]:h-full">
                    <PublicResourceCard resource={r} />
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
            <AnimatePresence initial={false}>
              {showAll ? (
                <motion.div
                  key="more"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-6 pt-6 md:grid-cols-3">
                    {more.map((r, i) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i, ease: EASE }}
                        className="h-full [&>*]:h-full"
                      >
                        <PublicResourceCard resource={r} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
            {more.length ? (
              <div className="mt-10 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="group rounded-full bg-white shadow-card"
                  onClick={() => setShowAll((v) => !v)}
                  aria-expanded={showAll}
                >
                  {showAll ? 'Show fewer' : `Show ${more.length} more resources`}
                  <ChevronDown
                    className={cn(
                      'transition-transform duration-300',
                      showAll ? 'rotate-180' : 'group-hover:translate-y-0.5',
                    )}
                    aria-hidden
                  />
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

const MENTORS = [
  { img: images.people.sofiaBennett, name: 'Sofia Bennett', topic: 'Procurement' },
  { img: images.people.amaraOkafor, name: 'Amara Okafor', topic: 'Inclusive hiring' },
  { img: images.people.jamesLiu, name: 'James Liu', topic: 'Reporting' },
  { img: images.people.priyaRaman, name: 'Priya Raman', topic: 'Communications' },
]

type PublicEvent = NonNullable<ReturnType<typeof usePublicEvents>['data']>[number]

/** Large card for the next upcoming clinic. */
function FeaturedEvent({ e }: { e: PublicEvent }) {
  const ev = e.event
  const locked = Boolean(ev.prerequisiteCourseId || ev.minQualifyingPoints)
  return (
    <motion.article
      whileHover="hover"
      className="group shine relative isolate flex h-full min-h-[440px] flex-col justify-end overflow-hidden rounded-3xl bg-navy-900 p-6 text-white shadow-lift sm:p-8"
    >
      <motion.img
        src={ev.image}
        alt=""
        loading="lazy"
        variants={{ hover: { scale: 1.06 } }}
        transition={{ duration: 0.8, ease: EASE }}
        className="-z-20 absolute inset-0 size-full object-cover"
      />
      <div className="-z-10 absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/70 to-navy-900/10" />
      <span className="absolute start-6 top-6 inline-flex items-center gap-2 rounded-full bg-coral-600 px-3 py-1 font-semibold text-white text-xs sm:start-8 sm:top-8">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-navy-900/60" />
          <span className="relative inline-flex size-2 rounded-full bg-navy-900" />
        </span>
        Next up
      </span>
      <DateBlock iso={ev.startsAt} className="absolute end-6 top-6 sm:end-8 sm:top-8" dark />
      <PrincipleTag id={ev.principle} linked={false} className="w-fit" />
      <h3 className="mt-3 max-w-md text-balance font-medium font-heading text-2xl leading-tight sm:text-3xl">
        {ev.title}
      </h3>
      <p className="mt-2 max-w-md text-white/75">{ev.topic}</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
        <span className="inline-flex items-center gap-2">
          {e.facilitatorAvatar ? (
            <img
              src={e.facilitatorAvatar}
              alt=""
              className="size-7 rounded-full object-cover ring-2 ring-white/30"
            />
          ) : null}
          {e.facilitatorName}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" aria-hidden /> {formatTime(ev.startsAt)} · {ev.durationMin} min
        </span>
        <span className="inline-flex items-center gap-1.5 capitalize">
          {ev.type} · {ev.format.replace('_', ' ')}
        </span>
      </div>
      <p className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs backdrop-blur">
        <Lock className="size-3.5 text-coral" aria-hidden />
        {locked ? 'Unlocks when your department pathway is complete' : 'Open to signed-in members'}
      </p>
    </motion.article>
  )
}

function DateBlock({ iso, className, dark }: { iso: string; className?: string; dark?: boolean }) {
  return (
    <span
      className={cn(
        'grid w-14 shrink-0 overflow-hidden rounded-xl text-center shadow-card',
        dark ? 'bg-white/95 text-navy' : 'bg-white text-navy ring-1 ring-border',
        className,
      )}
    >
      <span className="bg-blue py-0.5 font-semibold text-[10px] text-white uppercase tracking-wider">
        {formatDate(iso, { month: 'short' })}
      </span>
      <span className="py-1 font-medium font-heading text-xl leading-tight">
        {formatDate(iso, { day: 'numeric' })}
      </span>
    </span>
  )
}

/** Compact "ticket" row for the following clinics. */
function EventRow({ e, index }: { e: PublicEvent; index: number }) {
  const ev = e.event
  const reduced = usePrefersReducedMotion()
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.1, ease: EASE }}
      whileHover={{ x: -4 }}
      className="group relative flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-card transition-shadow hover:shadow-lift"
    >
      <span
        aria-hidden
        className="absolute inset-y-4 start-0 w-1 origin-center scale-y-0 rounded-full bg-coral transition-transform duration-300 group-hover:scale-y-100"
      />
      <DateBlock iso={ev.startsAt} />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-blue text-xs uppercase tracking-wider">
          {ev.type} · {ev.format.replace('_', ' ')}
        </p>
        <h4 className="truncate font-heading font-medium text-navy">{ev.title}</h4>
        <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Clock className="size-3.5" aria-hidden /> {formatTime(ev.startsAt)} · {ev.durationMin}{' '}
          min · {e.facilitatorName}
        </p>
      </div>
      <img
        src={ev.image}
        alt=""
        loading="lazy"
        className="hidden size-14 rounded-xl object-cover transition-transform duration-500 group-hover:scale-110 sm:block"
      />
    </motion.li>
  )
}

export function ClinicsAndExperts() {
  const { data, isLoading, isError, refetch } = usePublicEvents()
  const reduced = usePrefersReducedMotion()
  const [first, ...rest] = data ?? []
  return (
    <section
      id="clinics"
      className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#e6f6fd,var(--surface))] py-20 sm:py-28"
    >
      <BrushRing tone="light" size={320} className="-z-10 -top-20 -left-20" />
      <div className="container-public">
        <SectionHeading
          eyebrow="Clinics and experts"
          title="Live help from people who do this every day"
          description="Webinars and clinics are open to members once their department pathway is complete."
        />
        {isLoading ? (
          <CardGridSkeleton count={2} className="lg:grid-cols-2" />
        ) : isError ? (
          <ErrorState message="We could not load upcoming events." onRetry={() => refetch()} />
        ) : first ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={reduced ? false : { opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <FeaturedEvent e={first} />
            </motion.div>
            <div className="grid content-start gap-3">
              <p className="flex items-center gap-2 font-heading font-medium text-navy">
                <CalendarDays className="size-4 text-blue" aria-hidden /> Coming up
              </p>
              <ul className="grid gap-3">
                {rest.slice(0, 4).map((e, i) => (
                  <EventRow key={e.event.id} e={e} index={i} />
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        <Reveal className="relative isolate mt-8 grid items-center gap-6 overflow-hidden rounded-3xl bg-navy p-6 text-white shadow-lift sm:p-10 lg:grid-cols-[auto_1fr]">
          <GearCluster size={240} className="-z-10 -bottom-20 -right-20" />
          <ul className="flex -space-x-3">
            {MENTORS.map((m, i) => (
              <motion.li
                key={m.name}
                initial={reduced ? false : { opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 260, damping: 18 }}
                className="group relative hover:z-20"
                style={{ zIndex: MENTORS.length - i }}
              >
                <img
                  src={m.img.src}
                  alt=""
                  loading="lazy"
                  className="size-14 rounded-full border-2 border-navy object-cover transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:scale-110 sm:size-16"
                />
                <span className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 mb-2 whitespace-nowrap rounded-lg bg-white px-2.5 py-1.5 text-center text-navy text-xs opacity-0 shadow-lift transition-all duration-200 group-hover:-translate-y-0.5 group-hover:opacity-100">
                  <span className="block font-semibold">{m.name}</span>
                  <span className="text-muted-foreground">{m.topic}</span>
                </span>
                <span className="sr-only">
                  {m.name}, {m.topic}
                </span>
              </motion.li>
            ))}
          </ul>
          <div>
            <p className="flex items-center gap-2 font-heading font-medium text-lg">
              <GraduationCap className="size-5 text-coral-300" aria-hidden /> Expert support
            </p>
            <p className="mt-1 max-w-2xl text-white/75">
              Mentors and trainers offer one-to-one sessions and group clinics. Members redeem
              points to book.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Hiring', 'Procurement', 'Communications', 'Reporting', 'Pay equity'].map(
                (t, i) => (
                  <motion.span
                    key={t}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    className="cursor-default rounded-full border border-white/20 bg-white/5 px-3 py-1 text-sm text-white/85 transition-colors hover:border-coral hover:bg-coral/15 hover:text-white"
                  >
                    {t}
                  </motion.span>
                ),
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function CommunitySection() {
  const { data, isLoading } = usePublicListings()
  const reduced = usePrefersReducedMotion()
  return (
    <section id="community" className="relative isolate overflow-hidden py-20 sm:py-28">
      <BrushRing tone="light" size={320} className="-z-10 -bottom-20 -right-20" />
      <div className="container-public">
        <SectionHeading
          eyebrow="Company community"
          title="Learn alongside other signatories"
          description="Practitioners share what works in moderated discussions, and approved companies list products and services that support the Principles."
        />
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
          <DiscussionSnippets />
          <div className="grid content-start gap-4">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-wrap items-center gap-2"
            >
              <h3 className="font-heading font-medium text-lg text-navy">
                Approved products and services
              </h3>
            </motion.div>
            {isLoading ? (
              <CardGridSkeleton count={2} className="lg:grid-cols-2" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {data?.slice(0, 2).map((l, i) => (
                  <motion.div
                    key={l.listing.id}
                    initial={reduced ? false : { opacity: 0, y: 40, rotate: i ? 2 : -2 }}
                    whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: EASE }}
                    className="h-full [&>*]:h-full"
                  >
                    <ListingCard
                      listing={l.listing}
                      companyName={l.companyName}
                      companyLogo={l.companyLogo}
                    />
                  </motion.div>
                ))}
              </div>
            )}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, ease: EASE }}
              className="relative isolate flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl bg-[linear-gradient(120deg,var(--navy-900),var(--navy)_55%,var(--blue))] p-6 text-white shadow-lift"
            >
              <GearCluster size={180} className="-z-10 -top-20 -right-20" />
              <div>
                <p className="font-heading font-medium text-lg">Join the conversation</p>
                <p className="text-sm text-white/75">
                  Posting and listings are open to members of approved companies.
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline-light" className="rounded-full">
                  <Link to="/sign-in">Sign in</Link>
                </Button>
                <Button asChild variant="coral" className="group rounded-full">
                  <Link to="/join">
                    Join WEPs{' '}
                    <ArrowRight
                      className="transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function CtaBand() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-blue-600 py-24 text-white sm:py-32"
    >
      <motion.img
        src={images.sections.ctaBand.src}
        alt=""
        loading="lazy"
        style={{ y: imgY }}
        className="-z-20 absolute inset-0 size-full scale-125 object-cover"
      />
      <div className="-z-10 absolute inset-0 bg-[linear-gradient(90deg,rgba(0,58,96,0.94),rgba(0,84,135,0.78)_55%,rgba(0,111,168,0.45))]" />
      <GearCluster size={420} className="-z-10 -top-20 -right-20" />
      <motion.div
        aria-hidden
        className="-z-10 pointer-events-none absolute right-[8%] bottom-[-40px] hidden md:block"
        animate={{ y: [0, -14, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      >
        <ForAllBars className="relative" size={320} />
      </motion.div>
      <EdgeRule className="top-0" />
      <Reveal className="container-public grid max-w-3xl gap-6 ps-4 sm:ps-6 lg:ms-[max(0px,calc((100vw-1200px)/2))]">
        <p className="font-medium text-white/90 text-xs uppercase tracking-[0.2em]">
          Eligible companies
        </p>
        <h2 className="text-balance font-medium font-heading text-4xl leading-tight sm:text-5xl">
          Ready to make your commitment count?
        </h2>
        <p className="max-w-xl text-lg text-white/90">
          Companies apply to become WEPs signatories. UN Women reviews every application before the
          portal is activated.
        </p>
        <div className="flex flex-wrap gap-3">
          <Magnetic>
            <Button asChild variant="coral" size="xl" className="group pulse-ring rounded-full">
              <Link to="/join">
                Apply to join WEPs{' '}
                <ArrowRight
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button asChild variant="outline-light" size="xl" className="rounded-full">
              <Link to="/application-status">Check application status</Link>
            </Button>
          </Magnetic>
        </div>
      </Reveal>
    </section>
  )
}
