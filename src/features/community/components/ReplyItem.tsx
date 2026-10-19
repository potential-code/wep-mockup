import type { ThreadReply } from '@shared/types'
import { Flag, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { relativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useModerate, useReact, useReportContent } from '@/queries/community.queries'
import { AiBadge, AiSources } from './community-shared'

interface Author {
  name: string
  avatar?: string
  company: string
  isAi: boolean
}

export function ReplyItem({
  reply,
  author,
  threadId,
  isAdmin,
}: {
  reply: ThreadReply
  author: Author
  threadId: string
  isAdmin: boolean
}) {
  const react = useReact()
  const report = useReportContent()
  const moderate = useModerate()
  const [confirm, setConfirm] = useState(false)
  const ai = reply.authorId === 'ai'
  return (
    <li
      className={cn(
        'grid gap-2 rounded-2xl border p-4',
        ai ? 'border-blue/30 bg-blue-50/60' : 'bg-card',
        reply.status === 'hidden' && 'opacity-60',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {ai ? null : <UserAvatar name={author.name} src={author.avatar} className="size-7" />}
        <span className="font-medium text-navy text-sm">{author.name}</span>
        {ai ? (
          <AiBadge />
        ) : author.company ? (
          <span className="text-muted-foreground text-xs">{author.company}</span>
        ) : null}
        <span className="text-muted-foreground text-xs">{relativeTime(reply.createdAt)}</span>
        {reply.status === 'hidden' ? (
          <StatusBadge tone="danger">Hidden (admin view)</StatusBadge>
        ) : null}
      </div>
      <p className="text-sm">{reply.body}</p>
      {ai ? <AiSources sources={reply.sources ?? []} /> : null}
      {reply.status === 'flagged' && isAdmin ? (
        <p className="flex items-center gap-1.5 text-warning text-xs">
          <Flag className="size-3.5" aria-hidden /> Reported: awaiting moderator review
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => react.mutate({ threadId, replyId: reply.id })}
        >
          <ThumbsUp /> {reply.reactions}
          <span className="sr-only"> helpful</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirm(true)}>
          <Flag /> Report
        </Button>
        {isAdmin ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              moderate.mutate(
                {
                  threadId,
                  replyId: reply.id,
                  action: reply.status === 'hidden' ? 'restore' : 'hide',
                },
                {
                  onSuccess: () =>
                    toast.success(reply.status === 'hidden' ? 'Reply restored' : 'Reply hidden'),
                },
              )
            }
          >
            {reply.status === 'hidden' ? 'Restore' : 'Hide'}
          </Button>
        ) : null}
      </div>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Report this reply?"
        description="A UN Women moderator will review it. It stays visible until they decide."
        confirmLabel="Report reply"
        pending={report.isPending}
        onConfirm={() =>
          report.mutate(
            { threadId, replyId: reply.id },
            {
              onSuccess: () => {
                setConfirm(false)
                toast.success('Reported to moderators')
              },
            },
          )
        }
      />
    </li>
  )
}
