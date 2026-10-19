import { createFileRoute } from '@tanstack/react-router'
import { ManageUsersPage } from '@/features/admin-manage/pages/ManageUsersPage'

export const Route = createFileRoute('/_app/admin/manage/users')({
  staticData: { title: 'Users and Invitations', capability: 'admin.manage' },
  component: ManageUsersPage,
})
