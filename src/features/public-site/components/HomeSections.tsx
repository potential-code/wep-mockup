import { Link } from '@tanstack/react-router'
import { ArrowRight, GraduationCap } from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { DemoLabel } from '@/components/shared/Cards'
import { CardGridSkeleton, ErrorState } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { images } from '@/config/images'
import { usePublicEvents } from '@/queries/clinics.queries'
import { usePublicListings } from '@/queries/community.queries'
import { usePublicResources } from '@/queries/resources.queries'
import { DiscussionSnippets, ListingCard } from './CommunityPreview'
import { PublicEventCard, PublicResourceCard } from './cards'
import { SectionHeading } from './SectionHeading'

const FEATURED = [
  'Transparency and Accountability Roadmap',
  'Gender Action Plan Template',
  'Procurement Toolbox',
]

export function FeaturedResources() {
  const { data, isLoading, isError, refetch } = usePublicResources()
  const featured = FEATURED.map((t) => data?.find((r) => r.official && r.title.includes(t))).filter(
    (r) => r !== undefined,
  )
  return (
    <section className="py-16 sm:py-24" aria-labelledby="resources-h">
      <div className="container-public">
        <SectionHeading
          eyebrow="Learning and resources"
          title="Official guidance, ready to use"
          description="Start with the WEPs materials companies rely on. Each opens on weps.org; the thumbnails are proposed portal artwork."
          action={
            <Button asChild variant="outline">
              <Link to="/resources">
                Browse all resources <ArrowRight aria-hidden />
              </Link>
            </Button>
          }
        />
        <span id="resources-h" className="sr-only">
          Featured resources
        </span>
        {isLoading ? (
          <CardGridSkeleton count={3} />
        ) : isError ? (
          <ErrorState
            message="We could not load the featured resources."
            onRetry={() => refetch()}
          />
        ) : (
          <Stagger className="grid gap-6 md:grid-cols-3">
            {featured.map((r) => (
              <StaggerItem key={r.id} className="h-full">
                <div className="h-full [&>*]:h-full">
                  <PublicResourceCard resource={r} />
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  )
}

const MENTORS = [
  images.people.sofiaBennett,
  images.people.amaraOkafor,
  images.people.jamesLiu,
  images.people.priyaRaman,
]
const NAMES = ['Sofia Bennett', 'Amara Okafor', 'James Liu', 'Priya Raman']

export function ClinicsAndExperts() {
  const { data, isLoading, isError, refetch } = usePublicEvents()
  return (
    <section className="bg-surface py-16 sm:py-24">
      <div className="container-public">
        <SectionHeading
          eyebrow="Clinics and experts"
          title="Live help from people who do this every day"
          description="Webinars and clinics are open to members once their department pathway is complete."
          action={
            <Button asChild>
              <Link to="/clinics">
                Explore clinics <ArrowRight aria-hidden />
              </Link>
            </Button>
          }
        />
        {isLoading ? (
          <CardGridSkeleton count={3} />
        ) : isError ? (
          <ErrorState message="We could not load upcoming events." onRetry={() => refetch()} />
        ) : (
          <Stagger className="grid gap-6 md:grid-cols-3">
            {data?.slice(0, 3).map((e) => (
              <StaggerItem key={e.event.id} className="h-full">
                <div className="h-full [&>*]:h-full">
                  <PublicEventCard
                    event={e.event}
                    facilitatorName={e.facilitatorName}
                    facilitatorAvatar={e.facilitatorAvatar}
                  />
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}
        <Reveal className="mt-10 grid items-center gap-6 rounded-3xl bg-navy p-6 text-white sm:p-10 md:grid-cols-[auto_1fr]">
          <div className="flex -space-x-3" aria-hidden>
            {MENTORS.map((m, i) => (
              <img
                key={m.src}
                src={m.src}
                alt=""
                loading="lazy"
                className="size-14 rounded-full border-2 border-navy object-cover sm:size-16"
                style={{ zIndex: MENTORS.length - i }}
              />
            ))}
          </div>
          <div>
            <p className="flex items-center gap-2 font-heading font-semibold text-lg">
              <GraduationCap className="size-5 text-gold" aria-hidden /> Expert support
            </p>
            <p className="mt-1 max-w-2xl text-white/75">
              Mentors and trainers such as {NAMES.slice(0, 3).join(', ')} and colleagues offer
              one-to-one sessions and group clinics on hiring, procurement, communications and
              reporting. Members redeem points to book.{' '}
              <DemoLabel className="ms-1">Proposed feature</DemoLabel>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function CommunitySection() {
  const { data, isLoading } = usePublicListings()
  return (
    <section className="py-16 sm:py-24">
      <div className="container-public">
        <SectionHeading
          eyebrow="Company community"
          title="Learn alongside other signatories"
          description="Practitioners share what works in moderated discussions, and approved companies list products and services that support the Principles."
          action={
            <Button asChild variant="outline">
              <Link to="/directory">
                See the community <ArrowRight aria-hidden />
              </Link>
            </Button>
          }
        />
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <DiscussionSnippets />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h3 className="font-heading font-semibold text-lg text-navy">
                Approved products and services
              </h3>
              <DemoLabel>Proposed feature</DemoLabel>
            </div>
            {isLoading ? (
              <CardGridSkeleton count={2} className="lg:grid-cols-2" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {data?.slice(0, 2).map((l) => (
                  <ListingCard
                    key={l.listing.id}
                    listing={l.listing}
                    companyName={l.companyName}
                    companyLogo={l.companyLogo}
                  />
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function CtaBand() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-900 py-24 text-white sm:py-32">
      <img
        src={images.sections.ctaBand.src}
        alt=""
        loading="lazy"
        className="-z-20 absolute inset-0 size-full object-cover"
      />
      <div className="-z-10 absolute inset-0 bg-[linear-gradient(90deg,rgba(8,26,40,0.95),rgba(21,59,85,0.75))]" />
      <Reveal className="container-public grid max-w-3xl gap-6 ps-4 sm:ps-6 lg:ms-[max(0px,calc((100vw-1200px)/2))]">
        <p className="font-medium text-gold text-xs uppercase tracking-[0.2em]">
          Eligible companies
        </p>
        <h2 className="text-balance font-bold font-heading text-4xl leading-tight sm:text-5xl">
          Ready to make your commitment count?
        </h2>
        <p className="max-w-xl text-lg text-white/80">
          Companies apply to become WEPs signatories. UN Women reviews every application before the
          portal is activated.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="gold" size="xl">
            <Link to="/join">
              Apply to join WEPs <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline-light" size="xl">
            <Link to="/application-status">Check application status</Link>
          </Button>
        </div>
      </Reveal>
    </section>
  )
}
