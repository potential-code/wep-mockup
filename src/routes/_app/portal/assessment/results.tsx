import { createFileRoute } from '@tanstack/react-router'
import { AssessmentResultsPage } from '@/features/assessment/pages/AssessmentResultsPage'

export const Route = createFileRoute('/_app/portal/assessment/results')({
  staticData: { title: 'Assessment results', capability: 'assessment.view' },
  component: AssessmentResultsPage,
})
