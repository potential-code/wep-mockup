import { createFileRoute } from '@tanstack/react-router'
import { CertificationEditorPage } from '@/features/admin-manage/pages/CertificationEditorPage'

export const Route = createFileRoute('/_app/admin/manage/certifications/$offeringId')({
  staticData: { title: 'Certification editor', capability: 'admin.manage' },
  component: CertificationEditorPage,
})
