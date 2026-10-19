import { createFileRoute } from '@tanstack/react-router'
import { CompanyOverviewPage } from '@/features/company/pages/CompanyOverviewPage'

export const Route = createFileRoute('/_app/portal/company/')({
  staticData: { title: 'Overview', capability: 'company.view_profile' },
  component: CompanyOverviewPage,
})
