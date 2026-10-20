import { Link } from '@tanstack/react-router'
import { CalendarArrowDown, CalendarCheck, Coins, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { celebrate } from '@/components/motion/Celebrate'
import { Button } from '@/components/ui/button'
import { downloadText, formatNumber } from '@/lib/format'
import { buildIcs, dayLong, timeIn, tzAbbrev, tzName } from '../lib/time'

export interface ConfirmedBooking {
  id: string
  mentorName: string
  startsAt: string
  durationMin: number
  timeZone: string
  cost: number
  balanceBefore: number
  purpose: string
}

export function BookingConfirmation({ booking }: { booking: ConfirmedBooking }) {
  useEffect(() => {
    celebrate()
  }, [])
  const after = booking.balanceBefore - booking.cost
  const addToCalendar = () =>
    downloadText(
      'mentoring-session.ics',
      buildIcs({
        uid: booking.id,
        title: `WEPs mentoring session with ${booking.mentorName}`,
        description: `Purpose: ${booking.purpose}. Demo session, no real video link.`,
        startsAt: booking.startsAt,
        durationMin: booking.durationMin,
      }),
      'text/calendar',
    )
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto grid max-w-2xl gap-6 rounded-2xl border bg-card p-6 shadow-card sm:p-8"
      aria-labelledby="confirmed-h"
    >
      <div className="grid justify-items-center gap-3 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-success-soft text-success">
          <CalendarCheck className="size-7" aria-hidden />
        </span>
        <h2 id="confirmed-h" className="font-heading font-medium text-navy text-section">
          Your session is booked
        </h2>
        <p className="text-muted-foreground">
          A confirmation has been added to your notifications and {booking.mentorName}’s calendar.
        </p>
      </div>

      <dl className="grid gap-4 rounded-xl bg-surface p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Expert</dt>
          <dd className="font-semibold text-navy">{booking.mentorName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">When ({tzName(booking.timeZone)})</dt>
          <dd className="font-semibold text-navy">
            {dayLong(booking.startsAt, booking.timeZone)}
            <br />
            {timeIn(booking.startsAt, booking.timeZone)}{' '}
            {tzAbbrev(booking.timeZone, booking.startsAt)} · {booking.durationMin} minutes
          </dd>
        </div>
        <div className="flex items-start gap-2 sm:col-span-2">
          <Coins className="mt-0.5 size-4 text-coral-700" aria-hidden />
          <div>
            <dt className="sr-only">Points</dt>
            <dd>
              <strong className="text-navy">{formatNumber(booking.cost)} points deducted.</strong>{' '}
              <span className="text-muted-foreground">
                Redeemable balance {formatNumber(booking.balanceBefore)} → {formatNumber(after)}.
                Lifetime points are unchanged.
              </span>
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2 sm:col-span-2">
          <ShieldCheck className="mt-0.5 size-4 text-blue" aria-hidden />
          <p className="text-muted-foreground">
            <strong className="text-navy">Cancellation terms (demo rule):</strong> cancel 24 hours
            or more before the start and your points are restored. Later cancellations go to an
            administrator for review.
          </p>
        </div>
      </dl>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={addToCalendar}>
          <CalendarArrowDown aria-hidden /> Add to calendar (.ics)
        </Button>
        <Button asChild>
          <Link to="/portal/mentorship/bookings">Go to my bookings</Link>
        </Button>
      </div>
    </motion.section>
  )
}
