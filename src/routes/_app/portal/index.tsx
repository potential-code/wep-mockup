import { createFileRoute } from '@tanstack/react-router'
import { PortalDashboardPage } from '@/features/dashboard/pages/PortalDashboardPage'

export const Route = createFileRoute('/_app/portal/')({
  staticData: { title: 'Dashboard' },
  component: PortalDashboardPage,
})
