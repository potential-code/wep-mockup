import { createFileRoute } from '@tanstack/react-router'
import { ReportEditorPage } from '@/features/reports/pages/ReportEditorPage'

export const Route = createFileRoute('/_app/portal/reports/$year')({
  staticData: { title: 'Annual report', capability: 'reports.view' },
  component: ReportEditorPage,
})
