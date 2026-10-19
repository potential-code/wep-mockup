import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { SubmitListingPage } from '@/features/marketplace/pages/SubmitListingPage'

export const Route = createFileRoute('/_app/portal/community/marketplace/submit')({
  validateSearch: z.object({ id: z.string().optional() }),
  staticData: { title: 'Submit a listing', capability: 'marketplace.manage' },
  component: SubmitListingPage,
})
