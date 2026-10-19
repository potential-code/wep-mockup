import { createFileRoute } from '@tanstack/react-router'
import { ManageAssessmentsPage } from '@/features/admin-manage/pages/ManageAssessmentsPage'

export const Route = createFileRoute('/_app/admin/manage/assessments')({
  staticData: { title: 'Assessments and Action Plans', capability: 'admin.manage' },
  component: ManageAssessmentsPage,
})
