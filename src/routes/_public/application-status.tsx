import { createFileRoute } from '@tanstack/react-router'
import { ApplicationStatusPage } from '@/features/join/pages/ApplicationStatusPage'

export const Route = createFileRoute('/_public/application-status')({
  staticData: { title: 'Application status' },
  component: ApplicationStatusPage,
})
