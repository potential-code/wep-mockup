import type { MentorBooking } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { CalendarClock, Coins, FileText, MessageSquareQuote, Star } from 'lucide-react'
import { useState } from 'react'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { formatNumber, viewerTimeZone } from '@/lib/format'
import { dateTimeIn } from '../lib/time'
import { FeedbackDialog } from './FeedbackDialog'

export interface BookingRow {
  booking: MentorBooking
  startsAt: string
  mentorName: string
  mentorAvatar?: string
}

export function BookingCard({
  row,
  resourceTitles,
  onCancel,
}: {
  row: BookingRow
  resourceTitles: Record<string, string>
  onCancel: (row: BookingRow) => void
}) {
  const b = row.booking
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const tz = viewerTimeZone()
  return (
    <article className="grid gap-4 rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start gap-4">
        <UserAvatar name={row.mentorName} src={row.mentorAvatar} className="size-12 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading font-medium text-navy">{row.mentorName}</h3>
            <WorkflowStatus status={b.status} />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="size-4" aria-hidden /> {dateTimeIn(row.startsAt, tz)}
            </span>
            <span className="flex items-center gap-1.5">
              <Coins className="size-4" aria-hidden />
              {b.pointsCost > 0 ? `${formatNumber(b.pointsCost)} points` : 'Programme session'}
            </span>
          </p>
          <p className="mt-2 text-sm">{b.purpose}</p>
        </div>
        {b.status === 'booked' ? (
          <Button variant="outline" size="sm" onClick={() => onCancel(row)}>
            Cancel booking
          </Button>
        ) : null}
      </div>

      {b.status === 'cancellation_review' ? (
        <p className="rounded-lg bg-warning-soft/60 p-3 text-sm">
          This was cancelled less than 24 hours before the start, so an administrator will review
          whether your {formatNumber(b.pointsCost)} points are restored.
        </p>
      ) : null}
      {b.status === 'cancelled' && b.pointsCost > 0 ? (
        <p className="rounded-lg bg-muted p-3 text-sm">
          Cancelled in time: {formatNumber(b.pointsCost)} points were restored to your balance.
        </p>
      ) : null}
      {b.status === 'no_show' ? (
        <p className="rounded-lg bg-muted p-3 text-sm">
          The expert recorded that this session did not take place. Points are not restored for
          missed sessions.
        </p>
      ) : null}

      {b.status === 'completed' && b.followUp ? (
        <div className="grid gap-4 rounded-xl bg-surface p-4 md:grid-cols-2">
          <div className="grid content-start gap-2">
            <h4 className="flex items-center gap-2 font-medium text-navy text-sm">
              <MessageSquareQuote className="size-4 text-blue" aria-hidden /> Note from{' '}
              {row.mentorName}
            </h4>
            <p className="text-sm">{b.followUp.sharedNote}</p>
          </div>
          <div className="grid content-start gap-3">
            <div>
              <h4 className="mb-1 font-medium text-navy text-sm">Agreed next actions</h4>
              <ul className="grid list-disc gap-1 ps-5 text-sm">
                {b.followUp.nextActions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
            {b.followUp.resourceIds.length > 0 ? (
              <div>
                <h4 className="mb-1 font-medium text-navy text-sm">Shared resources</h4>
                <ul className="grid gap-1 text-sm">
                  {b.followUp.resourceIds.map((id) => (
                    <li key={id}>
                      <Link
                        to="/portal/resources/$resourceId"
                        params={{ resourceId: id }}
                        className="inline-flex items-center gap-1.5 text-blue hover:underline"
                      >
                        <FileText className="size-4" aria-hidden />
                        {resourceTitles[id] ?? 'Open resource'}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {b.status === 'completed' ? (
        b.feedback ? (
          <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Star className="size-4 fill-coral text-coral" aria-hidden /> You rated this session{' '}
            {b.feedback.rating}/5{b.feedback.comment ? `: “${b.feedback.comment}”` : ''}
          </p>
        ) : (
          <div>
            <Button variant="secondary" size="sm" onClick={() => setFeedbackOpen(true)}>
              <Star aria-hidden /> Leave feedback
            </Button>
            <FeedbackDialog
              bookingId={b.id}
              mentorName={row.mentorName}
              open={feedbackOpen}
              onOpenChange={setFeedbackOpen}
            />
          </div>
        )
      ) : null}
    </article>
  )
}
