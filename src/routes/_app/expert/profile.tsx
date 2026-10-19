import { createFileRoute } from '@tanstack/react-router'
import { ExpertProfilePage } from '@/features/expert/pages/ExpertProfilePage'

export const Route = createFileRoute('/_app/expert/profile')({
  staticData: { title: 'Expert profile', capability: 'expert.workspace' },
  component: ExpertProfilePage,
})
