import { createFileRoute } from '@tanstack/react-router'
import { LessonPlayerPage } from '@/features/learning/pages/LessonPlayerPage'

export const Route = createFileRoute('/_app/portal/learn/$courseId/$lessonId')({
  staticData: { title: 'Lesson', capability: 'learn.use' },
  component: LessonPlayerPage,
})
