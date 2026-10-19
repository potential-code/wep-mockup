import { createFileRoute } from '@tanstack/react-router'
import { ApplicationReviewPage } from '@/features/admin-manage/pages/ApplicationReviewPage'

export const Route = createFileRoute('/_app/admin/manage/applications/$applicationId')({
  staticData: { title: 'Application review', capability: 'admin.manage' },
  component: ApplicationReviewPage,
})
