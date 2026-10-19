import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/features/public-site/pages/AboutPage'

export const Route = createFileRoute('/_public/about')({
  staticData: { title: 'About WEPs and the Principles' },
  component: AboutPage,
})
