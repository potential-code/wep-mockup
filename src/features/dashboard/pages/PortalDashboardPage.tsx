import { CompanyDashboard } from '@/features/dashboard/components/CompanyDashboard'
import { EmployeeDashboard } from '@/features/dashboard/components/EmployeeDashboard'
import { useCurrentUser } from '@/hooks/use-session'

/** /portal: the dashboard adapts to the signed-in role. */
export function PortalDashboardPage() {
  const { user } = useCurrentUser()
  return user?.role === 'employee' ? <EmployeeDashboard /> : <CompanyDashboard />
}
