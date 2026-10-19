import { fullName } from '@shared/permissions'
import { departmentLabel } from '@shared/reference'
import { Link, useParams } from '@tanstack/react-router'
import { AlertTriangle, ExternalLink, FileText } from 'lucide-react'
import { SectionCard } from '@/components/shared/Cards'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { CompanyLogo, UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, plural, relativeTime } from '@/lib/format'
import { useCompanyDetail } from '@/queries/admin.queries'
import { searchProp, useReportingFilters } from '../components/filters'
import { QueryState, Stat } from '../components/QueryState'
import { ReportingShell } from '../components/ReportingShell'

export function CompanyReportDetailPage() {
  const { companyId } = useParams({ strict: false }) as { companyId: string }
  const { filterSearch } = useReportingFilters()
  const q = useCompanyDetail(companyId)
  const d = q.data
  const search = searchProp(filterSearch)
  const overdue = d?.actions.filter((a) => a.overdue) ?? []

  return (
    <ReportingShell
      title={d?.company.name ?? 'Company'}
      breadcrumbs={[
        { label: 'Reporting', to: '/admin/reporting' },
        { label: 'Companies', to: '/admin/reporting/companies' },
        { label: d?.company.name ?? 'Company' },
      ]}
      description="Company record from the reporting layer: users, actions, reports, certifications and support."
      actions={
        <Button asChild variant="outline">
          <Link to="/admin/manage/companies" search={{ q: d?.company.name }}>
            <ExternalLink aria-hidden /> Open in Platform Management
          </Link>
        </Button>
      }
    >
      <QueryState isLoading={q.isLoading} isError={q.isError} refetch={q.refetch} hasData={!!d}>
        {d ? (
          <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
            <section className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-5 shadow-card">
              <CompanyLogo name={d.company.name} src={d.company.logo} className="size-16" />
              <div className="grid min-w-0 flex-1 gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <WorkflowStatus status={d.company.signatoryStatus} />
                  {overdue.length > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2.5 py-0.5 font-medium text-danger text-xs">
                      <AlertTriangle className="size-3.5" aria-hidden />
                      {plural(overdue.length, 'overdue action')}
                    </span>
                  ) : null}
                </div>
                <p className="text-muted-foreground text-sm">
                  {d.company.country} · {d.company.region} · {d.company.sector} · {d.company.size}{' '}
                  staff · Last activity {relativeTime(d.company.lastActivityAt)}
                </p>
                <p className="max-w-3xl text-sm">{d.company.summary}</p>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat
                label="Activated users"
                value={d.stats.activated}
                hint={`of ${d.stats.invited} invited (${d.stats.activationRate}%)`}
              />
              <Stat
                label="Path completions"
                value={d.stats.completed}
                hint={`${d.stats.completionRate}% of activated`}
              />
              <Stat
                label="Clinic registrations"
                value={d.registrations}
                hint={`${d.bookings} mentoring bookings`}
              />
              <Stat label="Certifications" value={d.purchases.length} hint="Demo purchases" />
            </div>

            <SectionCard
              title="Actions"
              description="Implementation evidence layer. Overdue items are flagged with text and icon."
            >
              {d.actions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No actions have been created yet.</p>
              ) : (
                <ul className="divide-y">
                  {d.actions.map(({ action: a, overdue: od, owner }) => (
                    <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-navy text-sm">{a.title}</p>
                        <p className="text-muted-foreground text-xs">
                          Owner {owner ? fullName(owner) : '—'} · {departmentLabel(a.department)} ·
                          due {formatDate(a.dueDate)} · {a.evidence.length} evidence file
                          {a.evidence.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <PrincipleTag id={a.principle} />
                      {od ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-danger text-xs">
                          <AlertTriangle className="size-3.5" aria-hidden /> Overdue
                        </span>
                      ) : null}
                      <WorkflowStatus status={a.status} />
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              title="Annual report history"
              description="Company-reported outcomes layer. Open any year to review it."
            >
              {d.reports.length === 0 ? (
                <p className="text-muted-foreground text-sm">No annual reports yet.</p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {d.reports.map((r) => (
                    <li key={r.id}>
                      <Link
                        to="/admin/reporting/annual-reports/$reportId"
                        params={{ reportId: r.id }}
                        className="flex items-center gap-3 rounded-xl border p-3 hover:border-blue/40 hover:bg-surface"
                      >
                        <FileText className="size-5 text-blue" aria-hidden />
                        <span className="grid flex-1">
                          <span className="font-semibold text-navy">{r.year} report</span>
                          <span className="text-muted-foreground text-xs">
                            {plural(r.versions.length, 'version')} · due {formatDate(r.dueDate)}
                          </span>
                        </span>
                        <WorkflowStatus status={r.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
              <SectionCard
                title="Members"
                description={`${d.members.length} users with company access.`}
              >
                <ul className="divide-y">
                  {d.members.map(({ user: u, completed, points }) => (
                    <li key={u.id} className="flex items-center gap-3 py-2.5">
                      <UserAvatar name={fullName(u)} src={u.avatar} className="size-8" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-navy text-sm">{fullName(u)}</p>
                        <p className="truncate text-muted-foreground text-xs">
                          {departmentLabel(u.department)} · {u.invitationStatus} · {points} pts
                        </p>
                      </div>
                      {completed ? <WorkflowStatus status="completed" /> : null}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="ghost" size="sm" className="mt-2">
                  <Link to="/admin/reporting/users" search={{ ...search, q: d.company.name }}>
                    View in All users
                  </Link>
                </Button>
              </SectionCard>

              <div className="grid min-w-0 *:min-w-0 content-start gap-6">
                <SectionCard title="Certifications" description="Demo payments only.">
                  {d.purchases.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No certification purchases.</p>
                  ) : (
                    <ul className="divide-y">
                      {d.purchases.map(({ purchase: p, offering }) => (
                        <li
                          key={p.id}
                          className="flex items-center justify-between gap-3 py-2.5 text-sm"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-navy">
                              {offering?.title ?? p.offeringId}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {formatCurrency(p.amount)} (demo)
                            </span>
                          </span>
                          <WorkflowStatus status={p.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </SectionCard>
                <SectionCard title="Marketplace listings">
                  {d.listings.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No listings submitted.</p>
                  ) : (
                    <ul className="divide-y">
                      {d.listings.map((l) => (
                        <li
                          key={l.id}
                          className="flex items-center justify-between gap-3 py-2.5 text-sm"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-navy">{l.title}</span>
                            <span className="text-muted-foreground text-xs">
                              {l.views} views · {l.outboundClicks} outbound clicks
                            </span>
                          </span>
                          <WorkflowStatus status={l.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </SectionCard>
                <SectionCard title="Support used">
                  <p className="text-sm">
                    {plural(d.registrations, 'clinic registration')} and{' '}
                    {plural(d.bookings, 'mentoring booking')} by this company's users.
                  </p>
                </SectionCard>
              </div>
            </div>
          </div>
        ) : null}
      </QueryState>
    </ReportingShell>
  )
}
