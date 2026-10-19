import { Link } from '@tanstack/react-router'
import { Info, ListChecks, Plus, Search, Store } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrentUser } from '@/hooks/use-session'
import { usePublishedListings } from '@/queries/community.queries'
import { ListingCard } from '../components/ListingCard'

const ALL = 'all'

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="w-full sm:w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}: all</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o} className="capitalize">
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function MarketplacePage() {
  const { can } = useCurrentUser()
  const { data, isLoading, error, refetch } = usePublishedListings()
  const [q, setQ] = useState('')
  const [type, setType] = useState(ALL)
  const [category, setCategory] = useState(ALL)
  const [company, setCompany] = useState(ALL)
  const [region, setRegion] = useState(ALL)
  const [basis, setBasis] = useState(ALL)
  const uniq = (f: (d: NonNullable<typeof data>[number]) => string) =>
    [...new Set((data ?? []).map(f))].sort()

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (data ?? []).filter((d) => {
      const l = d.listing
      return (
        (type === ALL || l.type === type) &&
        (category === ALL || l.category === category) &&
        (company === ALL || d.companyName === company) &&
        (region === ALL || l.region === region) &&
        (basis === ALL || (basis === 'fixed' ? !!l.price : !l.price)) &&
        (!term ||
          `${l.title} ${l.description} ${l.category} ${d.companyName}`.toLowerCase().includes(term))
      )
    })
  }, [data, q, type, category, company, region, basis])

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h2 className="text-section text-navy">Products and Services</h2>
          <p className="max-w-2xl text-muted-foreground text-sm">
            Offers from signatory companies. You buy directly from the provider on their own site.
          </p>
        </div>
        {can('marketplace.manage') ? (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/portal/community/marketplace/mine">
                <ListChecks /> My listings
              </Link>
            </Button>
            <Button asChild>
              <Link to="/portal/community/marketplace/submit">
                <Plus /> Submit product or service
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
      <p className="flex items-start gap-2 rounded-xl border border-gold/40 bg-gold-50 p-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden />
        <span>
          <strong className="text-navy">
            Approval means publication permission, not endorsement.
          </strong>{' '}
          UN Women does not endorse, recommend or guarantee any listed product or service, and no
          sales are processed here.
        </span>
      </p>
      <div className="grid gap-2 sm:flex sm:flex-wrap">
        <div className="relative min-w-60 flex-1">
          <Search
            className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            aria-label="Search products and services"
            className="ps-9"
            placeholder="Search products and services"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <FilterSelect
          label="Type"
          value={type}
          onChange={setType}
          options={['product', 'service']}
        />
        <FilterSelect
          label="Category"
          value={category}
          onChange={setCategory}
          options={uniq((d) => d.listing.category)}
        />
        <FilterSelect
          label="Company"
          value={company}
          onChange={setCompany}
          options={uniq((d) => d.companyName)}
        />
        <FilterSelect
          label="Coverage"
          value={region}
          onChange={setRegion}
          options={uniq((d) => d.listing.region)}
        />
        <FilterSelect
          label="Pricing"
          value={basis}
          onChange={setBasis}
          options={['fixed', 'quotation']}
        />
      </div>
      <p className="text-muted-foreground text-sm" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'listing' : 'listings'}
      </p>
      {isLoading ? (
        <CardGridSkeleton />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No listings match"
          description="Try removing a filter or searching for something broader."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQ('')
                setType(ALL)
                setCategory(ALL)
                setCompany(ALL)
                setRegion(ALL)
                setBasis(ALL)
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <ListingCard key={d.listing.id} data={d} />
          ))}
        </div>
      )}
    </div>
  )
}
