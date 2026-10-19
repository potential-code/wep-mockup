import { createFileRoute } from '@tanstack/react-router'
import { ReportReviewPage } from '@/features/admin-reporting/pages/ReportReviewPage'

export const Route = createFileRoute('/_app/admin/reporting/annual-reports/$reportId')({
  staticData: { title: 'Report review', capability: 'admin.reporting' },
  component: ReportReviewPage,
})
