import { createFileRoute } from '@tanstack/react-router'
import { BrandSettingsPage } from '@/features/admin-manage/pages/BrandSettingsPage'

export const Route = createFileRoute('/_app/admin/manage/settings')({
  staticData: { title: 'Brand and General Settings', capability: 'admin.manage' },
  component: BrandSettingsPage,
})
