import { Link, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { EligibilityPanel } from '@/features/clinics/components/EligibilityPanel'
import { CourseHero } from '@/features/learning/components/CourseHero'
import { CourseSidebar } from '@/features/learning/components/CourseSidebar'
import { LessonList } from '@/features/learning/components/LessonList'
import { useRegister } from '@/queries/clinics.queries'
import { useCourse, useMyLearning } from '@/queries/learning.queries'

export function CourseDetailPage() {
  const { courseId } = useParams({ from: '/_app/portal/learn/$courseId/' })
  const q = useCourse(courseId)
  const mine = useMyLearning()
  const register = useRegister()
  const d = q.data

  if (q.isLoading) return <PageSkeleton />
  if (q.isError || !d) return <ErrorState message={q.error?.message} onRetry={() => q.refetch()} />
  const designated = mine.data?.designatedCourseId === d.course.id

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Learn', to: '/portal/learn' },
          { label: 'Browse courses', to: '/portal/learn/catalogue' },
          { label: d.course.title },
        ]}
        title={d.course.title}
        description={d.course.objective}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-6">
          <CourseHero data={d} />
          <LessonList data={d} designated={designated} />
        </div>
        <div className="grid content-start gap-5 lg:sticky lg:top-20">
          <CourseSidebar data={d} designated={designated} />
          {d.eligibility && d.relatedEvent ? (
            <div className="grid gap-2">
              <p className="font-medium text-navy text-sm">Related clinic</p>
              <EligibilityPanel
                eligibility={d.eligibility}
                eventTitle={d.relatedEvent.title}
                registering={register.isPending}
                onRegister={() =>
                  register.mutate(d.relatedEvent?.id as string, {
                    onSuccess: () => toast.success('You are registered for the clinic.'),
                  })
                }
                footer={
                  <Link
                    to="/portal/clinics/$eventId"
                    params={{ eventId: d.relatedEvent.id }}
                    className="text-blue text-sm underline-offset-4 hover:underline"
                  >
                    View clinic details
                  </Link>
                }
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
