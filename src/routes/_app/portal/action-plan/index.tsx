import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ActionPlanPage } from '@/features/action-plan/pages/ActionPlanPage'

export const Route = createFileRoute('/_app/portal/action-plan/')({
  validateSearch: z.object({ principle: z.string().optional() }),
  staticData: { title: 'Action Plan', capability: 'actions.view_assigned' },
  component: ActionPlanPage,
})
