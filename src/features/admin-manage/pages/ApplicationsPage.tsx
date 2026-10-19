import type { Application } from '@shared/types'
import { useNavigate } from '@tanstack/react-router'
import { AlertTriangle, Search, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { FilterBar } from '@/components/shared/Cards'
import { type Column, DataTable } from '@/components/shared/DataTable'
import { ErrorState } from '@/components/shared/States'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useApplications } from '@/queries/applications.queries'
import { InviteCompanyDialog } from '../components/applications/InviteCompanyDialog'

const TABS: { id: string; label: string; match: (a: Application) => boolean }[] = [
  { id: 'all', label: 'All', match: () => true },
  {
    id: 'review',
    label: 'To review',
    match: (a) => a.status === 'submitted' || a.status === 'under_review',
  },
  {
    id: 'info',
    label: 'Information requested',
    match: (a) => a.status === 'information_requested',
  },
  { id: 'resubmitted', label: 'Resubmitted', match: (a) => a.status === 'resubmitted' },
  { id: 'approved', label: 'Approved', match: (a) => a.status === 'approved' },
  { id: 'rejected', label: 'Not approved', match: (a) => a.status === 'not_approved' },
]

export function ApplicationsPage() {
  const { data, isLoading, isError, refetch } = useApplications()
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)

  const apps = useMemo(() => (data ?? []).filter((a) => a.status !== 'draft'), [data])
  const counts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.id, apps.filter(t.match).length])),
    [apps],
  )
  const rows = useMemo(() => {
    const t = TABS.find((x) => x.id === tab) ?? TABS[0]
    const s = q.trim().toLowerCase()
    return apps.filter(
      (a) =>
        t?.match(a) &&
        (!s ||
          `${a.data.company.name} ${a.reference} ${a.data.company.country} ${a.data.company.sector}`
            .toLowerCase()
            .includes(s)),
    )
  }, [apps, tab, q])

  const columns: Column<Application>[] = [
    {
      key: 'company',
      header: 'Company',
      sortValue: (a) => a.data.company.name,
      cell: (a) => (
        <span className="flex flex-wrap items-center gap-2">
          <span className="grid">
            <span className="font-medium text-navy">{a.data.company.name}</span>
            <span className="text-muted-foreground text-xs">{a.data.company.sector}</span>
          </span>
          {a.duplicateOfCompanyId ? (
            <StatusBadge tone="warning" icon={AlertTriangle}>
              Possible duplicate
            </StatusBadge>
          ) : null}
        </span>
      ),
    },
    { key: 'ref', header: 'Reference', sortValue: (a) => a.reference, cell: (a) => a.reference },
    {
      key: 'country',
      header: 'Country',
      sortValue: (a) => a.data.company.country,
      cell: (a) => a.data.company.country,
    },
    {
      key: 'submitted',
      header: 'Submitted',
      sortValue: (a) => a.submittedAt,
      cell: (a) => formatDate(a.submittedAt),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (a) => a.status,
      cell: (a) => <WorkflowStatus status={a.status} />,
    },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Manage"
        title="Applications and Approvals"
        description="Review companies applying to join the WEPs, request missing information and activate approved workspaces."
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus aria-hidden /> Invite a company
          </Button>
        }
      />
      {isError ? (
        <ErrorState message="We could not load applications." onRetry={() => refetch()} />
      ) : (
        <>
          <div role="tablist" aria-label="Filter by status" className="mb-4 flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'min-h-9 rounded-full border px-3.5 text-sm transition-colors',
                  tab === t.id
                    ? 'border-navy bg-navy font-medium text-white'
                    : 'bg-card hover:border-blue/50',
                )}
              >
                {t.label}{' '}
                <span className={tab === t.id ? 'text-white/70' : 'text-muted-foreground'}>
                  {counts[t.id] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <FilterBar count={rows.length}>
            <div className="relative w-full max-w-sm">
              <Search
                className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                aria-label="Search applications"
                placeholder="Search company, reference, country…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-10 ps-9"
              />
            </div>
          </FilterBar>
          <DataTable
            caption="Applications"
            columns={columns}
            rows={rows}
            isLoading={isLoading}
            getRowId={(a) => a.id}
            initialSort={{ key: 'submitted', dir: 'desc' }}
            onRowClick={(a) =>
              navigate({
                to: '/admin/manage/applications/$applicationId',
                params: { applicationId: a.id },
              })
            }
            empty="No applications match these filters."
          />
        </>
      )}
      <InviteCompanyDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}
