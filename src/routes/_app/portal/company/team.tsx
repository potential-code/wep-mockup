import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TeamPage } from '@/features/company/pages/TeamPage'

export const Route = createFileRoute('/_app/portal/company/team')({
  validateSearch: z.object({
    department: z.string().optional(),
    status: z.string().optional(),
    user: z.string().optional(),
  }),
  staticData: { title: 'Team', capability: 'company.manage_team' },
  component: TeamPage,
})
