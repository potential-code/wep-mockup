import { createFileRoute } from '@tanstack/react-router'
import { CompaniesReportPage } from '@/features/admin-reporting/pages/CompaniesReportPage'

export const Route = createFileRoute('/_app/admin/reporting/companies/')({
  staticData: { title: 'Companies', capability: 'admin.reporting' },
  component: CompaniesReportPage,
})
