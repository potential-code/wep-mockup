import { createFileRoute } from '@tanstack/react-router'
import { CataloguePage } from '@/features/learning/pages/CataloguePage'

export const Route = createFileRoute('/_app/portal/learn/catalogue')({
  staticData: { title: 'Browse courses', capability: 'learn.use' },
  component: CataloguePage,
})
