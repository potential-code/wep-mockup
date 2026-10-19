import { PRINCIPLES } from '@shared/reference'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Quote } from 'lucide-react'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { SectionCard } from '@/components/shared/Cards'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { PageSkeleton } from '@/components/shared/States'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/use-session'
import { daysUntil, formatDate, formatPercent } from '@/lib/format'
import { useCompanyDashboard, useTeam } from '@/queries/company.queries'
import { AnimatedBar } from '../components/AnimatedBar'

export function CompanyOverviewPage() {
  const { company, can } = useCurrentUser()
  const manages = can('company.manage_team')
  const dash = useCompanyDashboard()
  const team = useTeam(company?.id)
  if (!company || (manages && dash.isLoading)) return <PageSkeleton />
  const ceo = team.data?.find((u) => u.id === company.ceoId)
  const stats = dash.data?.stats
  const report = dash.data?.report

  return (
    <Stagger className="grid gap-6 lg:grid-cols-3">
      <StaggerItem className="grid content-start gap-6 lg:col-span-2">
        <SectionCard
          title="About the company"
          description="Approved summary shown in the directory"
        >
          <p className="leading-relaxed">{company.summary}</p>
        </SectionCard>
        {company.ceoCommitment ? (
          <SectionCard title="Executive commitment">
            <figure className="flex gap-4">
              <Quote className="size-8 shrink-0 text-gold" aria-hidden />
              <div className="grid gap-3">
                <blockquote className="font-heading text-lg text-navy leading-snug">
                  {company.ceoCommitment}
                </blockquote>
                {ceo ? (
                  <figcaption className="flex items-center gap-3 text-sm">
                    <UserAvatar name={`${ceo.firstName} ${ceo.lastName}`} src={ceo.avatar} />
                    <span>
                      <span className="font-medium text-navy">
                        {ceo.firstName} {ceo.lastName}
                      </span>
                      <span className="block text-muted-foreground">{ceo.title}</span>
                    </span>
                  </figcaption>
                ) : null}
              </div>
            </figure>
          </SectionCard>
        ) : null}
        <SectionCard
          title="Priority principles"
          description="Where the company is focusing its WEPs work. A navigation theme, not a score."
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {company.priorityPrinciples.map((id) => {
              const p = PRINCIPLES.find((x) => x.id === id)
              return p ? (
                <li key={id} className="rounded-xl border bg-surface/60 p-4">
                  <PrincipleTag id={id} />
                  <p className="mt-2 text-muted-foreground text-sm">{p.description}</p>
                </li>
              ) : null
            })}
          </ul>
        </SectionCard>
      </StaggerItem>
      {manages && stats && report ? (
        <StaggerItem className="grid content-start gap-6">
          <SectionCard title="Participation" description="Employees on the portal">
            <dl className="grid gap-4 text-sm">
              <div>
                <div className="mb-1.5 flex justify-between">
                  <dt>Activated</dt>
                  <dd className="font-semibold text-navy tabular-nums">
                    {stats.activated} of {stats.invited} invited ·{' '}
                    {formatPercent(stats.activationRate)}
                  </dd>
                </div>
                <AnimatedBar value={stats.activationRate} label="Activation rate" />
              </div>
              <div>
                <div className="mb-1.5 flex justify-between">
                  <dt>Completed learning path</dt>
                  <dd className="font-semibold text-navy tabular-nums">
                    {stats.completed} of {stats.activated} · {formatPercent(stats.completionRate)}
                  </dd>
                </div>
                <AnimatedBar
                  value={stats.completionRate}
                  label="Learning completion"
                  barClassName="bg-gold"
                />
                <p className="mt-1.5 text-muted-foreground text-xs">
                  Completion is measured against activated employees, not everyone invited.
                </p>
              </div>
            </dl>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/portal/company/team">
                Open team <ArrowRight aria-hidden />
              </Link>
            </Button>
          </SectionCard>
          <SectionCard title={`${report.year} annual report`}>
            <div className="grid gap-3 text-sm">
              <WorkflowStatus status={report.status} />
              <p className="text-muted-foreground">
                {report.sectionsDone} of {report.sectionsTotal} sections complete · due{' '}
                {formatDate(report.dueDate)} ({daysUntil(report.dueDate)} days)
              </p>
              <AnimatedBar
                value={(report.sectionsDone / Math.max(1, report.sectionsTotal)) * 100}
                label="Report sections complete"
              />
              {can('reports.view') ? (
                <Button asChild variant="outline" size="sm" className="w-fit">
                  <Link to="/portal/reports">
                    Open annual reports <ArrowRight aria-hidden />
                  </Link>
                </Button>
              ) : null}
            </div>
          </SectionCard>
        </StaggerItem>
      ) : null}
    </Stagger>
  )
}
