import { createFileRoute } from '@tanstack/react-router'
import { ClinicsPage } from '@/features/clinics/pages/ClinicsPage'

export const Route = createFileRoute('/_app/portal/clinics/')({
  staticData: { title: 'Clinics', capability: 'clinics.use' },
  component: ClinicsPage,
})
