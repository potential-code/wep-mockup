import { createFileRoute } from '@tanstack/react-router'
import { SignatoryCirclePage } from '@/features/community/pages/SignatoryCirclePage'

export const Route = createFileRoute('/_app/portal/community/circle')({
  staticData: { title: 'Signatory Circle', capability: 'community.discussions' },
  component: SignatoryCirclePage,
})
