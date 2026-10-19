import { createFileRoute } from '@tanstack/react-router'
import { AssessmentPage } from '@/features/assessment/pages/AssessmentPage'

export const Route = createFileRoute('/_app/portal/assessment/')({
  staticData: { title: 'Assessment', capability: 'assessment.view' },
  component: AssessmentPage,
})
