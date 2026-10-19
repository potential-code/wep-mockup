import { useMemo } from 'react'
import type { Column } from '@/components/shared/DataTable'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { formatPercent } from '@/lib/format'
import { useMentorshipReport } from '@/queries/admin.queries'
import { ChartCard } from '../components/ChartCard'
import { BarsChart } from '../components/charts'
import { useReportingFilters } from '../components/filters'
import { QueryState, Stat } from '../components/QueryState'
import { ReportingShell } from '../components/ReportingShell'
import { ReportTable } from '../components/ReportTable'

type Row = NonNullable<ReturnType<typeof useMentorshipReport>['data']>[number]

export function MentorshipReportPage() {
  const { filters } = useReportingFilters()
  const q = useMentorshipReport(filters)
  const rows = q.data ?? []
  const sum = (k: 'open' | 'booked' | 'completed' | 'noShows' | 'pointsRedeemed' | 'followUps') =>
    rows.reduce((n, r) => n + r[k], 0)
  const slots = sum('open') + sum('booked')

  const columns = useMemo<Column<Row>[]>(
    () => [
      {
        key: 'n',
        header: 'Expert',
        sortValue: (r) => r.name,
        cell: (r) => (
          <span className="flex items-center gap-3">
            <UserAvatar name={r.name} src={r.avatar} className="size-8" />
            <span className="grid">
              <span className="font-medium text-navy">{r.name}</span>
              <span className="text-muted-foreground text-xs">
                {r.profile.published ? 'Published' : 'Not published'}
              </span>
            </span>
          </span>
        ),
        exportValue: (r) => r.name,
      },
      { key: 'open', header: 'Open slots', sortValue: (r) => r.open, cell: (r) => r.open },
      { key: 'booked', header: 'Booked slots', sortValue: (r) => r.booked, cell: (r) => r.booked },
      { key: 'done', header: 'Completed', sortValue: (r) => r.completed, cell: (r) => r.completed },
      { key: 'ns', header: 'No-shows', sortValue: (r) => r.noShows, cell: (r) => r.noShows },
      {
        key: 'pts',
        header: 'Points redeemed',
        sortValue: (r) => r.pointsRedeemed,
        cell: (r) => r.pointsRedeemed.toLocaleString('en-GB'),
        hideOnMobile: true,
      },
      {
        key: 'fu',
        header: 'Follow-ups shared',
        sortValue: (r) => r.followUps,
        cell: (r) => r.followUps,
        hideOnMobile: true,
      },
      {
        key: 'rt',
        header: 'Rating',
        sortValue: (r) => r.profile.rating,
        cell: (r) => r.profile.rating.toFixed(1),
        hideOnMobile: true,
      },
    ],
    [],
  )

  return (
    <ReportingShell
      title="Mentorship"
      description="Experts, available versus booked slots, completed sessions, no-shows, point redemption and follow-up."
    >
      <QueryState
        isLoading={q.isLoading}
        isError={q.isError}
        refetch={q.refetch}
        hasData={!!q.data}
      >
        <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
            <Stat label="Experts" value={rows.length} />
            <Stat label="Open slots" value={sum('open')} />
            <Stat
              label="Booked slots"
              value={sum('booked')}
              hint={`${formatPercent(slots ? (sum('booked') / slots) * 100 : 0)} utilisation`}
            />
            <Stat label="Completed sessions" value={sum('completed')} />
            <Stat
              label="No-shows"
              value={sum('noShows')}
              hint={`${formatPercent(sum('completed') + sum('noShows') ? (sum('noShows') / (sum('completed') + sum('noShows'))) * 100 : 0)} of held sessions`}
            />
            <Stat
              label="Points redeemed"
              value={sum('pointsRedeemed').toLocaleString('en-GB')}
              hint={`${sum('followUps')} follow-ups shared`}
            />
          </div>
          <ChartCard
            title="Available versus booked slots by expert"
            metric="slot_utilisation"
            table={{
              headers: ['Expert', 'Open', 'Booked', 'Completed', 'No-shows'],
              rows: rows.map((r) => [r.name, r.open, r.booked, r.completed, r.noShows]),
            }}
          >
            <BarsChart
              stacked
              data={rows.map((r) => ({
                name: r.name.split(' ').slice(-2).join(' '),
                open: r.open,
                booked: r.booked,
              }))}
              xKey="name"
              series={[
                { key: 'booked', label: 'Booked' },
                { key: 'open', label: 'Open' },
              ]}
            />
          </ChartCard>
          <ReportTable
            title="Mentorship"
            columns={columns}
            rows={rows}
            getRowId={(r) => r.profile.userId}
            searchText={(r) => r.name}
            searchLabel="Search experts"
          />
          <p className="text-muted-foreground text-xs">
            Company and department filters apply to who booked; expert slot supply is shown in full.
            Session counts exclude cancelled bookings.
          </p>
        </div>
      </QueryState>
    </ReportingShell>
  )
}
