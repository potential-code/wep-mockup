import type { ReactNode } from 'react'
import { type Crumb, PageHeader } from '@/components/layout/PageHeader'
import { ReportingFilterBar } from './ReportingFilterBar'

/** Page frame for every reporting screen: header and persistent filter bar. Section navigation lives in the sidebar. */
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
      {hideFilters ? null : <ReportingFilterBar showPrinciple={showPrinciple} />}
      {children}
    </div>
  )
}
