import type { AnnualReport } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarClock, UserRound } from 'lucide-react'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { daysUntil, formatDate, plural } from '@/lib/format'
import { SECTION_META } from '@/queries/reports.queries'
import { LOCKED_STATUSES } from '../lib'

export function CurrentReportCard({
  year,
  report,
  dueDate,
  preparer,
}: {
  year: number
  report: AnnualReport | null
  dueDate: string
  preparer?: string
}) {
  const done = report ? SECTION_META.filter((s) => report.sectionComplete[s.key]).length : 0
  const total = SECTION_META.length
  const days = daysUntil(report?.dueDate ?? dueDate)
  const started = Boolean(report) && report?.status !== 'not_started'
  const locked = report ? LOCKED_STATUSES.includes(report.status) : false
  const cta = locked ? 'View report' : started ? 'Continue report' : 'Start report'
  return (
    <section
      aria-labelledby="current-report"
      className="grid gap-6 rounded-2xl border bg-card p-5 shadow-card sm:p-6 lg:grid-cols-[1fr_auto]"
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="current-report" className="font-heading font-semibold text-navy text-xl">
            {year} annual report
          </h2>
          <WorkflowStatus status={report?.status ?? 'not_started'} />
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 size-4 text-blue" aria-hidden />
            <div>
              <dt className="text-muted-foreground text-xs">Due date</dt>
              <dd className="font-medium text-navy">
                {formatDate(report?.dueDate ?? dueDate)}
                <span className={days <= 14 ? 'text-danger' : 'text-muted-foreground'}>
                  {' '}
                  · {days > 0 ? `${plural(days, 'day')} left` : 'due now'}
                </span>
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <UserRound className="mt-0.5 size-4 text-blue" aria-hidden />
            <div>
              <dt className="text-muted-foreground text-xs">Assigned preparer</dt>
              <dd className="font-medium text-navy">{preparer ?? 'Not yet assigned'}</dd>
            </div>
          </div>
        </dl>
        <div className="grid gap-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sections complete</span>
            <span className="font-medium text-navy">
              {done} of {total}
            </span>
          </div>
          <Progress
            value={(done / total) * 100}
            aria-label={`${done} of ${total} sections complete`}
          />
        </div>
      </div>
      <div className="flex items-end">
        <Button asChild size="lg" className="w-full lg:w-auto">
          <Link to="/portal/reports/$year" params={{ year: String(year) }}>
            {cta} <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  )
}
