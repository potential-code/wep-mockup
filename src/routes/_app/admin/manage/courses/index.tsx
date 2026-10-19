import { createFileRoute } from '@tanstack/react-router'
import { ManageCoursesPage } from '@/features/admin-manage/pages/ManageCoursesPage'

export const Route = createFileRoute('/_app/admin/manage/courses/')({
  staticData: { title: 'Courses and Learning Paths', capability: 'admin.manage' },
  component: ManageCoursesPage,
})
