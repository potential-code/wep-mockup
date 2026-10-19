import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordPage } from '@/features/public-site/pages/ForgotPasswordPage'

export const Route = createFileRoute('/_auth/forgot-password')({
  staticData: { title: 'Reset password' },
  component: ForgotPasswordPage,
})
