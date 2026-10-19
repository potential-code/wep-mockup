import { createFileRoute } from '@tanstack/react-router'
import { ReportBuilderPage } from '@/features/admin-reporting/pages/ReportBuilderPage'

export const Route = createFileRoute('/_app/admin/reporting/report-builder')({
  staticData: { title: 'Report Builder', capability: 'admin.reporting' },
  component: ReportBuilderPage,
})
