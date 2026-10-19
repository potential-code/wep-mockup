import { createFileRoute } from '@tanstack/react-router'
import { ResourcesPage } from '@/features/resources/pages/ResourcesPage'

export const Route = createFileRoute('/_app/portal/resources/')({
  staticData: { title: 'Resources', capability: 'resources.use' },
  component: ResourcesPage,
})
