import { createFileRoute } from '@tanstack/react-router'
import { ManageResourcesPage } from '@/features/admin-manage/pages/ManageResourcesPage'

export const Route = createFileRoute('/_app/admin/manage/resources')({
  staticData: { title: 'Resources', capability: 'admin.manage' },
  component: ManageResourcesPage,
})
