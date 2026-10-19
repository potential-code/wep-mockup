import { createFileRoute } from '@tanstack/react-router'
import { ExecutiveDashboardPage } from '@/features/admin-reporting/pages/ExecutiveDashboardPage'

export const Route = createFileRoute('/_app/admin/reporting/')({
  staticData: { title: 'Executive Dashboard', capability: 'admin.reporting' },
  component: ExecutiveDashboardPage,
})
