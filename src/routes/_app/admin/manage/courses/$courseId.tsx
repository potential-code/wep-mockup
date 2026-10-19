import { createFileRoute } from '@tanstack/react-router'
import { CourseEditorPage } from '@/features/admin-manage/pages/CourseEditorPage'

export const Route = createFileRoute('/_app/admin/manage/courses/$courseId')({
  staticData: { title: 'Course editor', capability: 'admin.manage' },
  component: CourseEditorPage,
})
