import { createFileRoute } from '@tanstack/react-router'
import { ReportsPage } from '@/features/reports/pages/ReportsPage'

export const Route = createFileRoute('/_app/portal/reports/')({
  staticData: { title: 'Annual Reports', capability: 'reports.view' },
  component: ReportsPage,
})
