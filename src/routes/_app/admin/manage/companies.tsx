import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ManageCompaniesPage } from '@/features/admin-manage/pages/ManageCompaniesPage'

export const Route = createFileRoute('/_app/admin/manage/companies')({
  validateSearch: z.object({ q: z.string().optional() }),
  staticData: { title: 'Companies and Access', capability: 'admin.manage' },
  component: ManageCompaniesPage,
})
