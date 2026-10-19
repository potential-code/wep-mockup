import { createFileRoute } from '@tanstack/react-router'
import { MyBookingsPage } from '@/features/mentorship/pages/MyBookingsPage'

export const Route = createFileRoute('/_app/portal/mentorship/bookings')({
  staticData: { title: 'My bookings', capability: 'mentorship.book' },
  component: MyBookingsPage,
})
