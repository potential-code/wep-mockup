import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ApplicationStatusPage } from '@/features/join/pages/ApplicationStatusPage'

export const Route = createFileRoute('/_public/application-status')({
  staticData: { title: 'Application status' },
  validateSearch: z.object({ ref: z.string().optional() }),
  component: ApplicationStatusPage,
})
