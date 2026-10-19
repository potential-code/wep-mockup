import { createFileRoute } from '@tanstack/react-router'
import { AiSettingsPage } from '@/features/admin-manage/pages/AiSettingsPage'

export const Route = createFileRoute('/_app/admin/manage/ai')({
  staticData: { title: 'AI Knowledge and Settings', capability: 'admin.manage' },
  component: AiSettingsPage,
})
