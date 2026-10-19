import { createFileRoute } from '@tanstack/react-router'
import { CertificationReportPage } from '@/features/admin-reporting/pages/CertificationReportPage'

export const Route = createFileRoute('/_app/admin/reporting/certification')({
  staticData: { title: 'Certification and Payments', capability: 'admin.reporting' },
  component: CertificationReportPage,
})
