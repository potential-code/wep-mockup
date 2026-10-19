import { Link } from '@tanstack/react-router'
import { CalendarCheck, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { DemoLabel, FilterBar } from '@/components/shared/Cards'
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/use-session'
import { useBookingContext, useMentors } from '@/queries/mentorship.queries'
import { MentorCard } from '../components/MentorCard'
import { EMPTY_FILTERS, type MentorFilterState, MentorFilters } from '../components/MentorFilters'
import { PointsBanner } from '../components/PointsBanner'
import type { MentorRow } from '../lib/types'

const DAY = 864e5

export function MentorshipPage() {
  const { can } = useCurrentUser()
  const mentors = useMentors()
  const ctx = useBookingContext()
  const [filters, setFilters] = useState<MentorFilterState>(EMPTY_FILTERS)
  const rows = (mentors.data ?? []) as MentorRow[]

  const facets = useMemo(() => {
    const uniq = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b))
    return {
      topics: uniq(rows.flatMap((r) => r.profile.expertise)),
      languages: uniq(rows.flatMap((r) => r.profile.languages)),
      sectors: uniq(rows.flatMap((r) => r.profile.sectors)),
    }
  }, [rows])

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const p = r.profile
        if (filters.topic !== 'all' && !p.expertise.includes(filters.topic)) return false
        if (filters.language !== 'all' && !p.languages.includes(filters.language)) return false
        if (filters.sector !== 'all' && !p.sectors.includes(filters.sector)) return false
        if (filters.availability !== 'all') {
          // The demo clock is 19 Oct 2026.
          const limit =
            new Date('2026-10-19T09:00:00Z').getTime() + Number(filters.availability) * DAY
          if (!r.nextSlot || new Date(r.nextSlot).getTime() > limit) return false
        }
        return true
      }),
    [rows, filters],
  )

  const recommended = filtered.filter((r) => r.reasons.length > 0).slice(0, 3)
  const [extra, setExtra] = useState(0)
  const allOthers = filtered.filter((r) => !recommended.includes(r))
  const others = allOthers.slice(0, Math.max(0, 6 - recommended.length) + extra)
  const canBook = can('mentorship.book') && (ctx.data?.shortfall ?? 0) === 0

  return (
    <div>
      <PageHeader
        title="Mentorship"
        description="Book a 30-minute session with a WEPs expert using your points."
        eyebrow={<DemoLabel>Proposed feature</DemoLabel>}
        actions={
          <Button asChild variant="outline">
            <Link to="/portal/mentorship/bookings">
              <CalendarCheck aria-hidden /> My bookings
            </Link>
          </Button>
        }
      />

      <div className="grid gap-8">
        {ctx.isLoading ? (
          <Skeleton className="h-28 rounded-2xl" />
        ) : ctx.data ? (
          <PointsBanner
            points={{
              redeemable: ctx.data.balance.redeemable,
              lifetime: ctx.data.balance.lifetime,
              cost: ctx.data.cost,
              shortfall: ctx.data.shortfall,
            }}
          />
        ) : null}

        <div>
          <FilterBar count={filtered.length}>
            <MentorFilters
              value={filters}
              onChange={setFilters}
              topics={facets.topics}
              languages={facets.languages}
              sectors={facets.sectors}
            />
          </FilterBar>

          {mentors.isLoading ? (
            <CardGridSkeleton count={6} />
          ) : mentors.isError ? (
            <ErrorState message={mentors.error.message} onRetry={() => mentors.refetch()} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No experts match these filters"
              description="Try a different topic or language, or clear the filters to see everyone."
              action={<Button onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</Button>}
            />
          ) : (
            <div className="grid gap-10">
              {recommended.length > 0 ? (
                <section aria-labelledby="rec-h">
                  <h2
                    id="rec-h"
                    className="mb-4 flex items-center gap-2 font-heading font-semibold text-navy text-section"
                  >
                    <Sparkles className="size-5 text-gold" aria-hidden /> Recommended for you
                  </h2>
                  <Stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {recommended.map((m) => (
                      <StaggerItem key={m.profile.userId}>
                        <MentorCard mentor={m} canBook={canBook} />
                      </StaggerItem>
                    ))}
                  </Stagger>
                </section>
              ) : null}
              {others.length > 0 ? (
                <section aria-labelledby="all-h">
                  <h2 id="all-h" className="mb-4 font-heading font-semibold text-navy text-section">
                    {recommended.length > 0 ? 'All experts' : 'Experts'}
                  </h2>
                  <Stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {others.map((m) => (
                      <StaggerItem key={m.profile.userId}>
                        <MentorCard mentor={m} canBook={canBook} />
                      </StaggerItem>
                    ))}
                  </Stagger>
                  {allOthers.length > others.length ? (
                    <div className="mt-5 flex justify-center">
                      <Button variant="outline" onClick={() => setExtra((n) => n + 6)}>
                        Show more experts ({allOthers.length - others.length} more)
                      </Button>
                    </div>
                  ) : null}
                </section>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
