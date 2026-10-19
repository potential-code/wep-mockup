import { createFileRoute } from '@tanstack/react-router'
import { AllUsersPage } from '@/features/admin-reporting/pages/AllUsersPage'

export const Route = createFileRoute('/_app/admin/reporting/users')({
  staticData: { title: 'All Users', capability: 'admin.reporting' },
  component: AllUsersPage,
})
