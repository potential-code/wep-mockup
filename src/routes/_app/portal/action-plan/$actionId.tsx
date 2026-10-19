import { createFileRoute } from '@tanstack/react-router'
import { ActionDetailPage } from '@/features/action-plan/pages/ActionDetailPage'

export const Route = createFileRoute('/_app/portal/action-plan/$actionId')({
  staticData: { title: 'Action', capability: 'actions.view_assigned' },
  component: ActionDetailPage,
})
