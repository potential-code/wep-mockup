import type { Listing } from '@shared/types'
import { Archive, Check, ExternalLink, FileText, MessageSquareWarning, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { formatDateTime } from '@/lib/format'
import { useReviewListing, useStartListingReview } from '@/queries/community.queries'
import { Detail, ReasonDialog, SwitchRow } from './common'

export interface ListingRow {
  listing: Listing
  companyName: string
  companyLogo?: string
  companyCountry?: string
}

type Decision = 'request_changes' | 'reject' | 'archive'

const DIALOG: Record<
  Decision,
  { title: string; confirm: string; toast: string; destructive?: boolean }
> = {
  request_changes: {
    title: 'Request changes',
    confirm: 'Send request',
    toast: 'Changes requested. The company has been notified.',
  },
  reject: {
    title: 'Reject listing',
    confirm: 'Reject listing',
    toast: 'Listing rejected. The company has been notified.',
    destructive: true,
  },
  archive: {
    title: 'Archive listing',
    confirm: 'Archive listing',
    toast: 'Listing archived.',
    destructive: true,
  },
}

/** Review drawer: content, company status, documents and the four decisions. */
export function ListingReview({
  row,
  companyStatus,
  onClose,
}: {
  row: ListingRow | null
  companyStatus?: string
  onClose: () => void
}) {
  const start = useStartListingReview()
  const review = useReviewListing()
  const [publicVisible, setPublicVisible] = useState(false)
  const [decision, setDecision] = useState<Decision | null>(null)
  const id = row?.listing.id
  const status = row?.listing.status

  // Opening a submitted listing starts the review.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once per opened listing
  useEffect(() => {
    if (id && (status === 'submitted' || status === 'resubmitted')) start.mutate(id)
    setPublicVisible(row?.listing.publicVisible ?? false)
  }, [id])

  const l = row?.listing
  const decided = l
    ? ['published', 'rejected', 'archived', 'withdrawn', 'changes_requested'].includes(l.status) &&
      !l.pendingRevision
    : false

  return (
    <Sheet open={Boolean(row)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {row && l ? (
          <>
            <SheetHeader>
              <SheetTitle>{l.title}</SheetTitle>
              <SheetDescription>
                {row.companyName} · {l.type === 'product' ? 'Product' : 'Service'} · {l.category}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-5 px-4 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <WorkflowStatus status={l.status} />
                {l.pendingRevision ? (
                  <StatusBadge tone="warning">Material edit pending</StatusBadge>
                ) : null}
                <StatusBadge tone={companyStatus === 'approved' ? 'success' : 'danger'}>
                  Company:{' '}
                  {companyStatus === 'approved'
                    ? 'approved signatory'
                    : (companyStatus ?? 'unknown')}
                </StatusBadge>
              </div>
              <img src={l.image} alt="" className="aspect-[16/7] w-full rounded-xl object-cover" />
              <p className="text-sm">{l.description}</p>
              {l.pendingRevision ? (
                <div className="rounded-xl border border-coral/40 bg-coral-50/60 p-3 text-sm">
                  <p className="mb-1 font-medium text-navy">Proposed changes</p>
                  <ul className="list-disc ps-5">
                    {Object.entries(l.pendingRevision).map(([k, v]) => (
                      <li key={k}>
                        <span className="font-medium">{k}:</span> {String(v)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <dl className="grid grid-cols-2 gap-4">
                <Detail label="Value to signatories">{l.value}</Detail>
                <Detail label="Region">{l.region}</Detail>
                <Detail label="Price">
                  {l.price ? `${l.currency ?? 'USD'} ${l.price}` : (l.quoteNote ?? 'On request')}
                </Detail>
                <Detail label="Purchase link">
                  <a
                    href={l.purchaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue underline"
                  >
                    Open <ExternalLink className="size-3" aria-hidden />
                  </a>
                </Detail>
              </dl>
              <section>
                <h3 className="mb-2 font-medium text-navy text-sm">Documents</h3>
                {l.documents.length ? (
                  <ul className="grid gap-1.5">
                    {l.documents.map((d) => (
                      <li key={d} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                        <FileText className="size-4 text-blue" aria-hidden /> {d}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No supporting documents attached.</p>
                )}
              </section>
              {l.reviewerNote ? (
                <p className="rounded-lg bg-surface p-3 text-sm">
                  <span className="font-medium">Last reviewer note:</span> {l.reviewerNote}
                </p>
              ) : null}
              <section>
                <h3 className="mb-2 font-medium text-navy text-sm">History</h3>
                <ol className="grid gap-1.5 text-sm">
                  {[...l.history].reverse().map((h) => (
                    <li key={`${h.at}-${h.label}`} className="flex flex-wrap gap-x-2">
                      <span className="text-muted-foreground">{formatDateTime(h.at)}</span>
                      <span>
                        {h.label}
                        {h.note ? ` — ${h.note}` : ''}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              {!decided || l.status === 'published' || l.status === 'changes_requested' ? (
                <section className="grid gap-3 border-t pt-4">
                  <h3 className="font-heading font-medium text-navy">Decision</h3>
                  {l.status !== 'published' || l.pendingRevision ? (
                    <>
                      <SwitchRow
                        label="Show in the public catalogue preview"
                        description="Off keeps the listing visible to signed-in signatories only."
                        checked={publicVisible}
                        onCheckedChange={setPublicVisible}
                      />
                      <Button
                        disabled={review.isPending || companyStatus !== 'approved'}
                        onClick={() =>
                          review.mutate(
                            { id: l.id, decision: 'approve', publicVisible },
                            {
                              onSuccess: () => {
                                toast.success(
                                  'Approved and published. An activity record and notification were created.',
                                )
                                onClose()
                              },
                            },
                          )
                        }
                      >
                        <Check aria-hidden />{' '}
                        {review.isPending ? 'Publishing…' : 'Approve and publish'}
                      </Button>
                    </>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {l.status !== 'published' && l.status !== 'changes_requested' ? (
                      <>
                        <Button variant="outline" onClick={() => setDecision('request_changes')}>
                          <MessageSquareWarning aria-hidden /> Request changes
                        </Button>
                        <Button
                          variant="outline"
                          className="text-danger"
                          onClick={() => setDecision('reject')}
                        >
                          <XCircle aria-hidden /> Reject
                        </Button>
                      </>
                    ) : null}
                    {l.status === 'published' ? (
                      <Button variant="outline" onClick={() => setDecision('archive')}>
                        <Archive aria-hidden /> Archive
                      </Button>
                    ) : null}
                  </div>
                  {companyStatus !== 'approved' ? (
                    <p className="text-danger text-xs">
                      Listings can only be published for approved signatory companies.
                    </p>
                  ) : null}
                </section>
              ) : null}
            </div>
            <ReasonDialog
              open={Boolean(decision)}
              onOpenChange={(o) => !o && setDecision(null)}
              title={decision ? DIALOG[decision].title : ''}
              description={
                decision === 'request_changes'
                  ? 'The company sees this message and can edit and resubmit.'
                  : 'The company is notified with your reason.'
              }
              confirmLabel={decision ? DIALOG[decision].confirm : ''}
              destructive={decision ? DIALOG[decision].destructive : false}
              pending={review.isPending}
              label={decision === 'request_changes' ? 'What should change?' : 'Reason'}
              onConfirm={(note) =>
                decision &&
                review.mutate(
                  { id: l.id, decision, note },
                  {
                    onSuccess: () => {
                      toast.success(DIALOG[decision].toast)
                      setDecision(null)
                      onClose()
                    },
                  },
                )
              }
            />
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
