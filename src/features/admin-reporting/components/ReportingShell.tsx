import { Link, useLocation } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { type Crumb, PageHeader } from '@/components/layout/PageHeader'
import { cn } from '@/lib/utils'
import { searchProp, useReportingFilters } from './filters'
import { ReportingFilterBar } from './ReportingFilterBar'

const TABS = [
  { to: '/admin/reporting', label: 'Executive', exact: true },
  { to: '/admin/reporting/analytics', label: 'Analytics' },
  { to: '/admin/reporting/companies', label: 'Companies' },
  { to: '/admin/reporting/signatories', label: 'Signatories' },
  { to: '/admin/reporting/users', label: 'All users' },
  { to: '/admin/reporting/learning', label: 'Learning and clinics' },
  { to: '/admin/reporting/mentorship', label: 'Mentorship' },
  { to: '/admin/reporting/assessments', label: 'Assessments and actions' },
  { to: '/admin/reporting/annual-reports', label: 'Annual reports' },
  { to: '/admin/reporting/community', label: 'Community and marketplace' },
  { to: '/admin/reporting/certification', label: 'Certification and payments' },
  { to: '/admin/reporting/report-builder', label: 'Report builder' },
]

/** Page frame for every reporting screen: header, tab strip and the persistent filter bar. */
export function ReportingShell({
  title,
  description,
  actions,
  breadcrumbs,
  eyebrow,
  showPrinciple,
  hideFilters,
  children,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  breadcrumbs?: Crumb[]
  eyebrow?: ReactNode
  showPrinciple?: boolean
  hideFilters?: boolean
  children: ReactNode
}) {
  const { pathname } = useLocation()
  const { filterSearch } = useReportingFilters()
  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={actions}
        breadcrumbs={breadcrumbs}
        eyebrow={eyebrow}
        className="mb-4 sm:mb-5"
      />
      <nav
        aria-label="Reporting sections"
        className="-mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0"
      >
        <ul className="flex w-max gap-1 rounded-full border bg-card p-1 shadow-card sm:w-auto sm:flex-wrap sm:rounded-2xl">
          {TABS.map((t) => {
            const active = t.exact
              ? pathname === t.to || pathname === `${t.to}/`
              : pathname.startsWith(t.to)
            return (
              <li key={t.to}>
                <Link
                  to={t.to}
                  search={searchProp(filterSearch)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'block whitespace-nowrap rounded-full px-3 py-1.5 font-medium text-sm transition-colors sm:rounded-xl',
                    active ? 'bg-navy text-white' : 'text-navy hover:bg-muted',
                  )}
                >
                  {t.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      {hideFilters ? null : <ReportingFilterBar showPrinciple={showPrinciple} />}
      {children}
    </div>
  )
}
