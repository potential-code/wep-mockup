import { DEMO_NOW, DEMO_RULES } from '@shared/rules'
import { Link } from '@tanstack/react-router'
import { CalendarPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState, ErrorState } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatNumber } from '@/lib/format'
import { useCancelBooking, useMyBookings } from '@/queries/mentorship.queries'
import { useResources } from '@/queries/resources.queries'
import { BookingCard, type BookingRow } from '../components/BookingCard'

export function MyBookingsPage() {
  const bookings = useMyBookings()
  const resources = useResources()
  const cancel = useCancelBooking()
  const [target, setTarget] = useState<BookingRow>()

  const rows = (bookings.data ?? []) as BookingRow[]
  const upcoming = rows
    .filter((r) => r.booking.status === 'booked')
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  const past = rows.filter((r) => r.booking.status !== 'booked')
  const titles = useMemo(
    () =>
      Object.fromEntries((resources.data?.resources ?? []).map((r) => [r.id, r.title])) as Record<
        string,
        string
      >,
    [resources.data],
  )

  const hoursAway = target
    ? (new Date(target.startsAt).getTime() - new Date(DEMO_NOW).getTime()) / 36e5
    : 0
  const restores = hoursAway >= DEMO_RULES.cancellationWindowHours
  const cost = target?.booking.pointsCost ?? 0

  const confirmCancel = async () => {
    if (!target) return
    const res = await cancel.mutateAsync(target.booking.id)
    toast.success(
      res.pointsRestored > 0
        ? `Booking cancelled. ${formatNumber(res.pointsRestored)} points restored.`
        : 'Booking cancelled. Your request has gone to an administrator for review.',
    )
    setTarget(undefined)
  }

  const list = (items: BookingRow[], empty: React.ReactNode) =>
    items.length === 0 ? (
      empty
    ) : (
      <ul className="grid gap-4">
        {items.map((r) => (
          <li key={r.booking.id}>
            <BookingCard row={r} resourceTitles={titles} onCancel={setTarget} />
          </li>
        ))}
      </ul>
    )

  return (
    <div>
      <PageHeader
        title="My bookings"
        breadcrumbs={[{ label: 'Mentorship', to: '/portal/mentorship' }, { label: 'My bookings' }]}
        actions={
          <Button asChild>
            <Link to="/portal/mentorship">
              <CalendarPlus aria-hidden /> Book a session
            </Link>
          </Button>
        }
      />
      {bookings.isLoading ? (
        <div className="grid gap-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      ) : bookings.isError ? (
        <ErrorState message={bookings.error.message} onRetry={() => bookings.refetch()} />
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-5">
            {list(
              upcoming,
              <EmptyState
                title="No upcoming sessions"
                description="Browse the expert directory and use your points for a 30-minute session."
                action={
                  <Button asChild>
                    <Link to="/portal/mentorship">Find an expert</Link>
                  </Button>
                }
              />,
            )}
          </TabsContent>
          <TabsContent value="past" className="mt-5">
            {list(
              past,
              <EmptyState
                title="No past sessions yet"
                description="Completed, cancelled and missed sessions appear here."
              />,
            )}
          </TabsContent>
        </Tabs>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(o) => !o && setTarget(undefined)}
        title="Cancel this booking?"
        destructive
        confirmLabel="Cancel booking"
        pending={cancel.isPending}
        onConfirm={confirmCancel}
        description={
          cost === 0 ? (
            <p>This programme session did not use points. The slot will be released.</p>
          ) : restores ? (
            <p>
              The session is more than {DEMO_RULES.cancellationWindowHours} hours away, so your{' '}
              <strong>{formatNumber(cost)} points will be restored</strong> straight away.
            </p>
          ) : (
            <p>
              The session starts in less than {DEMO_RULES.cancellationWindowHours} hours, so your{' '}
              <strong>{formatNumber(cost)} points will not be restored automatically</strong>. An
              administrator will review the cancellation.
            </p>
          )
        }
      />
    </div>
  )
}
