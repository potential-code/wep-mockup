import { createFileRoute } from '@tanstack/react-router'
import { LearnPage } from '@/features/learning/pages/LearnPage'

export const Route = createFileRoute('/_app/portal/learn/')({
  staticData: { title: 'Learn', capability: 'learn.use' },
  component: LearnPage,
})
