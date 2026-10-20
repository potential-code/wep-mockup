import { fullName } from '@shared/permissions'
import { departmentLabel } from '@shared/reference'
import { Link } from '@tanstack/react-router'
import { BookOpen, CalendarDays, FileText, ListPlus, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/use-session'
import { useAddNeedToPlan, type useAssessment } from '@/queries/assessment.queries'

type Need = NonNullable<ReturnType<typeof useAssessment>['data']>['needs'][number]

const chip =
  'inline-flex max-w-full items-center gap-1.5 rounded-lg border bg-surface px-2.5 py-1.5 text-xs hover:border-blue hover:text-blue'

/** An identified need with the support that addresses it and the bridge into the action plan. */
export function NeedCard({ need }: { need: Need }) {
  const add = useAddNeedToPlan()
  const { can } = useCurrentUser()
  return (
    <li className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 rounded-2xl border bg-card p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <PrincipleTag id={need.principle} />
        <StatusBadge tone="neutral" icon={null}>
          {departmentLabel(need.department)}
        </StatusBadge>
      </div>
      <div>
        <h3 className="font-heading font-medium text-navy">{need.title}</h3>
        <p className="mt-1 text-muted-foreground text-sm">{need.description}</p>
      </div>
      <ul className="flex flex-wrap gap-2" aria-label="Suggested support">
        {need.resource ? (
          <li className="min-w-0">
            <Link
              to="/portal/resources/$resourceId"
              params={{ resourceId: need.resource.id }}
              className={chip}
            >
              <FileText className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">Resource: {need.resource.title}</span>
            </Link>
          </li>
        ) : null}
        {need.course ? (
          <li className="min-w-0">
            <Link
              to="/portal/learn/$courseId"
              params={{ courseId: need.course.id }}
              className={chip}
            >
              <BookOpen className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">Course: {need.course.title}</span>
            </Link>
          </li>
        ) : null}
        {need.event ? (
          <li className="min-w-0">
            <Link
              to="/portal/clinics/$eventId"
              params={{ eventId: need.event.id }}
              className={chip}
            >
              <CalendarDays className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">Clinic: {need.event.title}</span>
            </Link>
          </li>
        ) : null}
        {need.mentor ? (
          <li className="min-w-0">
            <Link
              to="/portal/mentorship/$mentorId"
              params={{ mentorId: need.mentor.id }}
              className={chip}
            >
              <UserRound className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">Mentor: {fullName(need.mentor)}</span>
            </Link>
          </li>
        ) : null}
      </ul>
      {need.inPlan ? (
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link to="/portal/action-plan">In your action plan · view</Link>
        </Button>
      ) : can('actions.manage') ? (
        <Button
          size="sm"
          className="w-fit"
          disabled={add.isPending}
          onClick={() =>
            add.mutate(need.id, {
              onSuccess: () => toast.success('Added to the action plan as a draft'),
            })
          }
        >
          <ListPlus aria-hidden /> {add.isPending ? 'Adding…' : 'Add to action plan'}
        </Button>
      ) : null}
    </li>
  )
}
