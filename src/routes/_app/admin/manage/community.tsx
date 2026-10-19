import { createFileRoute } from '@tanstack/react-router'
import { ManageCommunityPage } from '@/features/admin-manage/pages/ManageCommunityPage'

export const Route = createFileRoute('/_app/admin/manage/community')({
  staticData: { title: 'Community and Marketplace', capability: 'admin.manage' },
  component: ManageCommunityPage,
})
