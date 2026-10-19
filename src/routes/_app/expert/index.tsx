import { createFileRoute } from '@tanstack/react-router'
import { ExpertDashboardPage } from '@/features/expert/pages/ExpertDashboardPage'

export const Route = createFileRoute('/_app/expert/')({
  staticData: { title: 'Expert workspace', capability: 'expert.workspace' },
  component: ExpertDashboardPage,
})
