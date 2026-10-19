import { createFileRoute } from '@tanstack/react-router'
import { ResourceDetailPage } from '@/features/resources/pages/ResourceDetailPage'

export const Route = createFileRoute('/_app/portal/resources/$resourceId')({
  staticData: { title: 'Resource', capability: 'resources.use' },
  component: ResourceDetailPage,
})
