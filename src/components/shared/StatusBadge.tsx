import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock,
  Info,
  Lock,
  type LucideIcon,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'locked' | 'coral'

const TONES: Record<Tone, { cls: string; icon: LucideIcon }> = {
  success: { cls: 'bg-success-soft text-success ring-success/20', icon: CheckCircle2 },
  warning: { cls: 'bg-warning-soft text-warning ring-warning/25', icon: Clock },
  danger: { cls: 'bg-danger-soft text-danger ring-danger/20', icon: AlertTriangle },
  info: { cls: 'bg-blue-50 text-blue-600 ring-blue/20', icon: Info },
  neutral: { cls: 'bg-muted text-muted-foreground ring-border', icon: CircleDashed },
  locked: { cls: 'bg-secondary text-navy ring-border', icon: Lock },
  coral: { cls: 'bg-coral-50 text-coral-700 ring-coral/30', icon: CheckCircle2 },
}

/** Status pill. Always icon + text, never colour alone. */
export function StatusBadge({
  tone = 'neutral',
  children,
  icon,
  className,
}: {
  tone?: Tone
  children: React.ReactNode
  icon?: LucideIcon | null
  className?: string
}) {
  const t = TONES[tone]
  const Icon = icon === null ? null : (icon ?? t.icon)
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 font-medium text-xs ring-1 ring-inset',
        t.cls,
        className,
      )}
    >
      {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
      {children}
    </span>
  )
}

/** Maps every workflow status in the app to a tone and label. */
const STATUS: Record<string, [Tone, string]> = {
  // applications
  draft: ['neutral', 'Draft'],
  submitted: ['info', 'Submitted'],
  under_review: ['warning', 'Under review'],
  information_requested: ['danger', 'Information requested'],
  resubmitted: ['info', 'Resubmitted'],
  approved: ['success', 'Approved'],
  not_approved: ['danger', 'Not approved'],
  applicant: ['neutral', 'Applicant'],
  suspended: ['danger', 'Suspended'],
  // reports
  not_started: ['neutral', 'Not started'],
  ready_for_approval: ['warning', 'Ready for approval'],
  changes_requested: ['danger', 'Changes requested'],
  accepted: ['success', 'Accepted'],
  // actions
  ceo_review: ['warning', 'CEO review'],
  in_progress: ['info', 'In progress'],
  evidence_submitted: ['coral', 'Evidence submitted'],
  complete: ['success', 'Complete'],
  needs_revision: ['danger', 'Needs revision'],
  // listings
  published: ['success', 'Published'],
  rejected: ['danger', 'Rejected'],
  withdrawn: ['neutral', 'Withdrawn'],
  archived: ['neutral', 'Archived'],
  scheduled: ['info', 'Scheduled'],
  // invitations
  pending: ['warning', 'Invitation pending'],
  expired: ['danger', 'Expired'],
  revoked: ['neutral', 'Revoked'],
  // clinics
  locked: ['locked', 'Locked'],
  eligible: ['success', 'Eligible'],
  registered: ['info', 'Registered'],
  waitlisted: ['warning', 'Waitlisted'],
  completed: ['neutral', 'Completed'],
  recording: ['coral', 'Recording available'],
  full: ['warning', 'Full'],
  attended: ['success', 'Attended'],
  no_show: ['danger', 'No show'],
  cancelled: ['neutral', 'Cancelled'],
  // bookings
  booked: ['info', 'Booked'],
  cancellation_review: ['warning', 'Cancellation in review'],
  // purchases
  unpaid: ['neutral', 'Not purchased'],
  checkout_cancelled: ['neutral', 'Checkout cancelled'],
  payment_failed: ['danger', 'Payment failed'],
  paid: ['info', 'Paid · exam available'],
  exam_in_progress: ['warning', 'Exam in progress'],
  retry_required: ['danger', 'Retry required'],
  passed: ['success', 'Passed'],
  certificate_issued: ['success', 'Certificate issued'],
  refunded: ['neutral', 'Refunded'],
  // learning
  available: ['info', 'Available'],
}

export function WorkflowStatus({ status, className }: { status: string; className?: string }) {
  const [tone, label] = STATUS[status] ?? ['neutral', status.replace(/_/g, ' ')]
  return (
    <StatusBadge
      tone={tone}
      className={className}
      icon={
        tone === 'locked' ? Lock : tone === 'danger' && status.includes('not') ? XCircle : undefined
      }
    >
      {label}
    </StatusBadge>
  )
}
