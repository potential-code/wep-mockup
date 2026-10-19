import type { CommunitySpace } from '@shared/types'
import { Link } from '@tanstack/react-router'
import {
  Bookmark,
  CalendarDays,
  Heart,
  MessageSquarePlus,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { useMemo, useState } from 'react'
import { SectionCard } from '@/components/shared/Cards'
import { AccessNotice, CardGridSkeleton, EmptyState, ErrorState } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import { useCurrentUser } from '@/hooks/use-session'
import { cn } from '@/lib/utils'
import { CHANNELS, useThreads } from '@/queries/community.queries'
import { AiReplyPreview } from './AiReplyPreview'
import { ComposerDialog } from './ComposerDialog'
import { AUDIENCE } from './community-shared'
import { ThreadCard } from './ThreadCard'

export function SpaceFeed({
  space,
  title,
  description,
}: {
  space: CommunitySpace
  title: string
  description: string
}) {
  const { user } = useCurrentUser()
  const { data, isLoading, error, refetch } = useThreads(space)
  const [channel, setChannel] = useState<string>('all')
  const [q, setQ] = useState('')
  const [unanswered, setUnanswered] = useState(false)
  const [following, setFollowing] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [composing, setComposing] = useState(false)
  const [visible, setVisible] = useState(5)
  const [posted, setPosted] = useState<{ id: string; title: string } | null>(null)

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (data ?? []).filter((v) => {
      const t = v.thread
      return (
        (channel === 'all' || t.channel === channel) &&
        (!term || `${t.title} ${t.body} ${t.tags.join(' ')}`.toLowerCase().includes(term)) &&
        (!unanswered || t.replies.filter((r) => r.status !== 'hidden').length === 0) &&
        (!following || v.following) &&
        (!bookmarked || v.bookmarked)
      )
    })
  }, [data, channel, q, unanswered, following, bookmarked])
  const trending = useMemo(() => {
    const counts = new Map<string, number>()
    for (const v of data ?? [])
      for (const tag of v.thread.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
  }, [data])

  if (error) {
    return (error as { code?: string }).code === 'forbidden' ? (
      <AccessNotice
        title={`${title} is restricted`}
        message={error.message}
        action={
          <Button asChild variant="outline">
            <Link to="/portal/community">Go to Discussions</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState message={error.message} onRetry={() => refetch()} />
    )
  }
  const channelList = ['all', ...CHANNELS]
  const countFor = (c: string) =>
    (data ?? []).filter((v) => c === 'all' || v.thread.channel === c).length
  const chip = (c: string) => (
    <button
      key={c}
      type="button"
      onClick={() => setChannel(c)}
      aria-pressed={channel === c}
      className={cn(
        'flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors max-lg:rounded-full max-lg:border',
        channel === c ? 'bg-blue text-white' : 'hover:bg-secondary',
      )}
    >
      <span>{c === 'all' ? 'All channels' : c}</span>
      <span className={cn('text-xs', channel === c ? 'text-white/80' : 'text-muted-foreground')}>
        {countFor(c)}
      </span>
    </button>
  )

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h2 className="text-section text-navy">{title}</h2>
          <p className="max-w-2xl text-muted-foreground text-sm">
            {description} {AUDIENCE[space]}.
          </p>
        </div>
        <Button onClick={() => setComposing(true)}>
          <MessageSquarePlus /> Create post
        </Button>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[13rem_minmax(0,1fr)_17rem]">
        <nav
          aria-label="Channels"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:sticky lg:top-4 lg:mx-0 lg:grid lg:gap-1 lg:overflow-visible lg:px-0"
        >
          {channelList.map(chip)}
        </nav>
        <div className="grid min-w-0 gap-4">
          <div className="grid gap-3">
            <div className="relative">
              <Search
                className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                aria-label="Search threads"
                className="ps-9"
                placeholder="Search threads"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Toggle
                variant="outline"
                size="sm"
                pressed={unanswered}
                onPressedChange={setUnanswered}
              >
                Unanswered
              </Toggle>
              <Toggle
                variant="outline"
                size="sm"
                pressed={following}
                onPressedChange={setFollowing}
              >
                <Users /> Following
              </Toggle>
              <Toggle
                variant="outline"
                size="sm"
                pressed={bookmarked}
                onPressedChange={setBookmarked}
              >
                <Bookmark /> Bookmarked
              </Toggle>
              <span
                className="ms-auto self-center text-muted-foreground text-sm"
                aria-live="polite"
              >
                {filtered.length} threads
              </span>
            </div>
          </div>
          {posted ? (
            <AiReplyPreview key={posted.id} threadId={posted.id} title={posted.title} />
          ) : null}
          {isLoading ? (
            <CardGridSkeleton count={3} className="sm:grid-cols-1 lg:grid-cols-1" />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No threads match"
              description="Try another channel or clear the filters, or start the conversation yourself."
              action={<Button onClick={() => setComposing(true)}>Create post</Button>}
            />
          ) : (
            <ul className="grid gap-3">
              <AnimatePresence initial={false}>
                {filtered.slice(0, visible).map((v) => (
                  <ThreadCard key={v.thread.id} view={v} isAdmin={user?.role === 'global_admin'} />
                ))}
              </AnimatePresence>
            </ul>
          )}
          {filtered.length > visible ? (
            <Button variant="outline" className="w-fit" onClick={() => setVisible((n) => n + 5)}>
              Load more
            </Button>
          ) : null}
        </div>
        <aside className="grid gap-4" aria-label="Community information">
          <SectionCard title="Community guidance">
            <ul className="grid gap-2 text-muted-foreground text-sm">
              <li>Be respectful and constructive.</li>
              <li>Don’t share confidential company data.</li>
              <li>Group threads only; no direct messages.</li>
            </ul>
          </SectionCard>
          <SectionCard title="Trending topics">
            <div className="flex flex-wrap gap-2">
              {trending.map(([tag, n]) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQ(tag)}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-navy text-xs hover:bg-blue-50"
                >
                  <TrendingUp className="size-3" aria-hidden />
                  {tag} <span className="text-muted-foreground">{n}</span>
                </button>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Upcoming activities">
            <ul className="grid gap-2 text-sm">
              <li className="flex gap-2">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
                Reporting Clinic, November
              </li>
              <li className="flex gap-2">
                <Heart className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
                Procurement office hours
              </li>
            </ul>
            <Button asChild variant="link" className="mt-1 h-auto p-0">
              <Link to="/portal/clinics">See clinics</Link>
            </Button>
          </SectionCard>
        </aside>
      </div>
      <ComposerDialog
        open={composing}
        onOpenChange={setComposing}
        space={space}
        defaultChannel={channel === 'all' ? undefined : channel}
        onPosted={setPosted}
      />
    </div>
  )
}
