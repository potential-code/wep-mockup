import { createFileRoute } from '@tanstack/react-router'
import { DiscussionsPage } from '@/features/community/pages/DiscussionsPage'

export const Route = createFileRoute('/_app/portal/community/')({
  staticData: { title: 'Discussions', capability: 'community.discussions' },
  component: DiscussionsPage,
})
