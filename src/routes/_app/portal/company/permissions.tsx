import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { PermissionsPage } from '@/features/company/pages/PermissionsPage'

export const Route = createFileRoute('/_app/portal/company/permissions')({
  validateSearch: z.object({ user: z.string().optional() }),
  staticData: { title: 'Permissions', capability: 'company.delegate' },
  component: PermissionsPage,
})
