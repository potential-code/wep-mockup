import { createFileRoute } from '@tanstack/react-router'
import { MentorshipPage } from '@/features/mentorship/pages/MentorshipPage'

export const Route = createFileRoute('/_app/portal/mentorship/')({
  staticData: { title: 'Mentorship', capability: 'mentorship.book' },
  component: MentorshipPage,
})
