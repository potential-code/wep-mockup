import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@/features/public-site/pages/HomePage'

export const Route = createFileRoute('/_public/')({
  staticData: { title: 'Home' },
  component: HomePage,
})
