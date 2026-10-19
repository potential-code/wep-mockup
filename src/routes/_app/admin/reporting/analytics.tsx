import { createFileRoute } from '@tanstack/react-router'
import { AnalyticsPage } from '@/features/admin-reporting/pages/AnalyticsPage'

export const Route = createFileRoute('/_app/admin/reporting/analytics')({
  staticData: { title: 'Analytics', capability: 'admin.reporting' },
  component: AnalyticsPage,
})
