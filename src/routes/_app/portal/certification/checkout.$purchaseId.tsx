import { createFileRoute } from '@tanstack/react-router'
import { CheckoutPage } from '@/features/certification/pages/CheckoutPage'

export const Route = createFileRoute('/_app/portal/certification/checkout/$purchaseId')({
  staticData: { title: 'Checkout', capability: 'certification.purchase' },
  component: CheckoutPage,
})
