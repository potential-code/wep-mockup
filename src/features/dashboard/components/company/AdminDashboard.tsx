import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  GraduationCap,
  ListChecks,
  UserCheck,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { SectionCard } from '@/components/shared/Cards'
import { StatCard } from '@/components/shared/StatCard'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import type { CompanyDashboardData } from '@/queries/company.queries'
import { AssessmentPanel, SupportPanel, TeamReadiness } from './AdminPanels'
import { ExpandableList } from './ExpandableList'
import { TaskRow } from './TaskRow'

const RANK = { critical: 0, warning: 1, info: 2 } as const

interface Step {
  label: string
  detail: string
  done: boolean
  to: string
}

function checklist(d: CompanyDashboardData): Step[] {
  const submittedReport = ['submitted', 'under_review', 'accepted', 'resubmitted'].includes(
    d.report.status,
  )
  return [
    {
      label: 'Complete the baseline assessment',
      done: d.assessment?.status === 'submitted',
      detail: d.assessment?.status === 'submitted' ? 'Submitted' : 'Not submitted yet',
      to: '/portal/assessment',
    },
    {
      label: 'Get every invited colleague on board',
      done: d.pendingInvites === 0,
      detail: d.pendingInvites ? `${d.pendingInvites} invitations pending` : 'Everyone has joined',
      to: '/portal/company/team',
    },
    {
      label: 'Collect evidence and clear overdue actions',
      done: d.actions.missingEvidence + d.actions.overdue === 0,
      detail: `${d.actions.missingEvidence} need evidence · ${d.actions.overdue} overdue`,
      to: '/portal/action-plan',
    },
    {
      label: `Prepare the ${d.report.year} annual report`,
      done: submittedReport,
      detail: `${d.report.sectionsDone} of ${d.report.sectionsTotal} sections · due ${formatDate(d.report.dueDate)}`,
      to: '/portal/reports',
    },
  ]
}

/** Company administrator view: operational checklist, one prominent next action, work queue. */
export function AdminDashboard({
  data,
  firstName,
}: {
  data: CompanyDashboardData
  firstName: string
}) {
  const { stats, actions } = data
  const next = [...data.tasks].sort((a, b) => RANK[a.severity] - RANK[b.severity])[0]
  const steps = checklist(data)
  const doneCount = steps.filter((s) => s.done).length
  const eligible = data.departments.reduce((n, d) => n + d.eligible, 0)

  return (
    <div>
      <PageHeader
        eyebrow={data.company.name}
        title={`Hello, ${firstName}`}
        description="What needs attention first."
      />
      <Stagger className="grid grid-cols-[minmax(0,1fr)] gap-6">
        <StaggerItem>
          <div className="grid gap-4 rounded-2xl bg-navy p-5 text-white shadow-lift sm:p-6 lg:grid-cols-3 lg:items-center">
            <div className="min-w-0 lg:col-span-2">
              <p className="font-medium text-coral-300 text-sm">
                {next ? 'Your next action' : 'All clear'}
              </p>
              <h2 className="mt-1 font-heading font-medium text-xl leading-snug sm:text-2xl">
                {next ? next.title : 'Nothing needs your attention right now'}
              </h2>
              <p className="mt-1 text-sm text-white/75">
                {next ? next.detail : 'New tasks appear here as they arise.'}
              </p>
              {next ? (
                <Button asChild variant="coral" size="lg" className="mt-4">
                  <Link to={next.to}>
                    Do this now <ArrowRight aria-hidden />
                  </Link>
                </Button>
              ) : null}
            </div>
            <div className="rounded-xl bg-white/8 p-4 ring-1 ring-white/15">
              <p className="mb-2 font-medium text-sm">
                Setup checklist · {doneCount} of {steps.length}
              </p>
              <ul className="grid gap-2 text-sm">
                {steps.map((s) => (
                  <li key={s.label}>
                    <Link to={s.to} className="flex items-start gap-2 hover:underline">
                      {s.done ? (
                        <CheckCircle2
                          className="mt-0.5 size-4 shrink-0 text-success-soft"
                          aria-hidden
                        />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0 text-white/75" aria-hidden />
                      )}
                      <span>
                        {s.label}
                        <span className="block text-white/75 text-xs">{s.detail}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </StaggerItem>
        <StaggerItem className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active users"
            value={stats.activated}
            icon={UserCheck}
            progress={stats.activationRate}
            to="/portal/company/team"
            hint={`of ${stats.invited} invited`}
          />
          <StatCard
            label="Completed learning"
            value={stats.completed}
            icon={GraduationCap}
            tone="coral"
            to="/portal/company/team"
            hint={`of ${stats.activated} activated users`}
          />
          <StatCard
            label="Eligible for clinics"
            value={eligible}
            icon={CalendarDays}
            tone="success"
            to="/portal/clinics"
            hint="people who can register now"
          />
          <StatCard
            label="Overdue actions"
            value={actions.overdue}
            icon={ListChecks}
            tone={actions.overdue ? 'danger' : 'success'}
            to="/portal/action-plan"
            search={{ flag: 'overdue' }}
            hint={`${actions.missingEvidence} also need evidence`}
          />
        </StaggerItem>
        <StaggerItem className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-5">
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6 lg:col-span-3">
            <SectionCard
              title="Work queue"
              description={`${data.tasks.length} open ${data.tasks.length === 1 ? 'task' : 'tasks'}`}
            >
              {data.tasks.length === 0 ? (
                <p className="flex items-center gap-2 text-muted-foreground text-sm">
                  <CheckCircle2 className="size-5 text-success" aria-hidden /> Your queue is empty.
                </p>
              ) : (
                <ExpandableList
                  items={data.tasks}
                  render={(t) => <TaskRow key={t.id} task={t} />}
                />
              )}
            </SectionCard>
            <TeamReadiness rows={data.departments} />
          </div>
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6 lg:col-span-2">
            <AssessmentPanel data={data} />
            <SupportPanel data={data} />
          </div>
        </StaggerItem>
      </Stagger>
    </div>
  )
}
