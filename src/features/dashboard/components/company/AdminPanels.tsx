import { Link } from '@tanstack/react-router'
import { FileText, MessagesSquare, UserRound } from 'lucide-react'
import { SectionCard } from '@/components/shared/Cards'
import { ConciergeAvatar } from '@/components/shared/ConciergeAvatar'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { AnimatedBar } from '@/features/company/components/AnimatedBar'
import { formatDate } from '@/lib/format'
import type { CompanyDashboardData } from '@/queries/company.queries'
import { useMentors } from '@/queries/mentorship.queries'
import { useResources } from '@/queries/resources.queries'
import { ExpandableList } from './ExpandableList'

/** Departments with enrolled users, completed prerequisites and clinic eligibility. */
export function TeamReadiness({ rows }: { rows: CompanyDashboardData['departments'] }) {
  return (
    <SectionCard title="Team readiness">
      <ExpandableList
        items={rows}
        render={(r) => (
          <li key={r.department}>
            <Link
              to="/portal/company/team"
              search={{ department: r.department }}
              className="grid gap-2 rounded-xl border p-3.5 hover:border-blue hover:bg-blue-50/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-navy text-sm">{r.label}</span>
                <span className="text-muted-foreground text-xs">
                  {r.active} active · {r.completed} completed prerequisites ·{' '}
                  <span className={r.eligible ? 'font-semibold text-success' : ''}>
                    {r.eligible} clinic eligible
                  </span>
                </span>
              </div>
              <AnimatedBar
                value={r.active ? (r.completed / r.active) * 100 : 0}
                label={`${r.label} prerequisites completed`}
                className="h-1.5"
              />
            </Link>
          </li>
        )}
      />
    </SectionCard>
  )
}

/** Baseline status, priority gaps and actions that still need evidence. */
export function AssessmentPanel({ data }: { data: CompanyDashboardData }) {
  const a = data.assessment
  return (
    <SectionCard title="Assessment and action plan">
      <div className="grid gap-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-navy">Baseline assessment</span>
          <WorkflowStatus status={a?.status ?? 'not_started'} />
          {a ? (
            <span className="text-muted-foreground text-xs">updated {formatDate(a.updatedAt)}</span>
          ) : null}
        </div>
        {a?.needs.length ? (
          <div>
            <p className="mb-2 font-medium text-navy">Priority gaps</p>
            <ul className="grid gap-2">
              {a.needs.slice(0, 3).map((n) => (
                <li key={n.id} className="flex flex-wrap items-center gap-2">
                  <PrincipleTag id={n.principle} linked={false} />
                  <span>{n.title}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={data.actions.missingEvidence ? 'warning' : 'success'}>
            {data.actions.missingEvidence} actions need evidence
          </StatusBadge>
          <StatusBadge tone={data.actions.overdue ? 'danger' : 'success'}>
            {data.actions.overdue} overdue
          </StatusBadge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/portal/assessment/results">View priority gaps</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/portal/action-plan">Manage owners and deadlines</Link>
          </Button>
        </div>
      </div>
    </SectionCard>
  )
}

/** Templates, mentors, AI reporting help and recent community discussions. */
export function SupportPanel({ data }: { data: CompanyDashboardData }) {
  const resources = useResources()
  const mentors = useMentors()
  const templates = (resources.data?.resources ?? [])
    .filter((r) => /template|toolkit|guide/i.test(r.title))
    .slice(0, 1)
  return (
    <SectionCard
      title="Support and resources"
      action={
        <Link to="/portal/community" className="text-blue text-sm hover:underline">
          View all
        </Link>
      }
    >
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-2.5 text-sm">
        {templates.map((r) => (
          <li key={r.id}>
            <Link
              to="/portal/resources/$resourceId"
              params={{ resourceId: r.id }}
              className="flex min-w-0 items-center gap-2.5 rounded-xl border p-3 hover:border-blue"
            >
              <FileText className="size-4 shrink-0 text-blue" aria-hidden />
              <span className="min-w-0 truncate">{r.title}</span>
            </Link>
          </li>
        ))}
        {(mentors.data ?? []).slice(0, 1).map((m) => (
          <li key={m.profile.userId}>
            <Link
              to="/portal/mentorship/$mentorId"
              params={{ mentorId: m.profile.userId }}
              className="flex min-w-0 items-center gap-2.5 rounded-xl border p-3 hover:border-blue"
            >
              <UserRound className="size-4 shrink-0 text-coral-700" aria-hidden />
              <span className="min-w-0 truncate">
                {m.name} · {m.profile.headline}
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            to="/portal/concierge"
            className="flex min-w-0 items-center gap-2.5 rounded-xl border border-blue/30 bg-blue-50 p-3 hover:border-blue"
          >
            <ConciergeAvatar size="sm" online />
            <span>
              AI reporting assistance <span className="text-muted-foreground">· scripted demo</span>
            </span>
          </Link>
        </li>
        {data.recentThreads.slice(0, 1).map((t) => (
          <li key={t.id}>
            <Link
              to="/portal/community/thread/$threadId"
              params={{ threadId: t.id }}
              className="flex min-w-0 items-center gap-2.5 rounded-xl border p-3 hover:border-blue"
            >
              <MessagesSquare className="size-4 shrink-0 text-navy" aria-hidden />
              <span className="min-w-0 truncate">{t.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
