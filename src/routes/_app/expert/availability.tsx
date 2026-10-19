import { createFileRoute } from '@tanstack/react-router'
import { AvailabilityPage } from '@/features/expert/pages/AvailabilityPage'

export const Route = createFileRoute('/_app/expert/availability')({
  staticData: { title: 'Availability', capability: 'expert.workspace' },
  component: AvailabilityPage,
})
