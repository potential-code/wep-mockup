import { type Capability, can } from '@shared/permissions'
import { useSession } from '@/queries/session.queries'

/** Current demo user, their company and a permission check bound to them. */
export function useCurrentUser() {
  const { data, isLoading } = useSession()
  const user = data?.user ?? null
  const company = data?.company
  return {
    user,
    company,
    isLoading,
    can: (capability: Capability) => can(user, capability, company),
  }
}
