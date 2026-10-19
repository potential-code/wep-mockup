import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/admin/manage/')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/manage/applications' })
  },
})
