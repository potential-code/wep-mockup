import { createFileRoute } from '@tanstack/react-router'
import { PublicClinicsPage } from '@/features/public-site/pages/PublicClinicsPage'

export const Route = createFileRoute('/_public/clinics')({
  staticData: { title: 'Clinics and Events' },
  component: PublicClinicsPage,
})
