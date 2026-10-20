import { Link, useParams } from '@tanstack/react-router'
import { ExternalLink, FileText, MapPin, Pencil, Tag } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { AccessNotice, ErrorState, PageSkeleton } from '@/components/shared/States'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { CompanyLogo } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { useListing, useTrackOutbound } from '@/queries/community.queries'

export function ListingDetailPage() {
  const { listingId } = useParams({ from: '/_app/portal/community/marketplace/$listingId' })
  const { data, isLoading, error, refetch } = useListing(listingId)
  const track = useTrackOutbound()

  if (isLoading) return <PageSkeleton />
  if (error) {
    return (error as { code?: string }).code === 'not_found' ? (
      <AccessNotice
        title="Listing unavailable"
        message={error.message}
        action={
          <Button asChild variant="outline">
            <Link to="/portal/community/marketplace">Back to Products and Services</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState message={error.message} onRetry={() => refetch()} />
    )
  }
  if (!data) return null
  const { listing: l, companyName, companyLogo, companyCountry, own } = data
  const visit = () => {
    track.mutate(l.id)
    window.open(l.purchaseUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Community', to: '/portal/community' },
          { label: 'Products and Services', to: '/portal/community/marketplace' },
          { label: l.title },
        ]}
        title={l.title}
        eyebrow={`${l.type === 'product' ? 'Product' : 'Service'} · ${l.category}`}
        actions={
          own ? (
            <Button asChild variant="outline">
              <Link to="/portal/community/marketplace/submit" search={{ id: l.id }}>
                <Pencil /> Edit listing
              </Link>
            </Button>
          ) : null
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          {l.image ? (
            <img
              src={l.image}
              alt={`${l.title}, offered by ${companyName}`}
              className="aspect-[16/9] w-full rounded-2xl object-cover shadow-card"
            />
          ) : null}
          <SectionCard title="About this offer">
            <p className="whitespace-pre-line">{l.description}</p>
            <h3 className="mt-5 font-heading font-medium text-navy">Proposed value</h3>
            <p className="mt-1 text-muted-foreground">{l.value}</p>
            {l.documents.length > 0 ? (
              <>
                <h3 className="mt-5 font-heading font-medium text-navy">Supporting documents</h3>
                <ul className="mt-2 grid gap-1.5 text-sm">
                  {l.documents.map((d) => (
                    <li key={d} className="flex items-center gap-2">
                      <FileText className="size-4 text-blue" aria-hidden />
                      {d}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </SectionCard>
          {own ? (
            <SectionCard title="Your listing" description="Visible to your company only.">
              <div className="grid gap-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <WorkflowStatus status={l.status} />
                  {l.pendingRevision ? (
                    <StatusBadge tone="warning">
                      Revision pending: current version stays live until approved
                    </StatusBadge>
                  ) : null}
                </div>
                {l.reviewerNote ? (
                  <p className="rounded-xl bg-surface p-3">
                    <strong className="text-navy">Reviewer feedback: </strong>
                    {l.reviewerNote}
                  </p>
                ) : null}
                <ol className="grid gap-2 border-s ps-4">
                  {l.history.map((h) => (
                    <li key={`${h.at}-${h.label}`}>
                      <span className="font-medium text-navy">{h.label}</span>{' '}
                      <span className="text-muted-foreground text-xs">{formatDateTime(h.at)}</span>
                      {h.note ? (
                        <span className="block text-muted-foreground">{h.note}</span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>
            </SectionCard>
          ) : null}
        </div>
        <aside className="grid gap-4 lg:sticky lg:top-4">
          <SectionCard title="Provider">
            <div className="flex items-center gap-3">
              <CompanyLogo name={companyName} src={companyLogo} />
              <div>
                <p className="font-semibold text-navy">{companyName}</p>
                <p className="text-muted-foreground text-sm">{companyCountry}</p>
              </div>
            </div>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
                <div>
                  <dt className="sr-only">Coverage</dt>
                  <dd>{l.region}</dd>
                </div>
              </div>
              <div className="flex gap-2">
                <Tag className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
                <div>
                  <dt className="sr-only">Price</dt>
                  <dd className="font-semibold text-navy">
                    {l.price
                      ? `From ${formatCurrency(l.price, l.currency ?? 'USD')}`
                      : 'Price on quotation'}
                  </dd>
                  {l.quoteNote ? <dd className="text-muted-foreground">{l.quoteNote}</dd> : null}
                </div>
              </div>
            </dl>
            <Button size="lg" className="mt-4 w-full" onClick={visit}>
              Visit provider to purchase <ExternalLink />
            </Button>
            <p className="mt-2 text-muted-foreground text-xs">
              External provider link: opens {companyName}’s own site in a new tab. Purchases,
              contracts and payment happen there, not on this portal.
            </p>
          </SectionCard>
          <p className="rounded-xl border border-coral/40 bg-coral-50 p-3 text-xs">
            Published with UN Women’s permission. This is not an endorsement of the product or
            service.
          </p>
        </aside>
      </div>
    </div>
  )
}
