import { WorkflowStatus } from '@/components/shared/StatusBadge'
import type { ClinicStatus } from '@/queries/clinics.queries'

/** Locked, Eligible, Registered, Waitlisted, Completed, Recording available or Full. */
export function ClinicStatusBadge({
  status,
  className,
}: {
  status: ClinicStatus
  className?: string
}) {
  return <WorkflowStatus status={status} className={className} />
}
