import { createFileRoute } from '@tanstack/react-router'
import { CommunicationsPage } from '@/features/admin-manage/pages/CommunicationsPage'

export const Route = createFileRoute('/_app/admin/manage/communications')({
  staticData: { title: 'Communications', capability: 'admin.manage' },
  component: CommunicationsPage,
})
