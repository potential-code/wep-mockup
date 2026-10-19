import { Link, useParams } from '@tanstack/react-router'
import { Bell, BellOff, Bookmark, EyeOff, Flag, Loader2, Pin, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { AccessNotice, ErrorState, PageSkeleton } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCurrentUser } from '@/hooks/use-session'
import { relativeTime } from '@/lib/format'
import {
  useModerate,
  useReact,
  useReply,
  useReportContent,
  useThread,
  useToggleBookmark,
  useToggleFollow,
} from '@/queries/community.queries'
import { AUDIENCE } from '../components/community-shared'
import { ReplyItem } from '../components/ReplyItem'

export function ThreadPage() {
  const { threadId } = useParams({ from: '/_app/portal/community/thread/$threadId' })
  const { user } = useCurrentUser()
  const { data, isLoading, error, refetch } = useThread(threadId)
  const react = useReact()
  const bookmark = useToggleBookmark()
  const follow = useToggleFollow()
  const report = useReportContent()
  const moderate = useModerate()
  const reply = useReply()
  const [draft, setDraft] = useState('')
  const [confirm, setConfirm] = useState(false)

  if (isLoading) return <PageSkeleton />
  if (error) {
    const code = (error as { code?: string }).code
    return code === 'forbidden' || code === 'not_found' ? (
      <AccessNotice
        title={code === 'forbidden' ? 'This space is restricted' : 'Thread unavailable'}
        message={error.message}
        action={
          <Button asChild variant="outline">
            <Link to="/portal/community">Back to Discussions</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState message={error.message} onRetry={() => refetch()} />
    )
  }
  if (!data) return null
  const { thread: t, author, replyAuthors } = data
  const isAdmin = user?.role === 'global_admin'
  const circle = t.space === 'signatory_circle'
  const spaceTo = circle ? '/portal/community/circle' : '/portal/community'
  const send = () =>
    reply.mutate(
      { threadId, body: draft },
      {
        onSuccess: () => {
          setDraft('')
          toast.success('Reply posted')
        },
      },
    )

  return (
    <div className="mx-auto grid max-w-3xl gap-5">
      <PageHeader
        breadcrumbs={[
          { label: 'Community', to: '/portal/community' },
          { label: circle ? 'Signatory Circle' : 'Discussions', to: spaceTo },
          { label: t.channel },
        ]}
        title={t.title}
        className="mb-0 sm:mb-0"
      />
      <article className="grid gap-3 rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <UserAvatar name={author.name} src={author.avatar} />
          <span className="font-medium text-navy">{author.name}</span>
          {author.company ? (
            <span className="text-muted-foreground">· {author.company}</span>
          ) : null}
          <span className="text-muted-foreground">· {relativeTime(t.createdAt)}</span>
          {t.isAnnouncement ? (
            <StatusBadge tone="gold" icon={Pin}>
              Announcement
            </StatusBadge>
          ) : t.pinned ? (
            <StatusBadge icon={Pin}>Pinned</StatusBadge>
          ) : null}
          {t.status === 'hidden' ? (
            <StatusBadge tone="danger" icon={EyeOff}>
              Hidden (admin view)
            </StatusBadge>
          ) : null}
        </div>
        <p className="whitespace-pre-line">{t.body}</p>
        {t.attachment ? <p className="text-blue text-sm">Attachment: {t.attachment}</p> : null}
        {t.status === 'flagged' && isAdmin ? (
          <p className="flex items-center gap-1.5 text-warning text-xs">
            <Flag className="size-3.5" aria-hidden /> Reported: awaiting moderator review
          </p>
        ) : null}
        <p className="text-muted-foreground text-xs">{AUDIENCE[t.space]}</p>
        <div className="flex flex-wrap gap-2 border-t pt-3">
          <Button variant="outline" size="sm" onClick={() => react.mutate({ threadId })}>
            <ThumbsUp /> {t.reactions}
            <span className="sr-only"> helpful</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-pressed={data.bookmarked}
            onClick={() =>
              bookmark.mutate(threadId, {
                onSuccess: () => toast.success(data.bookmarked ? 'Bookmark removed' : 'Bookmarked'),
              })
            }
          >
            <Bookmark className={data.bookmarked ? 'fill-current' : ''} />{' '}
            {data.bookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-pressed={data.following}
            onClick={() =>
              follow.mutate(threadId, {
                onSuccess: () =>
                  toast.success(data.following ? 'Unfollowed' : 'Following this thread'),
              })
            }
          >
            {data.following ? <BellOff /> : <Bell />} {data.following ? 'Unfollow' : 'Follow'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirm(true)}>
            <Flag /> Report
          </Button>
          {isAdmin ? (
            <fieldset className="ms-auto flex flex-wrap gap-2">
              <legend className="sr-only">Moderation</legend>
              <Button
                variant="navy"
                size="sm"
                onClick={() =>
                  moderate.mutate(
                    { threadId, action: t.pinned ? 'unpin' : 'pin' },
                    { onSuccess: () => toast.success(t.pinned ? 'Unpinned' : 'Pinned') },
                  )
                }
              >
                <Pin /> {t.pinned ? 'Unpin' : 'Pin'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  moderate.mutate(
                    { threadId, action: t.status === 'hidden' ? 'restore' : 'hide' },
                    {
                      onSuccess: () =>
                        toast.success(t.status === 'hidden' ? 'Post restored' : 'Post hidden'),
                    },
                  )
                }
              >
                <EyeOff /> {t.status === 'hidden' ? 'Restore' : 'Hide'}
              </Button>
            </fieldset>
          ) : null}
        </div>
      </article>
      <section aria-label="Replies" className="grid gap-3">
        <h2 className="font-heading font-semibold text-lg text-navy">
          {t.replies.length} {t.replies.length === 1 ? 'reply' : 'replies'}
        </h2>
        {t.replies.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground text-sm">
            No replies yet. Be the first to help.
          </p>
        ) : (
          <ul className="grid gap-3">
            {t.replies.map((r) => (
              <ReplyItem
                key={r.id}
                reply={r}
                threadId={threadId}
                isAdmin={isAdmin}
                author={replyAuthors[r.authorId] ?? { name: 'Member', company: '', isAi: false }}
              />
            ))}
          </ul>
        )}
      </section>
      <form
        className="grid gap-2 rounded-2xl border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (draft.trim()) send()
        }}
      >
        <Label htmlFor="reply">Add a reply</Label>
        <Textarea
          id="reply"
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Share your experience. Avoid confidential company data."
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-xs">{AUDIENCE[t.space]}</span>
          <Button type="submit" disabled={!draft.trim() || reply.isPending}>
            {reply.isPending ? (
              <>
                <Loader2 className="animate-spin" /> Posting…
              </>
            ) : (
              'Post reply'
            )}
          </Button>
        </div>
      </form>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Report this post?"
        description="A UN Women moderator will review it. It stays visible until they decide."
        confirmLabel="Report post"
        pending={report.isPending}
        onConfirm={() =>
          report.mutate(
            { threadId },
            {
              onSuccess: () => {
                setConfirm(false)
                toast.success('Reported to moderators')
              },
            },
          )
        }
      />
    </div>
  )
}
