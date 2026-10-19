import { createFileRoute } from '@tanstack/react-router'
import { ManageMentorshipPage } from '@/features/admin-manage/pages/ManageMentorshipPage'

export const Route = createFileRoute('/_app/admin/manage/mentorship')({
  staticData: { title: 'Mentorship', capability: 'admin.manage' },
  component: ManageMentorshipPage,
})
