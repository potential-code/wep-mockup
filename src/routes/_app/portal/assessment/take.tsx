import { createFileRoute } from '@tanstack/react-router'
import { AssessmentTakePage } from '@/features/assessment/pages/AssessmentTakePage'

export const Route = createFileRoute('/_app/portal/assessment/take')({
  staticData: { title: 'Complete assessment', capability: 'assessment.manage' },
  component: AssessmentTakePage,
})
