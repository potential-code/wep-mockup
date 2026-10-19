import { Link } from '@tanstack/react-router'
import { BookOpen, Info } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoLabel, SectionCard } from '@/components/shared/Cards'
import { CardGridSkeleton, EmptyState, ErrorState, StatsSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { CourseCard } from '@/features/learning/components/CourseCard'
import { CourseFilters, useCourseFilters } from '@/features/learning/components/CourseFilters'
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
  const { f, setF, filtered, active, clear } = useCourseFilters(rows)

  return (
    <>
      <PageHeader
        title="My learning path"
        description={
          data
            ? `${data.departmentLabel} pathway · sequenced for your role`
            : 'Your personalised pathway'
        }
        actions={
          <>
            <DemoLabel>Proposed course content</DemoLabel>
            <Button asChild variant="outline">
              <Link to="/portal/learn/catalogue">
                <BookOpen aria-hidden /> Browse courses
              </Link>
            </Button>
          </>
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
          <SectionCard bodyClassName="flex gap-3 text-sm">
            <Info className="mt-0.5 size-5 shrink-0 text-blue" aria-hidden />
            <p className="text-muted-foreground">
              <span className="font-medium text-navy">Why this pathway? </span>
              {data.path.description} Courses are ordered using your department and your company’s
              current WEPs priorities, so the most relevant lessons come first. Lessons in the
              designated course earn qualifying points toward clinic access.
            </p>
          </SectionCard>
          <div>
            <h2 className="mb-3 font-heading font-semibold text-navy text-section">Your courses</h2>
            <CourseFilters
              rows={rows}
              state={f}
              onChange={setF}
              onClear={clear}
              active={active}
              count={filtered.length}
              showSearch={false}
            />
            {filtered.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No courses match these filters"
                description="Clear the filters to see your whole pathway."
                action={
                  <Button variant="outline" onClick={clear}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((row) => {
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
            )}
          </div>
        </div>
      )}
    </>
  )
}
