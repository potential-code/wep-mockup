import { createFileRoute } from '@tanstack/react-router'
import { TeamPage } from '@/features/company/pages/TeamPage'

export const Route = createFileRoute('/_app/portal/company/team')({
  staticData: { title: 'Team', capability: 'company.manage_team' },
  component: TeamPage,
})
