import { createFileRoute } from '@tanstack/react-router'
import { ManageCompaniesPage } from '@/features/admin-manage/pages/ManageCompaniesPage'

export const Route = createFileRoute('/_app/admin/manage/companies')({
  staticData: { title: 'Companies and Access', capability: 'admin.manage' },
  component: ManageCompaniesPage,
})
