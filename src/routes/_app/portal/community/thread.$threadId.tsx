import { createFileRoute } from '@tanstack/react-router'
import { ThreadPage } from '@/features/community/pages/ThreadPage'

export const Route = createFileRoute('/_app/portal/community/thread/$threadId')({
  staticData: { title: 'Discussion', capability: 'community.discussions' },
  component: ThreadPage,
})
