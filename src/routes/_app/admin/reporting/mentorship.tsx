import { createFileRoute } from '@tanstack/react-router'
import { MentorshipReportPage } from '@/features/admin-reporting/pages/MentorshipReportPage'

export const Route = createFileRoute('/_app/admin/reporting/mentorship')({
  staticData: { title: 'Mentorship', capability: 'admin.reporting' },
  component: MentorshipReportPage,
})
