import { createFileRoute } from '@tanstack/react-router'
import { ListingDetailPage } from '@/features/marketplace/pages/ListingDetailPage'

export const Route = createFileRoute('/_app/portal/community/marketplace/$listingId')({
  staticData: { title: 'Listing', capability: 'marketplace.browse' },
  component: ListingDetailPage,
})
