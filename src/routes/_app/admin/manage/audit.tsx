import { createFileRoute } from '@tanstack/react-router'
import { AuditPage } from '@/features/admin-manage/pages/AuditPage'

export const Route = createFileRoute('/_app/admin/manage/audit')({
  staticData: { title: 'Activity and Audit', capability: 'admin.manage' },
  component: AuditPage,
})
