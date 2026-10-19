import { createFileRoute } from '@tanstack/react-router'
import { ActionPlanPage } from '@/features/action-plan/pages/ActionPlanPage'

export const Route = createFileRoute('/_app/portal/action-plan/')({
  staticData: { title: 'Action Plan', capability: 'actions.view_assigned' },
  component: ActionPlanPage,
})
