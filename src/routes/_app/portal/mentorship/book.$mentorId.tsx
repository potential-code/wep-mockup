import { createFileRoute } from '@tanstack/react-router'
import { BookSessionPage } from '@/features/mentorship/pages/BookSessionPage'

export const Route = createFileRoute('/_app/portal/mentorship/book/$mentorId')({
  staticData: { title: 'Book a session', capability: 'mentorship.book' },
  component: BookSessionPage,
})
