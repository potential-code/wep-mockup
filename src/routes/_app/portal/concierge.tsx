import { createFileRoute } from '@tanstack/react-router'
import { ConciergePage } from '@/features/concierge/pages/ConciergePage'

export const Route = createFileRoute('/_app/portal/concierge')({
  staticData: { title: 'AI Concierge', capability: 'concierge.use' },
  component: ConciergePage,
})
