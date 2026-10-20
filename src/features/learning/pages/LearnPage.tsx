import { Link } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { CardGridSkeleton, ErrorState, StatsSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { CourseCard } from '@/features/learning/components/CourseCard'
import { PathSummary } from '@/features/learning/components/PathSummary'
import { useMyLearning } from '@/queries/learning.queries'

export function LearnPage() {
  const q = useMyLearning()
  const data = q.data
  const rows = (data?.courses ?? []).map(({ course, state, completion }) => ({
    course,
    state,
    completion,
  }))

  return (
    <>
      <PageHeader
        title="My learning path"
        description={
          data
            ? `${data.departmentLabel} pathway · ${data.path.description}`
            : 'Your personalised pathway'
        }
        actions={
          <Button asChild variant="outline">
            <Link to="/portal/learn/catalogue">
              <BookOpen aria-hidden /> Browse courses
            </Link>
          </Button>
        }
      />
      {q.isLoading ? (
        <div className="grid gap-6">
          <StatsSkeleton count={3} />
          <CardGridSkeleton count={3} />
        </div>
      ) : q.isError || !data ? (
        <ErrorState message={q.error?.message} onRetry={() => q.refetch()} />
      ) : (
        <div className="grid gap-6">
          <PathSummary data={data} />
          <div>
            <h2 className="mb-3 font-heading font-medium text-navy text-section">Your courses</h2>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row) => {
                const pc = data.courses.find((c) => c.course.id === row.course.id)
                return (
                  <li key={row.course.id} className="grid grid-rows-[1fr_auto] gap-2">
                    <CourseCard
                      row={row}
                      designated={row.course.id === data.designatedCourseId}
                      prerequisiteTitle={
                        row.course.prerequisiteCourseId
                          ? data.courses.find(
                              (c) => c.course.id === row.course.prerequisiteCourseId,
                            )?.course.title
                          : undefined
                      }
                    />
                    <p className="px-1 text-muted-foreground text-xs">{pc?.reason}</p>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      )}
    </>
  )
}
