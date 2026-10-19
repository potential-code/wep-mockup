import { createFileRoute } from '@tanstack/react-router'
import { CommunityReportPage } from '@/features/admin-reporting/pages/CommunityReportPage'

export const Route = createFileRoute('/_app/admin/reporting/community')({
  staticData: { title: 'Community and Marketplace', capability: 'admin.reporting' },
  component: CommunityReportPage,
})
