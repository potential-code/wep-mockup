import { createFileRoute } from '@tanstack/react-router'
import { ExpertSessionPage } from '@/features/expert/pages/ExpertSessionPage'

export const Route = createFileRoute('/_app/expert/sessions/$sessionId')({
  staticData: { title: 'Session', capability: 'expert.workspace' },
  component: ExpertSessionPage,
})
