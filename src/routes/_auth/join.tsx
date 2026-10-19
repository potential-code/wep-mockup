import { createFileRoute } from '@tanstack/react-router'
import { JoinPage } from '@/features/join/pages/JoinPage'

export const Route = createFileRoute('/_public/join')({
  staticData: { title: 'Join WEPs' },
  component: JoinPage,
})
