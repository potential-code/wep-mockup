import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { Briefcase, CalendarCheck, FileBarChart, MapPin } from 'lucide-react'
import { motion } from 'motion/react'
import { AccessNotice } from '@/components/shared/States'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { CompanyLogo } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/use-session'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useCompanyDashboard } from '@/queries/company.queries'
import { PublicProfileSheet } from '../components/PublicProfileSheet'

interface TabDef {
  label: string
  to: string
  active: (path: string) => boolean
  show: boolean
}

export function CompanyLayout() {
  const { company, can, isLoading } = useCurrentUser()
  const { pathname } = useLocation()
  const dash = useCompanyDashboard()
  if (isLoading) return <Skeleton className="h-40 w-full rounded-2xl" />
  if (!company)
    return <AccessNotice title="No company" message="Your account isn’t linked to a company." />

  const manage = can('company.manage_team')
  const tabs: TabDef[] = [
    {
      label: 'Overview',
      to: '/portal/company',
      active: (p) => p === '/portal/company' || p === '/portal/company/',
      show: true,
    },
    {
      label: 'Company Details',
      to: '/portal/company/details',
      active: (p) => p.startsWith('/portal/company/details'),
      show: true,
    },
    {
      label: 'Team and Permissions',
      to: manage ? '/portal/company/team' : '/portal/company/permissions',
      active: (p) => p.includes('/company/team') || p.includes('/company/permissions'),
      show: manage || can('company.delegate'),
    },
    { label: 'Action Plan', to: '/portal/action-plan', active: () => false, show: true },
    {
      label: 'Activity',
      to: '/portal/company/activity',
      active: (p) => p.startsWith('/portal/company/activity'),
      show: manage,
    },
  ]
  const report = dash.data?.report

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <header className="rounded-2xl border bg-card p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-start gap-4 sm:gap-5">
          <CompanyLogo name={company.name} src={company.logo} className="size-16 sm:size-20" />
          <div className="grid min-w-0 flex-1 gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-page-title text-navy">{company.name}</h1>
              <WorkflowStatus status={company.signatoryStatus} />
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-muted-foreground text-sm">
              <li className="flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden /> {company.country}
              </li>
              <li className="flex items-center gap-1.5">
                <Briefcase className="size-4" aria-hidden /> {company.sector}
              </li>
              <li className="flex items-center gap-1.5">
                <CalendarCheck className="size-4" aria-hidden /> Member since{' '}
                {formatDate(company.memberSince, { month: 'long', year: 'numeric' })}
              </li>
            </ul>
            {company.pendingProfileRevision ? (
              <p className="text-sm text-warning">
                A change to {company.pendingProfileRevision.field} is awaiting UN Women review.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PublicProfileSheet company={company} />
            {can('reports.view') ? (
              <Button asChild variant="outline">
                <Link to="/portal/reports">
                  <FileBarChart aria-hidden /> Annual Reports
                  {report ? <WorkflowStatus status={report.status} className="ms-1" /> : null}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
        <nav aria-label="Company sections" className="-mb-5 mt-5 overflow-x-auto sm:-mb-6">
          <ul className="flex min-w-max gap-1 border-t pt-1">
            {tabs
              .filter((t) => t.show)
              .map((t) => {
                const isActive = t.active(pathname)
                return (
                  <li key={t.label}>
                    <Link
                      to={t.to}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'relative block px-4 py-3 font-medium text-sm transition-colors',
                        isActive ? 'text-navy' : 'text-muted-foreground hover:text-navy',
                      )}
                    >
                      {t.label}
                      {isActive ? (
                        <motion.span
                          layoutId="company-tab-underline"
                          className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-blue"
                          transition={{ duration: 0.2 }}
                        />
                      ) : null}
                    </Link>
                  </li>
                )
              })}
          </ul>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
