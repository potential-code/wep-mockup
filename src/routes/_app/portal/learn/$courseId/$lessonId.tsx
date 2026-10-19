import { createFileRoute } from '@tanstack/react-router'
import { CourseItemPage } from '@/features/learning/pages/CourseViewPage'

export const Route = createFileRoute('/_app/portal/learn/$courseId/$lessonId')({
  staticData: { title: 'Course', capability: 'learn.use' },
  component: CourseItemPage,
})
