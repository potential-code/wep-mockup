import { createFileRoute } from '@tanstack/react-router'
import { ClinicDetailPage } from '@/features/clinics/pages/ClinicDetailPage'

export const Route = createFileRoute('/_app/portal/clinics/$eventId')({
  staticData: { title: 'Clinic', capability: 'clinics.use' },
  component: ClinicDetailPage,
})
