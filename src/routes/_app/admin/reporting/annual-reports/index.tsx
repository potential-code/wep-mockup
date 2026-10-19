import { createFileRoute } from '@tanstack/react-router'
import { AnnualReportsMatrixPage } from '@/features/admin-reporting/pages/AnnualReportsMatrixPage'

export const Route = createFileRoute('/_app/admin/reporting/annual-reports/')({
  staticData: { title: 'Annual Reports', capability: 'admin.reporting' },
  component: AnnualReportsMatrixPage,
})
