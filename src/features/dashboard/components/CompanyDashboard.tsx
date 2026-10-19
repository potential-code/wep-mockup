import { Building2 } from 'lucide-react'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/shared/States'
import { useCurrentUser } from '@/hooks/use-session'
import { useCompanyDashboard } from '@/queries/company.queries'
import { AdminDashboard } from './company/AdminDashboard'
import { CeoDashboard } from './company/CeoDashboard'

/** CEO and company administrator dashboards: two variants over one data source. */
export function CompanyDashboard() {
  const { user } = useCurrentUser()
  const { data, isLoading, isError, refetch } = useCompanyDashboard()
  if (isLoading || !user) return <PageSkeleton />
  if (isError)
    return <ErrorState message="Your dashboard couldn’t load." onRetry={() => refetch()} />
  if (!data)
    return (
      <EmptyState
        icon={Building2}
        title="No company linked"
        description="Your account isn’t linked to a company yet."
      />
    )
  return user.role === 'ceo' ? (
    <CeoDashboard data={data} firstName={user.firstName} />
  ) : (
    <AdminDashboard data={data} firstName={user.firstName} />
  )
}
