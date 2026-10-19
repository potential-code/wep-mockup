import { Link } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoLabel } from '@/components/shared/Cards'
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { CourseCard } from '@/features/learning/components/CourseCard'
import { CourseFilters, useCourseFilters } from '@/features/learning/components/CourseFilters'
import { useCourses, useMyLearning } from '@/queries/learning.queries'

export function CataloguePage() {
  const courses = useCourses()
  const mine = useMyLearning()
  const rows = courses.data ?? []
  const { f, setF, filtered, active, clear } = useCourseFilters(rows)
  const designatedId = mine.data?.designatedCourseId

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Learn', to: '/portal/learn' }, { label: 'Browse courses' }]}
        title="Browse courses"
        description="Every course in the WEPs learning library. Your department pathway is recommended first, but you can explore any topic."
        actions={
          <>
            <DemoLabel>Proposed course content</DemoLabel>
            <Button asChild variant="outline">
              <Link to="/portal/learn">My learning path</Link>
            </Button>
          </>
        }
      />
      <CourseFilters
        rows={rows}
        state={f}
        onChange={setF}
        onClear={clear}
        active={active}
        count={filtered.length}
      />
      {courses.isLoading ? (
        <CardGridSkeleton count={6} />
      ) : courses.isError ? (
        <ErrorState message={courses.error.message} onRetry={() => courses.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses match these filters"
          description="Try a different topic or clear the filters to see the full library."
          action={
            <Button variant="outline" onClick={clear}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((row) => (
            <li key={row.course.id}>
              <CourseCard
                row={row}
                designated={row.course.id === designatedId}
                prerequisiteTitle={
                  row.course.prerequisiteCourseId
                    ? rows.find((r) => r.course.id === row.course.prerequisiteCourseId)?.course
                        .title
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
