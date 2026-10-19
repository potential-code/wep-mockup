import { createFileRoute } from '@tanstack/react-router'
import { MarketplacePage } from '@/features/marketplace/pages/MarketplacePage'

export const Route = createFileRoute('/_app/portal/community/marketplace/')({
  staticData: { title: 'Products and Services', capability: 'marketplace.browse' },
  component: MarketplacePage,
})
