import { createFileRoute } from '@tanstack/react-router'
import { SubmitListingPage } from '@/features/marketplace/pages/SubmitListingPage'

export const Route = createFileRoute('/_app/portal/community/marketplace/submit')({
  staticData: { title: 'Submit a listing', capability: 'marketplace.manage' },
  component: SubmitListingPage,
})
