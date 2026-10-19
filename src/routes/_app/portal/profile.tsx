import { createFileRoute } from '@tanstack/react-router'
import { MyProfilePage } from '@/features/dashboard/pages/MyProfilePage'

export const Route = createFileRoute('/_app/portal/profile')({
  staticData: { title: 'My profile' },
  component: MyProfilePage,
})
