import { createFileRoute } from '@tanstack/react-router'
import { ManageCertificationsPage } from '@/features/admin-manage/pages/ManageCertificationsPage'

export const Route = createFileRoute('/_app/admin/manage/certifications/')({
  staticData: { title: 'Certifications and Payments', capability: 'admin.manage' },
  component: ManageCertificationsPage,
})
