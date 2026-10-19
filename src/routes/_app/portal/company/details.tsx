import { createFileRoute } from '@tanstack/react-router'
import { CompanyDetailsPage } from '@/features/company/pages/CompanyDetailsPage'

export const Route = createFileRoute('/_app/portal/company/details')({
  staticData: { title: 'Company details', capability: 'company.view_profile' },
  component: CompanyDetailsPage,
})
