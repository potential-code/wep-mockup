import type { CommunitySpace } from '@shared/types'
import { Eye, EyeOff, Megaphone, Pin, PinOff } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { type Column, DataTable } from '@/components/shared/DataTable'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/shared/States'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/format'
import { useCompaniesTable } from '@/queries/admin.queries'
import {
  CHANNELS,
  useAllListings,
  useListingQueue,
  useModerate,
  useModerationQueue,
  usePostAnnouncement,
} from '@/queries/community.queries'
import { Field } from '../components/common'
import { ListingReview, type ListingRow } from '../components/ListingReview'

export function ManageCommunityPage() {
  const queue = useListingQueue()
  return (
    <div>
      <PageHeader
        title="Community and Marketplace"
        description="Moderate discussions, post announcements and review marketplace listings."
      />
      <Tabs defaultValue="listings">
        <TabsList>
          <TabsTrigger value="moderation">Moderation queue</TabsTrigger>
          <TabsTrigger value="listings">
            Listings review
            {queue.data?.length ? (
              <span className="ms-1.5 rounded-full bg-gold px-1.5 text-[11px] text-navy">
                {queue.data.length}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="moderation" className="pt-3">
          <Moderation />
        </TabsContent>
        <TabsContent value="listings" className="pt-3">
          <Listings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ---------------------------------------------------------------- moderation -- */

function Moderation() {
  const { data, isLoading, error, refetch } = useModerationQueue()
  const moderate = useModerate()
  const post = usePostAnnouncement()
  const [form, setForm] = useState({
    space: 'discussions' as CommunitySpace,
    channel: CHANNELS[0] as string,
    title: '',
    body: '',
  })
  const [touched, setTouched] = useState(false)

  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  const act = (threadId: string, action: 'hide' | 'restore' | 'pin' | 'unpin', replyId?: string) =>
    moderate.mutate(
      { threadId, action, replyId },
      {
        onSuccess: () =>
          toast.success(
            {
              hide: 'Content hidden',
              restore: 'Content restored',
              pin: 'Thread pinned',
              unpin: 'Thread unpinned',
            }[action],
          ),
      },
    )

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="grid content-start gap-4">
        {isLoading ? <PageSkeleton /> : null}
        {!isLoading && data?.length === 0 ? (
          <EmptyState
            title="Queue is clear"
            description="Flagged and hidden threads and replies appear here for review."
          />
        ) : null}
        {data?.map((v) => {
          const t = v.thread
          const flaggedReplies = t.replies.filter((r) => r.status !== 'visible')
          return (
            <SectionCard key={t.id}>
              <div className="grid gap-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-navy">{t.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {v.author.name} · {v.author.company} · {t.channel} · {formatDate(t.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {t.status !== 'visible' ? (
                      <StatusBadge tone={t.status === 'hidden' ? 'neutral' : 'warning'}>
                        {t.status === 'hidden' ? 'Hidden' : 'Flagged'}
                      </StatusBadge>
                    ) : null}
                    {t.pinned ? (
                      <StatusBadge tone="info" icon={Pin}>
                        Pinned
                      </StatusBadge>
                    ) : null}
                  </div>
                </div>
                <p className="line-clamp-3 text-sm">{t.body}</p>
                <div className="flex flex-wrap gap-2">
                  {t.status === 'hidden' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={moderate.isPending}
                      onClick={() => act(t.id, 'restore')}
                    >
                      <Eye aria-hidden /> Restore
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={moderate.isPending}
                      onClick={() => act(t.id, 'hide')}
                    >
                      <EyeOff aria-hidden /> Hide
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={moderate.isPending}
                    onClick={() => act(t.id, t.pinned ? 'unpin' : 'pin')}
                  >
                    {t.pinned ? <PinOff aria-hidden /> : <Pin aria-hidden />}{' '}
                    {t.pinned ? 'Unpin' : 'Pin'}
                  </Button>
                </div>
                {flaggedReplies.length ? (
                  <ul className="grid gap-2 border-t pt-3">
                    {flaggedReplies.map((r) => (
                      <li
                        key={r.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface p-2.5 text-sm"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="font-medium">
                            {v.replyAuthors[r.authorId]?.name ?? 'Member'}:
                          </span>{' '}
                          {r.body}
                        </span>
                        <span className="flex items-center gap-2">
                          <StatusBadge tone={r.status === 'hidden' ? 'neutral' : 'warning'}>
                            {r.status === 'hidden' ? 'Hidden' : 'Flagged'}
                          </StatusBadge>
                          {r.status === 'hidden' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => act(t.id, 'restore', r.id)}
                            >
                              Restore
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => act(t.id, 'hide', r.id)}
                            >
                              Hide
                            </Button>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </SectionCard>
          )
        })}
      </div>

      <SectionCard
        title="Pinned announcement"
        description="Posted by UN Women and pinned to the top of the space."
      >
        <div className="grid gap-3">
          <Field label="Space">
            <Select
              value={form.space}
              onValueChange={(v) => setForm((f) => ({ ...f, space: v as CommunitySpace }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discussions">Discussions</SelectItem>
                <SelectItem value="signatory_circle">Signatory Circle</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Channel">
            <Select
              value={form.channel}
              onValueChange={(v) => setForm((f) => ({ ...f, channel: v }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNELS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Title" required>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              aria-invalid={touched && form.title.trim().length < 8}
            />
            {touched && form.title.trim().length < 8 ? (
              <span role="alert" className="text-danger text-xs">
                Give a clear title (8+ characters).
              </span>
            ) : null}
          </Field>
          <Field label="Message" required>
            <Textarea
              rows={4}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              aria-invalid={touched && !form.body.trim()}
            />
          </Field>
          <Button
            disabled={post.isPending}
            onClick={() => {
              setTouched(true)
              if (form.title.trim().length < 8 || !form.body.trim()) return
              post.mutate(form, {
                onSuccess: () => {
                  toast.success('Announcement posted and pinned')
                  setForm((f) => ({ ...f, title: '', body: '' }))
                  setTouched(false)
                },
              })
            }}
          >
            <Megaphone aria-hidden /> {post.isPending ? 'Posting…' : 'Post and pin'}{' '}
          </Button>
        </div>
      </SectionCard>
    </div>
  )
}

/* ------------------------------------------------------------------ listings -- */

function Listings() {
  const queue = useListingQueue()
  const all = useAllListings()
  const companies = useCompaniesTable({})
  const [open, setOpen] = useState<string | null>(null)
  const statusOf = (companyId: string) =>
    companies.data?.find((c) => c.company.id === companyId)?.company.signatoryStatus

  const cols: Column<ListingRow>[] = [
    {
      key: 'title',
      header: 'Listing',
      sortValue: (r) => r.listing.title,
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-navy">{r.listing.title}</p>
          <p className="truncate text-muted-foreground text-xs">
            {r.companyName} · {r.listing.category}
          </p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      cell: (r) => (r.listing.type === 'product' ? 'Product' : 'Service'),
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => r.listing.status,
      cell: (r) => (
        <span className="flex flex-wrap gap-1">
          <WorkflowStatus status={r.listing.status} />
          {r.listing.pendingRevision ? (
            <StatusBadge tone="warning">Edit pending</StatusBadge>
          ) : null}
        </span>
      ),
    },
    {
      key: 'created',
      header: 'Submitted',
      sortValue: (r) => r.listing.createdAt,
      cell: (r) => formatDate(r.listing.createdAt),
      hideOnMobile: true,
    },
    {
      key: 'go',
      header: '',
      cell: (r) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            setOpen(r.listing.id)
          }}
        >
          Review
        </Button>
      ),
    },
  ]

  const selected =
    [...(queue.data ?? []), ...(all.data ?? [])].find((r) => r.listing.id === open) ?? null
  if (queue.error) return <ErrorState message={queue.error.message} onRetry={queue.refetch} />

  return (
    <div className="grid gap-8">
      <section aria-labelledby="queue">
        <h2 id="queue" className="mb-1 font-heading font-semibold text-lg text-navy">
          Review queue
        </h2>
        <p className="mb-3 text-muted-foreground text-sm">
          Submitted, resubmitted and materially edited listings. Publishing creates an activity
          record and notifies the company.
        </p>
        <DataTable
          caption="Review queue"
          columns={cols}
          rows={queue.data ?? []}
          getRowId={(r) => r.listing.id}
          isLoading={queue.isLoading}
          onRowClick={(r) => setOpen(r.listing.id)}
          empty="No listings are waiting for review."
        />
      </section>
      <section aria-labelledby="all">
        <h2 id="all" className="mb-3 font-heading font-semibold text-lg text-navy">
          All listings
        </h2>
        <DataTable
          caption="All listings"
          columns={cols}
          rows={all.data ?? []}
          getRowId={(r) => r.listing.id}
          isLoading={all.isLoading}
          onRowClick={(r) => setOpen(r.listing.id)}
        />
      </section>
      <ListingReview
        row={selected}
        companyStatus={selected ? statusOf(selected.listing.companyId) : undefined}
        onClose={() => setOpen(null)}
      />
    </div>
  )
}
