import { createFileRoute } from '@tanstack/react-router'
import { ExamPage } from '@/features/certification/pages/ExamPage'

export const Route = createFileRoute('/_app/portal/certification/exam/$purchaseId')({
  staticData: { title: 'Company exam', capability: 'certification.exam' },
  component: ExamPage,
})
