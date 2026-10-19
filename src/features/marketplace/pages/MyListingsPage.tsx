import type { Listing } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { Eye, MousePointerClick, Pencil, Plus, Store, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/shared/States'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { formatDateTime } from '@/lib/format'
import { useMyListings, useWithdrawListing } from '@/queries/community.queries'

const EDITABLE: Listing['status'][] = [
  'draft',
  'changes_requested',
  'published',
  'rejected',
  'withdrawn',
]
const WITHDRAWABLE: Listing['status'][] = [
  'draft',
  'submitted',
  'under_review',
  'resubmitted',
  'changes_requested',
  'published',
]

export function MyListingsPage() {
  const { data, isLoading, error, refetch } = useMyListings()
  const withdraw = useWithdrawListing()
  const [target, setTarget] = useState<Listing | null>(null)

  return (
    <div className="grid gap-5">
      <PageHeader
        breadcrumbs={[
          { label: 'Community', to: '/portal/community' },
          { label: 'Products and Services', to: '/portal/community/marketplace' },
          { label: 'My listings' },
        ]}
        title="My listings"
        description="Your company’s submissions, their review status and feedback from UN Women."
        actions={
          <Button asChild>
            <Link to="/portal/community/marketplace/submit">
              <Plus /> Submit product or service
            </Link>
          </Button>
        }
      />
      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No listings yet"
          description="Submit your first product or service for review."
          action={
            <Button asChild>
              <Link to="/portal/community/marketplace/submit">Submit a listing</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4">
          {data.map(({ listing: l }) => (
            <li
              key={l.id}
              className="grid gap-4 rounded-2xl border bg-card p-4 shadow-card sm:grid-cols-[10rem_1fr] sm:p-5"
            >
              {l.image ? (
                <img
                  src={l.image}
                  alt=""
                  className="aspect-[16/10] w-full rounded-xl object-cover"
                />
              ) : null}
              <div className="grid min-w-0 gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading font-semibold text-lg text-navy">{l.title}</h2>
                  <WorkflowStatus status={l.status} />
                  {l.pendingRevision ? (
                    <StatusBadge tone="warning">Revision pending</StatusBadge>
                  ) : null}
                </div>
                {l.reviewerNote && l.status !== 'published' ? (
                  <p className="rounded-xl bg-surface p-3 text-sm">
                    <strong className="text-navy">Reviewer feedback: </strong>
                    {l.reviewerNote}
                  </p>
                ) : null}
                {l.status === 'published' ? (
                  <p className="flex gap-4 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1">
                      <Eye className="size-4" aria-hidden />
                      {l.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointerClick className="size-4" aria-hidden />
                      {l.outboundClicks} provider clicks
                    </span>
                  </p>
                ) : null}
                <Collapsible>
                  <CollapsibleTrigger className="text-blue text-sm hover:underline">
                    History ({l.history.length})
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ol className="mt-2 grid gap-1.5 border-s ps-4 text-sm">
                      {l.history.map((h) => (
                        <li key={`${h.at}-${h.label}`}>
                          <span className="font-medium text-navy">{h.label}</span>{' '}
                          <span className="text-muted-foreground text-xs">
                            {formatDateTime(h.at)}
                          </span>
                          {h.note ? (
                            <span className="block text-muted-foreground">{h.note}</span>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  </CollapsibleContent>
                </Collapsible>
                <div className="flex flex-wrap gap-2">
                  {l.status === 'published' ? (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        to="/portal/community/marketplace/$listingId"
                        params={{ listingId: l.id }}
                      >
                        View
                      </Link>
                    </Button>
                  ) : null}
                  {EDITABLE.includes(l.status) ? (
                    <Button
                      asChild
                      size="sm"
                      variant={l.status === 'changes_requested' ? 'default' : 'outline'}
                    >
                      <Link to="/portal/community/marketplace/submit" search={{ id: l.id }}>
                        <Pencil />{' '}
                        {l.status === 'changes_requested'
                          ? 'Edit and resubmit'
                          : l.status === 'draft'
                            ? 'Edit draft'
                            : 'Edit'}
                      </Link>
                    </Button>
                  ) : null}
                  {WITHDRAWABLE.includes(l.status) ? (
                    <Button variant="ghost" size="sm" onClick={() => setTarget(l)}>
                      <Undo2 /> Withdraw
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
        title="Withdraw this listing?"
        description={
          target?.status === 'published'
            ? 'It will no longer be visible in Products and Services.'
            : 'It will leave the review queue. You can edit and submit it again later.'
        }
        confirmLabel="Withdraw listing"
        destructive
        pending={withdraw.isPending}
        onConfirm={() =>
          target &&
          withdraw.mutate(target.id, {
            onSuccess: () => {
              setTarget(null)
              toast.success('Listing withdrawn')
            },
          })
        }
      />
    </div>
  )
}
