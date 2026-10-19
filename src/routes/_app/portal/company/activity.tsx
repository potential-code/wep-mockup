import { createFileRoute } from '@tanstack/react-router'
import { CompanyActivityPage } from '@/features/company/pages/CompanyActivityPage'

export const Route = createFileRoute('/_app/portal/company/activity')({
  staticData: { title: 'Activity', capability: 'company.manage_team' },
  component: CompanyActivityPage,
})
