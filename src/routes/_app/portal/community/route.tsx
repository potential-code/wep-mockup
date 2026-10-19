import { createFileRoute } from '@tanstack/react-router'
import { CommunityLayout } from '@/features/community/pages/CommunityLayout'

export const Route = createFileRoute('/_app/portal/community')({
  staticData: { title: 'Community', capability: 'community.discussions' },
  component: CommunityLayout,
})
