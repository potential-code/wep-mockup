import { createFileRoute } from '@tanstack/react-router'
import { CredentialPage } from '@/features/certification/pages/CredentialPage'

export const Route = createFileRoute('/_app/portal/certification/credential/$purchaseId')({
  staticData: { title: 'Credential', capability: 'certification.view' },
  component: CredentialPage,
})
