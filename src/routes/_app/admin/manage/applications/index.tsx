import { createFileRoute } from '@tanstack/react-router'
import { ApplicationsPage } from '@/features/admin-manage/pages/ApplicationsPage'

export const Route = createFileRoute('/_app/admin/manage/applications/')({
  staticData: { title: 'Applications and Approvals', capability: 'admin.manage' },
  component: ApplicationsPage,
})
