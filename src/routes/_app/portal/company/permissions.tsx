import { createFileRoute } from '@tanstack/react-router'
import { PermissionsPage } from '@/features/company/pages/PermissionsPage'

export const Route = createFileRoute('/_app/portal/company/permissions')({
  staticData: { title: 'Permissions', capability: 'company.delegate' },
  component: PermissionsPage,
})
