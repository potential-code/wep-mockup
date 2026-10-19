import { createFileRoute } from '@tanstack/react-router'
import { ExpertCalendarPage } from '@/features/expert/pages/ExpertCalendarPage'

export const Route = createFileRoute('/_app/expert/calendar')({
  staticData: { title: 'Calendar', capability: 'expert.workspace' },
  component: ExpertCalendarPage,
})
