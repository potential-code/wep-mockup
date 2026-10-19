import { createFileRoute } from '@tanstack/react-router'
import { SignatoriesPage } from '@/features/admin-reporting/pages/SignatoriesPage'

export const Route = createFileRoute('/_app/admin/reporting/signatories')({
  staticData: { title: 'Signatories', capability: 'admin.reporting' },
  component: SignatoriesPage,
})
