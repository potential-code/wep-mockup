import { Link } from '@tanstack/react-router'
import { CheckCircle2, ChevronRight, Circle, Lock, PlayCircle } from 'lucide-react'
import { SectionCard } from '@/components/shared/Cards'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { useMyLearning } from '@/queries/learning.queries'

type Row = NonNullable<ReturnType<typeof useMyLearning>['data']>['courses'][number]

const STATE = {
  complete: { label: 'Complete', tone: 'success', icon: CheckCircle2 },
  in_progress: { label: 'In progress', tone: 'info', icon: PlayCircle },
  available: { label: 'Available', tone: 'neutral', icon: Circle },
  locked: { label: 'Locked', tone: 'locked', icon: Lock },
} as const

export function PathwayList({
  courses,
  title,
  departmentLabel,
}: {
  courses: Row[]
  title: string
  departmentLabel: string
}) {
  return (
    <SectionCard
      title="Your department pathway"
      description={`${title} · sequenced for ${departmentLabel}`}
      action={
        <Link to="/portal/learn" className="font-medium text-blue text-sm hover:underline">
          Open learning path
        </Link>
      }
      bodyClassName="p-0 sm:p-0"
    >
      <ol className="divide-y">
        {courses.map((row, i) => {
          const s = STATE[row.state]
          const locked = row.state === 'locked'
          const inner = (
            <div className="flex items-start gap-4 px-5 py-4 sm:px-6">
              <span
                className={cn(
                  'mt-0.5 grid size-8 shrink-0 place-items-center rounded-full font-semibold text-sm',
                  row.state === 'complete'
                    ? 'bg-success-soft text-success'
                    : locked
                      ? 'bg-secondary text-muted-foreground'
                      : 'bg-blue-50 text-blue',
                )}
              >
                {i + 1}
              </span>
              <div className="grid min-w-0 flex-1 gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-heading font-semibold text-navy">{row.course.title}</p>
                  <StatusBadge tone={s.tone} icon={s.icon}>
                    {s.label}
                  </StatusBadge>
                  {row.course.designated ? (
                    <StatusBadge tone="gold" icon={null}>
                      Unlocks clinic
                    </StatusBadge>
                  ) : null}
                </div>
                <p className="text-muted-foreground text-sm">{row.reason}</p>
                {locked ? (
                  <p className="text-sm text-warning">
                    Finish the previous course in this pathway to unlock it.
                  </p>
                ) : row.completion.done > 0 ? (
                  <div className="flex items-center gap-3">
                    <Progress
                      value={row.completion.percent}
                      aria-label={`${row.course.title} progress`}
                      className="h-1.5 max-w-48"
                    />
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {row.completion.done}/{row.completion.total} lessons
                    </span>
                  </div>
                ) : null}
              </div>
              {!locked ? (
                <ChevronRight
                  className="mt-1.5 size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              ) : null}
            </div>
          )
          return (
            <li key={row.course.id}>
              {locked ? (
                <div className="opacity-75">{inner}</div>
              ) : (
                <Link
                  to="/portal/learn/$courseId"
                  params={{ courseId: row.course.id }}
                  className="block transition-colors hover:bg-muted/50 focus-visible:bg-muted/50"
                >
                  {inner}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </SectionCard>
  )
}
