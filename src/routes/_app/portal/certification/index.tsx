import { createFileRoute } from '@tanstack/react-router'
import { CertificationPage } from '@/features/certification/pages/CertificationPage'

export const Route = createFileRoute('/_app/portal/certification/')({
  staticData: { title: 'Certification', capability: 'certification.view' },
  component: CertificationPage,
})
