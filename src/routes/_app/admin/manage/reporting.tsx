import { createFileRoute } from '@tanstack/react-router'
import { ManageReportingPage } from '@/features/admin-manage/pages/ManageReportingPage'

export const Route = createFileRoute('/_app/admin/manage/reporting')({
  staticData: { title: 'Annual Reporting', capability: 'admin.manage' },
  component: ManageReportingPage,
})
