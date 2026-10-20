import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { Column } from '@/components/shared/DataTable'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { relativeTime } from '@/lib/format'
import { useCommunityReport } from '@/queries/admin.queries'
import { ChartCard } from '../components/ChartCard'
import { BarsChart } from '../components/charts'
import { useReportingFilters } from '../components/filters'
import { MetricInfo } from '../components/MetricInfo'
import { QueryState, Stat } from '../components/QueryState'
import { ReportingShell } from '../components/ReportingShell'
import { ReportTable } from '../components/ReportTable'

type Data = NonNullable<ReturnType<typeof useCommunityReport>['data']>
type ListingRow = Data['listings'][number]
type ThreadRow = Data['unansweredRows'][number]

export function CommunityReportPage() {
  const { filters } = useReportingFilters()
  const q = useCommunityReport(filters)
  const d = q.data
  const [view, setView] = useState('listings')

  const listingCols = useMemo<Column<ListingRow>[]>(
    () => [
      {
        key: 't',
        header: 'Listing',
        sortValue: (r) => r.listing.title,
        cell: (r) => <span className="font-medium text-navy">{r.listing.title}</span>,
      },
      { key: 'c', header: 'Provider', sortValue: (r) => r.companyName, cell: (r) => r.companyName },
      {
        key: 's',
        header: 'Approval status',
        sortValue: (r) => r.listing.status,
        cell: (r) => <WorkflowStatus status={r.listing.status} />,
      },
      {
        key: 'v',
        header: 'Views',
        sortValue: (r) => r.listing.views,
        cell: (r) => r.listing.views.toLocaleString('en-GB'),
        align: 'end',
      },
      {
        key: 'o',
        header: 'Outbound purchase clicks',
        sortValue: (r) => r.listing.outboundClicks,
        cell: (r) => r.listing.outboundClicks.toLocaleString('en-GB'),
        align: 'end',
      },
    ],
    [],
  )
  const threadCols = useMemo<Column<ThreadRow>[]>(
    () => [
      {
        key: 't',
        header: 'Thread',
        sortValue: (r) => r.thread.title,
        cell: (r) => <span className="font-medium text-navy">{r.thread.title}</span>,
      },
      {
        key: 'ch',
        header: 'Channel',
        sortValue: (r) => r.thread.channel,
        cell: (r) => r.thread.channel,
      },
      {
        key: 'a',
        header: 'Author',
        sortValue: (r) => r.author,
        cell: (r) => r.author,
        hideOnMobile: true,
      },
      {
        key: 'w',
        header: 'Posted',
        sortValue: (r) => r.thread.createdAt,
        exportValue: (r) => r.thread.createdAt.slice(0, 10),
        cell: (r) => relativeTime(r.thread.createdAt),
      },
    ],
    [],
  )

  return (
    <ReportingShell
      title="Community and marketplace"
      description="Participation, unanswered questions, listing approvals and outbound clicks."
      actions={
        <Link
          to="/admin/manage/community"
          className="font-medium text-blue text-sm hover:underline"
        >
          Moderate in Platform Management
        </Link>
      }
    >
      <QueryState isLoading={q.isLoading} isError={q.isError} refetch={q.refetch} hasData={!!d}>
        {d ? (
          <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Threads" value={d.threads} hint={`${d.participants} participants`} />
              <Stat label="Replies" value={d.replies} />
              <Stat label="Unanswered" value={d.unanswered} hint={`${d.flagged} flagged`} />
              <Stat
                label="Listings"
                value={d.listings.length}
                hint={`${d.listings.filter((l) => l.listing.status === 'published').length} published`}
              />
            </div>
            <div className="grid min-w-0 *:min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
              <ChartCard
                title="Participation by channel"
                description="Threads and replies."
                metric="participation"
                table={{
                  headers: ['Channel', 'Threads', 'Replies'],
                  rows: d.byChannel.map((r) => [r.channel, r.threads, r.replies]),
                }}
              >
                <BarsChart
                  horizontal
                  labelWidth={140}
                  data={d.byChannel}
                  xKey="channel"
                  series={[
                    { key: 'threads', label: 'Threads' },
                    { key: 'replies', label: 'Replies' },
                  ]}
                />
              </ChartCard>
              <ChartCard
                title="Listing approvals"
                description="Listings by review status."
                metric="listing_engagement"
                table={{
                  headers: ['Status', 'Listings'],
                  rows: d.approvals.map((r) => [r.status.replace(/_/g, ' '), r.count]),
                }}
              >
                <BarsChart
                  data={d.approvals.map((r) => ({
                    status: r.status.replace(/_/g, ' '),
                    count: r.count,
                  }))}
                  xKey="status"
                  series={[{ key: 'count', label: 'Listings' }]}
                />
              </ChartCard>
            </div>
            <Tabs value={view} onValueChange={setView}>
              <TabsList aria-label="Community records">
                <TabsTrigger value="listings">Listings</TabsTrigger>
                <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
                <TabsTrigger value="flagged">Flagged</TabsTrigger>
              </TabsList>
            </Tabs>
            {view === 'listings' ? (
              <section className="grid gap-3">
                <div className="flex items-center gap-1">
                  <h2 className="font-heading font-medium text-lg text-navy">
                    Views and outbound clicks
                  </h2>
                  <MetricInfo metric="listing_engagement" />
                  <span className="text-muted-foreground text-xs">
                    Clicks only; no sales or revenue are visible.
                  </span>
                </div>
                <ReportTable
                  title="Marketplace listings"
                  columns={listingCols}
                  rows={d.listings}
                  getRowId={(r) => r.listing.id}
                  searchText={(r) => `${r.listing.title} ${r.companyName}`}
                  searchLabel="Search listings"
                />
              </section>
            ) : null}
            {view === 'unanswered' ? (
              <ReportTable
                title="Unanswered questions"
                columns={threadCols}
                rows={d.unansweredRows}
                getRowId={(r) => r.thread.id}
                searchText={(r) => r.thread.title}
                searchLabel="Search threads"
                empty="Every question has a reply."
              />
            ) : null}
            {view === 'flagged' ? (
              <ReportTable
                title="Flagged items"
                columns={threadCols}
                rows={d.flaggedRows}
                getRowId={(r) => r.thread.id}
                empty="Nothing is flagged."
              />
            ) : null}
          </div>
        ) : null}
      </QueryState>
    </ReportingShell>
  )
}
