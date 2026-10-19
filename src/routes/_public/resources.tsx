import { createFileRoute } from '@tanstack/react-router'
import { PublicResourcesPage } from '@/features/public-site/pages/PublicResourcesPage'

export const Route = createFileRoute('/_public/resources')({
  staticData: { title: 'Explore Resources' },
  component: PublicResourcesPage,
})
