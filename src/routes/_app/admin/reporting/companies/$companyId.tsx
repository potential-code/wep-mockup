import { createFileRoute } from '@tanstack/react-router'
import { CompanyReportDetailPage } from '@/features/admin-reporting/pages/CompanyReportDetailPage'

export const Route = createFileRoute('/_app/admin/reporting/companies/$companyId')({
  staticData: { title: 'Company', capability: 'admin.reporting' },
  component: CompanyReportDetailPage,
})
