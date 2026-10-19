import { Link } from '@tanstack/react-router'
import { CalendarClock, ClipboardList, UsersRound, Video } from 'lucide-react'
import { useState } from 'react'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { dateTimeIn } from '@/features/mentorship/lib/time'
import { cn } from '@/lib/utils'
import type { ExpertScheduleItem } from '@/queries/mentorship.queries'
import { JoinSessionDialog } from './JoinSessionDialog'

/** One session (booking or clinic) with the actions an expert needs. */
export function ScheduleItemCard({
  item,
  compact = false,
}: {
  item: ExpertScheduleItem
  compact?: boolean
}) {
  const [joinOpen, setJoinOpen] = useState(false)
  const upcoming = item.status === 'booked' || item.status === 'scheduled'
  return (
    <article className="grid gap-3 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-muted-foreground text-xs">
            {item.kind === 'clinic' ? (
              <UsersRound className="size-3.5" aria-hidden />
            ) : (
              <CalendarClock className="size-3.5" aria-hidden />
            )}
            {item.format}
          </p>
          <h3 className="line-clamp-2 font-semibold text-navy">{item.title}</h3>
          <p className="text-muted-foreground text-sm">{item.who}</p>
        </div>
        <WorkflowStatus status={item.status} />
      </div>
      <p className="text-sm">
        <span className="font-medium text-navy">{dateTimeIn(item.startsAt, item.timezone)}</span>{' '}
        <span className="text-muted-foreground">· {item.durationMin} min</span>
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusBadge tone={item.preparationOk ? 'success' : 'warning'}>
          {item.preparation}
        </StatusBadge>
        <div className={cn('flex flex-wrap gap-2', compact && 'w-full')}>
          <Button asChild variant="outline" size="sm">
            <Link to="/expert/sessions/$sessionId" params={{ sessionId: item.id }}>
              <ClipboardList aria-hidden />{' '}
              {item.kind === 'booking' ? 'View booking' : 'Open roster'}
            </Link>
          </Button>
          {upcoming ? (
            <Button size="sm" onClick={() => setJoinOpen(true)}>
              <Video aria-hidden /> Join session
            </Button>
          ) : null}
        </div>
      </div>
      <JoinSessionDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        title={item.title}
        who={item.who}
        sessionId={item.id}
      />
    </article>
  )
}
