import { createFileRoute } from '@tanstack/react-router'
import { InvitationPage } from '@/features/public-site/pages/InvitationPage'

export const Route = createFileRoute('/_auth/invite/$token')({
  staticData: { title: 'Accept invitation' },
  component: InvitationPage,
})
