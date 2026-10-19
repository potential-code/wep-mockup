import { createFileRoute } from '@tanstack/react-router'
import { AssessmentsReportPage } from '@/features/admin-reporting/pages/AssessmentsReportPage'

export const Route = createFileRoute('/_app/admin/reporting/assessments')({
  staticData: { title: 'Assessments and Actions', capability: 'admin.reporting' },
  component: AssessmentsReportPage,
})
