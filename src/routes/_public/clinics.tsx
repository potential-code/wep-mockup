import { createFileRoute, redirect } from '@tanstack/react-router'

// The public site is a single landing page: old section URLs land on the matching section.
export const Route = createFileRoute('/_public/clinics')({
  beforeLoad: () => {
    throw redirect({ to: '/', hash: 'clinics', replace: true })
  },
})
