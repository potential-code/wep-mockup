import { createFileRoute } from '@tanstack/react-router'
import { MyListingsPage } from '@/features/marketplace/pages/MyListingsPage'

export const Route = createFileRoute('/_app/portal/community/marketplace/mine')({
  staticData: { title: 'My listings', capability: 'marketplace.manage' },
  component: MyListingsPage,
})
