import { createFileRoute } from '@tanstack/react-router'
import { MentorProfilePage } from '@/features/mentorship/pages/MentorProfilePage'

export const Route = createFileRoute('/_app/portal/mentorship/$mentorId')({
  staticData: { title: 'Expert profile', capability: 'mentorship.book' },
  component: MentorProfilePage,
})
