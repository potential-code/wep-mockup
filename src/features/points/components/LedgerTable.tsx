import type { PointsAction } from '@shared/types'
import { Link } from '@tanstack/react-router'
import {
  ArrowUpRight,
  BookOpenCheck,
  CalendarCheck,
  ClipboardCheck,
  Handshake,
  type LucideIcon,
  Medal,
  MessageSquareHeart,
  MessageSquareText,
  RotateCcw,
  SlidersHorizontal,
  UserRoundCheck,
} from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/States'
import { formatDate } from '@/lib/format'
import type { LedgerRow } from '@/queries/learning.queries'

/** Label and icon per ledger action, shared with the rules table. */
export const ACTION_META: Record<PointsAction, { label: string; icon: LucideIcon }> = {
  profile_complete: { label: 'Profile', icon: UserRoundCheck },
  lesson_complete: { label: 'Lesson', icon: BookOpenCheck },
  quiz_pass: { label: 'Quiz', icon: Medal },
  clinic_attend: { label: 'Clinic', icon: CalendarCheck },
  feedback: { label: 'Feedback', icon: MessageSquareText },
  community_contribution: { label: 'Community', icon: MessageSquareHeart },
  action_contribution: { label: 'Action plan', icon: ClipboardCheck },
  mentor_redeem: { label: 'Mentoring', icon: Handshake },
  mentor_refund: { label: 'Refund', icon: RotateCcw },
  adjustment: { label: 'Adjustment', icon: SlidersHorizontal },
}

/** Round icon chip: coral for qualifying awards, blue for other awards, muted for spends. */
export function ActionIcon({
  action,
  amount,
  qualifying,
}: {
  action: PointsAction
  amount: number
  qualifying?: boolean
}) {
  const Icon = ACTION_META[action]?.icon ?? SlidersHorizontal
  return (
    <span
      className={`grid size-9 shrink-0 place-items-center rounded-full ${
        amount < 0
          ? 'bg-secondary text-muted-foreground'
          : qualifying
            ? 'bg-coral-50 text-coral-700 ring-1 ring-coral/30'
            : 'bg-blue-50 text-blue ring-1 ring-blue/15'
      }`}
    >
      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
    </span>
  )
}

export function LedgerTable({ rows, isLoading }: { rows: LedgerRow[]; isLoading?: boolean }) {
  return (
    <DataTable<LedgerRow>
      caption="Points ledger"
      rows={rows}
      isLoading={isLoading}
      getRowId={(r) => r.id}
      pageSize={5}
      empty={
        <EmptyState
          title="No points yet"
          description="Complete your first lesson to start earning."
        />
      }
      columns={[
        {
          key: 'action',
          header: 'Action',
          sortValue: (r) => r.sourceLabel,
          cell: (r) => (
            <div className="flex items-center gap-3">
              <ActionIcon action={r.action} amount={r.amount} qualifying={r.qualifying} />
              <div className="grid min-w-0">
                <span className="font-medium text-navy">{r.sourceLabel}</span>
                <span className="text-muted-foreground text-xs">
                  {ACTION_META[r.action]?.label ?? r.action}
                  {r.qualifying ? ' · qualifying' : ''}
                </span>
              </div>
            </div>
          ),
        },
        {
          key: 'date',
          header: 'Date',
          sortValue: (r) => r.createdAt,
          cell: (r) => formatDate(r.createdAt),
        },
        {
          key: 'amount',
          header: 'Points',
          align: 'end',
          sortValue: (r) => r.amount,
          cell: (r) => (
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 font-semibold tabular-nums ${r.amount < 0 ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success'}`}
            >
              {r.amount > 0 ? '+' : '−'}
              {Math.abs(r.amount)}
            </span>
          ),
        },
        {
          key: 'source',
          header: 'Source',
          hideOnMobile: true,
          cell: (r) =>
            r.sourceLink ? (
              <Link
                to={r.sourceLink}
                className="inline-flex items-center gap-1 text-blue hover:underline"
              >
                Open <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        {
          key: 'balance',
          header: 'Balance after',
          align: 'end',
          cell: (r) => <span className="tabular-nums">{r.balanceAfter}</span>,
        },
      ]}
      initialSort={{ key: 'date', dir: 'desc' }}
    />
  )
}
