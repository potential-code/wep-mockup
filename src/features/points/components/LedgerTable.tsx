import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/States'
import { formatDate } from '@/lib/format'
import type { LedgerRow } from '@/queries/learning.queries'

const ACTION_LABEL: Record<string, string> = {
  profile_complete: 'Profile',
  lesson_complete: 'Lesson',
  quiz_pass: 'Quiz',
  clinic_attend: 'Clinic',
  feedback: 'Feedback',
  community_contribution: 'Community',
  action_contribution: 'Action plan',
  mentor_redeem: 'Mentoring',
  mentor_refund: 'Refund',
  adjustment: 'Adjustment',
}

export function LedgerTable({ rows, isLoading }: { rows: LedgerRow[]; isLoading?: boolean }) {
  return (
    <DataTable<LedgerRow>
      caption="Points ledger"
      rows={rows}
      isLoading={isLoading}
      getRowId={(r) => r.id}
      pageSize={8}
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
            <div className="grid">
              <span className="font-medium text-navy">{r.sourceLabel}</span>
              <span className="text-muted-foreground text-xs">
                {ACTION_LABEL[r.action] ?? r.action}
                {r.qualifying ? ' · qualifying' : ''}
              </span>
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
              className={`font-semibold tabular-nums ${r.amount < 0 ? 'text-danger' : 'text-success'}`}
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
