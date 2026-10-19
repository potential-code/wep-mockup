import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ConciergePage } from '@/features/concierge/pages/ConciergePage'

export const Route = createFileRoute('/_app/portal/concierge')({
  validateSearch: z.object({ prompt: z.string().optional(), resource: z.string().optional() }),
  staticData: { title: 'AI Concierge', capability: 'concierge.use' },
  component: ConciergePage,
})
