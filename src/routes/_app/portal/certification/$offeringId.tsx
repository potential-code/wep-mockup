import { createFileRoute } from '@tanstack/react-router'
import { OfferingDetailPage } from '@/features/certification/pages/OfferingDetailPage'

export const Route = createFileRoute('/_app/portal/certification/$offeringId')({
  staticData: { title: 'Certification details', capability: 'certification.view' },
  component: OfferingDetailPage,
})
