import { REGIONS, SECTORS } from '@shared/reference'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Building2, Lock } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal'
import { DemoLabel, FilterBar } from '@/components/shared/Cards'
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { usePublicListings } from '@/queries/community.queries'
import { usePublicDirectory } from '@/queries/company.queries'
import { ListingCard } from '../components/CommunityPreview'
import { CompanyCard } from '../components/CompanyCard'
import { FilterSelect } from '../components/FilterSelect'
import { PageIntro } from '../components/PageIntro'
import { SearchInput } from '../components/SearchInput'
import { SectionHeading } from '../components/SectionHeading'

const toOptions = (a: string[]) => a.map((v) => ({ value: v, label: v }))

export function DirectoryPage() {
  const dir = usePublicDirectory()
  const listings = usePublicListings()
  const [q, setQ] = useState('')
  const [region, setRegion] = useState('')
  const [sector, setSector] = useState('')

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (dir.data ?? []).filter(
      (c) =>
        (!region || c.region === region) &&
        (!sector || c.sector === sector) &&
        (!term || `${c.name} ${c.country}`.toLowerCase().includes(term)),
    )
  }, [dir.data, q, region, sector])

  return (
    <>
      <PageIntro
        eyebrow="Company community"
        title="Signatories putting the Principles into practice"
        description="Companies whose WEPs commitment has been approved by UN Women, with the public information they have chosen to share."
      />
      <section className="bg-surface py-12 sm:py-16">
        <div className="container-public">
          <FilterBar count={list.length}>
            <SearchInput value={q} onChange={setQ} label="Search companies" />
            <FilterSelect
              label="All regions"
              value={region}
              onChange={setRegion}
              options={toOptions(REGIONS)}
            />
            <FilterSelect
              label="All sectors"
              value={sector}
              onChange={setSector}
              options={toOptions(SECTORS)}
            />
          </FilterBar>
          {dir.isLoading ? (
            <CardGridSkeleton />
          ) : dir.isError ? (
            <ErrorState
              message="We could not load the directory preview."
              onRetry={() => dir.refetch()}
            />
          ) : list.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No companies match those filters"
              description="Try a different region or sector."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQ('')
                    setRegion('')
                    setSector('')
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <Stagger
              key={`${q}${region}${sector}`}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {list.map((c) => (
                <StaggerItem key={c.id} className="h-full">
                  <CompanyCard company={c} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
          <p className="mt-6 text-muted-foreground text-sm">
            Approval to appear here is a publication permission, not an endorsement by UN Women.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-public">
          <SectionHeading
            eyebrow="Products and services"
            title="Approved offers that support the Principles"
            description={
              <>
                A preview of listings reviewed before publication. Purchases happen on the
                provider’s own site. <DemoLabel>Proposed feature</DemoLabel>
              </>
            }
          />
          {listings.isLoading ? (
            <CardGridSkeleton count={3} />
          ) : listings.isError ? (
            <ErrorState message="We could not load listings." onRetry={() => listings.refetch()} />
          ) : (
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.data?.map((l) => (
                <StaggerItem key={l.listing.id} className="h-full">
                  <div className="h-full [&>*]:h-full">
                    <ListingCard
                      listing={l.listing}
                      companyName={l.companyName}
                      companyLogo={l.companyLogo}
                    />
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          )}
          <Reveal className="mt-14 grid items-center gap-6 rounded-3xl bg-navy p-8 text-white sm:p-10 md:grid-cols-[1fr_auto]">
            <div>
              <p className="flex items-center gap-2 font-heading font-semibold text-xl">
                <Lock className="size-5 text-gold" aria-hidden /> Discussions and listings are for
                members
              </p>
              <p className="mt-1 max-w-2xl text-white/75">
                Posting, replying and submitting listings need a signed-in account from an approved
                company.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link to="/join">
                  Join WEPs <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline-light" size="lg">
                <Link to="/sign-in">Sign in</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
