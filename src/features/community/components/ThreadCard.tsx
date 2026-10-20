import { Link } from '@tanstack/react-router'
import { Bookmark, Bot, Flag, MessageSquare, Pin, ThumbsUp } from 'lucide-react'
import { motion } from 'motion/react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { relativeTime } from '@/lib/format'
import type { ThreadView } from './community-shared'

export function ThreadCard({ view, isAdmin }: { view: ThreadView; isAdmin: boolean }) {
  const { thread: t, author } = view
  const visibleReplies = t.replies.filter((r) => r.status !== 'hidden')
  const hasAi = t.replies.some((r) => r.authorId === 'ai')
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      whileHover={{ y: -2 }}
      className="list-none"
    >
      <Link
        to="/portal/community/thread/$threadId"
        params={{ threadId: t.id }}
        className="block rounded-2xl border bg-card p-4 shadow-card transition-shadow hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
      >
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          {t.isAnnouncement ? (
            <StatusBadge tone="coral" icon={Pin}>
              UN Women announcement
            </StatusBadge>
          ) : t.pinned ? (
            <StatusBadge tone="neutral" icon={Pin}>
              Pinned
            </StatusBadge>
          ) : null}
          <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-navy">
            {t.channel}
          </span>
          {t.status === 'hidden' ? (
            <StatusBadge tone="danger">Hidden (admin view)</StatusBadge>
          ) : null}
        </div>
        <h3 className="font-heading font-medium text-base text-navy leading-snug">{t.title}</h3>
        <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">{t.body}</p>
        {t.status === 'flagged' && isAdmin ? (
          <p className="mt-2 flex items-center gap-1.5 text-warning text-xs">
            <Flag className="size-3.5" aria-hidden /> Reported: awaiting moderator review
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-muted-foreground text-xs">
          <span className="flex items-center gap-2">
            <UserAvatar name={author.name} src={author.avatar} className="size-6" />
            <span className="font-medium text-navy">{author.name}</span>
            {author.company ? <span>· {author.company}</span> : null}
          </span>
          <span>{relativeTime(t.createdAt)}</span>
          <span className="flex items-center gap-1">
            <MessageSquare className="size-3.5" aria-hidden />
            {visibleReplies.length}
            <span className="sr-only"> replies</span>
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="size-3.5" aria-hidden />
            {t.reactions}
            <span className="sr-only"> reactions</span>
          </span>
          {view.bookmarked ? (
            <span className="flex items-center gap-1 text-blue">
              <Bookmark className="size-3.5 fill-current" aria-hidden />
              Saved
            </span>
          ) : null}
          {hasAi ? (
            <span className="flex items-center gap-1 text-blue">
              <Bot className="size-3.5" aria-hidden />
              AI reply
            </span>
          ) : null}
        </div>
      </Link>
    </motion.li>
  )
}
