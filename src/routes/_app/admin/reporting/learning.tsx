import { createFileRoute } from '@tanstack/react-router'
import { LearningReportPage } from '@/features/admin-reporting/pages/LearningReportPage'

export const Route = createFileRoute('/_app/admin/reporting/learning')({
  staticData: { title: 'Learning and Clinics', capability: 'admin.reporting' },
  component: LearningReportPage,
})
