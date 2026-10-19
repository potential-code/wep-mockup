import { Link } from '@tanstack/react-router'
import {
  Award,
  CalendarCheck2,
  CheckCircle2,
  FileBarChart,
  GraduationCap,
  ListChecks,
  MessagesSquare,
  Users,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { SectionCard } from '@/components/shared/Cards'
import { StatCard } from '@/components/shared/StatCard'
import { Button } from '@/components/ui/button'
import { formatDate, sentenceCase } from '@/lib/format'
import type { CompanyDashboardData } from '@/queries/company.queries'
import { DepartmentChart, TrendChart } from './Charts'
import { ExpandableList } from './ExpandableList'
import { IndicatorList } from './IndicatorList'
import { PrincipleSummary } from './PrincipleSummary'
import { PriorityList } from './PriorityList'
import { TaskRow } from './TaskRow'
import { UpcomingSupport } from './UpcomingSupport'

/** CEO view: concise executive picture of participation, priorities and decisions. */
export function CeoDashboard({
  data,
  firstName,
}: {
  data: CompanyDashboardData
  firstName: string
}) {
  const { stats, actions, report, company } = data
  const decisions = data.tasks.filter((t) => t.kind === 'decision' || t.kind === 'certification')
  return (
    <div>
      <PageHeader
        eyebrow={company.name}
        title={`Welcome, ${firstName}`}
        description="Participation, priorities and decisions at a glance."
        actions={
          <>
            <Button asChild>
              <Link to="/portal/company">Review Company Progress</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/portal/company/team">Manage Team</Link>
            </Button>
          </>
        }
      />
      <Stagger className="grid grid-cols-[minmax(0,1fr)] gap-6">
        <StaggerItem className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Employees activated"
            value={stats.activated}
            icon={Users}
            tone="blue"
            progress={stats.activationRate}
            to="/portal/company/team"
            search={{ status: 'accepted' }}
            hint={`of ${stats.invited} invited · ${Math.round(stats.activationRate)}%`}
          />
          <StatCard
            label="Company learning completion"
            value={Math.round(stats.completionRate)}
            suffix="%"
            icon={GraduationCap}
            tone="gold"
            progress={stats.completionRate}
            to="/portal/company/team"
            hint={`${stats.completed} of ${stats.activated} activated employees finished their path (not out of everyone invited)`}
          />
          <StatCard
            label="Actions on track"
            value={actions.onTrack}
            icon={ListChecks}
            tone="success"
            to="/portal/action-plan"
            hint={`of ${actions.active} active · ${actions.overdue} overdue`}
          />
          <StatCard
            label="Annual report"
            value={sentenceCase(report.status)}
            icon={FileBarChart}
            tone="navy"
            to="/portal/reports"
            hint={`${report.sectionsDone} of ${report.sectionsTotal} sections · due ${formatDate(report.dueDate)}`}
          />
        </StaggerItem>
        <StaggerItem className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-5">
          <div className="min-w-0 lg:col-span-3">
            <PriorityList priorities={data.priorities} />
          </div>
          <div className="min-w-0 lg:col-span-2">
            <SectionCard title="Decisions required" bodyClassName="grid gap-3">
              {decisions.length === 0 ? (
                <p className="flex items-center gap-2 text-muted-foreground text-sm">
                  <CheckCircle2 className="size-5 text-success" aria-hidden /> You’re all caught up.
                </p>
              ) : (
                <ExpandableList
                  items={decisions}
                  render={(t) => <TaskRow key={t.id} task={t} cta="Review" />}
                />
              )}
            </SectionCard>
          </div>
        </StaggerItem>
        <StaggerItem>
          <PrincipleSummary priorities={company.priorityPrinciples} />
        </StaggerItem>
        <StaggerItem className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
          <DepartmentChart rows={data.departments} />
          <TrendChart rows={data.trend} />
        </StaggerItem>
        <StaggerItem className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-5">
          <div className="min-w-0 lg:col-span-3">
            <IndicatorList data={data} />
          </div>
          <div className="min-w-0 lg:col-span-2">
            <UpcomingSupport data={data} />
          </div>
        </StaggerItem>
        <StaggerItem>
          <SectionCard title="Certification and community">
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                to="/portal/certification"
                className="flex items-center gap-3 rounded-xl border p-3 text-sm hover:border-blue"
              >
                <Award className="size-5 text-gold-700" aria-hidden /> Company certification
              </Link>
              <Link
                to="/portal/community"
                className="flex items-center gap-3 rounded-xl border p-3 text-sm hover:border-blue"
              >
                <MessagesSquare className="size-5 text-blue" aria-hidden /> Signatory community
              </Link>
              <Link
                to="/portal/clinics"
                className="flex items-center gap-3 rounded-xl border p-3 text-sm hover:border-blue"
              >
                <CalendarCheck2 className="size-5 text-blue" aria-hidden /> Clinics and webinars
              </Link>
            </div>
          </SectionCard>
        </StaggerItem>
      </Stagger>
    </div>
  )
}
