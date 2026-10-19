import { createFileRoute } from '@tanstack/react-router'
import { GamificationPage } from '@/features/admin-manage/pages/GamificationPage'

export const Route = createFileRoute('/_app/admin/manage/gamification')({
  staticData: { title: 'Gamification', capability: 'admin.manage' },
  component: GamificationPage,
})
