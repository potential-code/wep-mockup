import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { FilterBar } from '@/components/shared/Cards'
import { type Column, columnsToCsvRows, DataTable } from '@/components/shared/DataTable'
import { ErrorState } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { downloadText, formatDateTime } from '@/lib/format'
import { useAudit } from '@/queries/admin.queries'
import { toCsvText } from '../components/common'

type Entry = NonNullable<ReturnType<typeof useAudit>['data']>[number]

const CATEGORIES: { id: string; label: string; match: RegExp }[] = [
  {
    id: 'approval',
    label: 'Approvals and decisions',
    match: /approv|reject|declin|changes|decision|publish|archiv|accept/i,
  },
  {
    id: 'admin',
    label: 'Admin changes',
    match:
      /suspend|restore|reinstat|invit|revok|setting|course|resource|event|template|reporting year/i,
  },
  { id: 'points', label: 'Points adjustments', match: /points/i },
  { id: 'reports', label: 'Report submissions', match: /report/i },
]
const categoriesOf = (a: Entry) => CATEGORIES.filter((c) => c.match.test(a.action)).map((c) => c.id)

export function AuditPage() {
  const { data, isLoading, error, refetch } = useAudit()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')

  const rows = useMemo(
    () =>
      (data ?? []).filter(
        (a) =>
          (cat === 'all' || categoriesOf(a).includes(cat)) &&
          (!q.trim() ||
            `${a.action} ${a.target} ${a.detail ?? ''} ${a.actorName}`
              .toLowerCase()
              .includes(q.toLowerCase())),
      ),
    [data, q, cat],
  )

  const columns: Column<Entry>[] = [
    {
      key: 'at',
      header: 'When',
      sortValue: (a) => a.at,
      exportValue: (a) => a.at,
      cell: (a) => formatDateTime(a.at),
    },
    { key: 'actor', header: 'Actor', sortValue: (a) => a.actorName, cell: (a) => a.actorName },
    {
      key: 'action',
      header: 'Action',
      sortValue: (a) => a.action,
      cell: (a) => (
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="font-medium text-navy">{a.action}</span>
          {categoriesOf(a).includes('points') ? (
            <StatusBadge tone="gold" icon={null}>
              Points
            </StatusBadge>
          ) : null}
        </span>
      ),
    },
    { key: 'target', header: 'Target', sortValue: (a) => a.target, cell: (a) => a.target },
    {
      key: 'detail',
      header: 'Detail',
      exportValue: (a) => a.detail ?? '',
      cell: (a) => a.detail ?? '—',
      hideOnMobile: true,
    },
  ]

  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  return (
    <div>
      <PageHeader
        title="Activity and Audit"
        description="A record of administrative changes, approvals, points adjustments and decisions."
      />
      <FilterBar count={rows.length}>
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search
            className="-translate-y-1/2 absolute start-3 top-1/2 size-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the log"
            aria-label="Search audit log"
            className="bg-card ps-9"
          />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger aria-label="Filter by type" className="w-full bg-card sm:w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activity</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable
        caption="Audit log"
        columns={columns}
        rows={rows}
        getRowId={(a) => a.id}
        isLoading={isLoading}
        initialSort={{ key: 'at', dir: 'desc' }}
        onExport={(cols, sorted) => {
          const t = columnsToCsvRows(cols, sorted)
          downloadText('audit-log.csv', toCsvText(t.headers, t.rows), 'text/csv')
        }}
      />
    </div>
  )
}
