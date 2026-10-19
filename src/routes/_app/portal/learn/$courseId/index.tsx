import { createFileRoute } from '@tanstack/react-router'
import { CourseLandingPage } from '@/features/learning/pages/CourseViewPage'

export const Route = createFileRoute('/_app/portal/learn/$courseId/')({
  staticData: { title: 'Course', capability: 'learn.use' },
  component: CourseLandingPage,
})
