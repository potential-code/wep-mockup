import { createFileRoute } from '@tanstack/react-router'
import { CompanyLayout } from '@/features/company/pages/CompanyLayout'

export const Route = createFileRoute('/_app/portal/company')({
  staticData: { title: 'Company Profile and Team', capability: 'company.view_profile' },
  component: CompanyLayout,
})
