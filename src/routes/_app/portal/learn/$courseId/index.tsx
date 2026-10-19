import { createFileRoute } from '@tanstack/react-router'
import { CourseDetailPage } from '@/features/learning/pages/CourseDetailPage'

export const Route = createFileRoute('/_app/portal/learn/$courseId/')({
  staticData: { title: 'Course', capability: 'learn.use' },
  component: CourseDetailPage,
})
