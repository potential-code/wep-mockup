import { PRINCIPLES } from '@shared/reference'
import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarX, Globe2, Lock } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { FilterBar } from '@/components/shared/Cards'
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { timeZoneLabel } from '@/lib/format'
import { usePublicEvents } from '@/queries/clinics.queries'
import { PublicEventCard } from '../components/cards'
import { FilterSelect } from '../components/FilterSelect'
import { PageIntro } from '../components/PageIntro'

export function PublicClinicsPage() {
  const { data, isLoading, isError, refetch } = usePublicEvents()
  const [type, setType] = useState('all')
  const [principle, setPrinciple] = useState('')

  const list = useMemo(
    () =>
      (data ?? []).filter(
        (e) =>
          (type === 'all' || e.event.type === type) &&
          (!principle || String(e.event.principle) === principle),
      ),
    [data, type, principle],
  )

  return (
    <>
      <PageIntro
        eyebrow="Clinics and events"
        title="Live support, when your team is ready"
        description="Expert-led clinics and webinars on hiring, procurement, communications and reporting."
      >
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/85">
          <Globe2 className="size-4 text-gold" aria-hidden /> Times shown in your timezone:{' '}
          {timeZoneLabel()}
        </p>
      </PageIntro>
      <section className="bg-surface py-12 sm:py-16">
        <div className="container-public">
          <FilterBar count={list.length}>
            <ToggleGroup
              type="single"
              value={type}
              onValueChange={(v) => v && setType(v)}
              variant="outline"
              aria-label="Event type"
              className="bg-card"
            >
              <ToggleGroupItem value="all" className="px-4">
                All
              </ToggleGroupItem>
              <ToggleGroupItem value="clinic" className="px-4">
                Clinics
              </ToggleGroupItem>
              <ToggleGroupItem value="webinar" className="px-4">
                Webinars
              </ToggleGroupItem>
            </ToggleGroup>
            <FilterSelect
              label="All principles"
              value={principle}
              onChange={setPrinciple}
              options={PRINCIPLES.map((p) => ({
                value: String(p.id),
                label: `P${p.id} · ${p.short}`,
              }))}
            />
          </FilterBar>

          {isLoading ? (
            <CardGridSkeleton />
          ) : isError ? (
            <ErrorState message="We could not load upcoming events." onRetry={() => refetch()} />
          ) : list.length === 0 ? (
            <EmptyState
              icon={CalendarX}
              title="No upcoming events match"
              description="Try another principle or event type."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setType('all')
                    setPrinciple('')
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <Stagger
              key={`${type}${principle}`}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {list.map((e) => (
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

          <div className="mt-14 grid gap-8 rounded-3xl border bg-card p-8 shadow-card sm:p-10 lg:grid-cols-[1.3fr_1fr]">
            <div className="grid content-start gap-3">
              <p className="flex items-center gap-2 font-heading font-semibold text-navy text-xl">
                <Lock className="size-5 text-gold-700" aria-hidden /> How eligibility works
              </p>
              <p className="text-muted-foreground">
                Most clinics are reserved for people who have prepared. Complete your department
                pathway and reach the qualifying points to unlock registration. Points reward
                learning and participation; they never confer signatory status.
              </p>
              <p className="text-muted-foreground text-sm">
                Eligibility rules shown here are a proposed portal feature.
              </p>
            </div>
            <div className="flex flex-wrap content-center items-center gap-3 lg:justify-end">
              <Button asChild size="lg">
                <Link to="/sign-in" search={{ redirect: '/portal/clinics' }}>
                  Sign in to register
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/join">
                  Join WEPs <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
