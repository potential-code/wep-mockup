import { createFileRoute } from '@tanstack/react-router'
import { ManageEventsPage } from '@/features/admin-manage/pages/ManageEventsPage'

export const Route = createFileRoute('/_app/admin/manage/events')({
  staticData: { title: 'Clinics and Events', capability: 'admin.manage' },
  component: ManageEventsPage,
})
