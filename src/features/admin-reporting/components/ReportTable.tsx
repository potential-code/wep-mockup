import { Columns3, Search } from 'lucide-react'
import { type ReactNode, useMemo, useState } from 'react'
import { type Column, columnsToCsvRows, DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useCsvExport } from './useExport'

const MAX_DEFAULT_COLUMNS = 5

/**
 * Reporting table: search, sortable columns, filter slot, column chooser, pagination and a CSV
 * export that carries the current scope, period and timestamp.
 */
export function ReportTable<T>({
  title,
  columns,
  rows,
  getRowId,
  searchText,
  searchLabel = 'Search',
  filters,
  isLoading,
  onRowClick,
  pageSize = 5,
  defaultHidden,
  query: controlled,
  onQueryChange,
  empty,
  initialSort,
}: {
  title: string
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
  searchText?: (row: T) => string
  searchLabel?: string
  filters?: ReactNode
  isLoading?: boolean
  onRowClick?: (row: T) => void
  pageSize?: number
  defaultHidden?: string[]
  query?: string
  onQueryChange?: (q: string) => void
  empty?: ReactNode
  initialSort?: { key: string; dir: 'asc' | 'desc' }
}) {
  const exportCsv = useCsvExport()
  const [local, setLocal] = useState('')
  // Keep tables scannable in a demo: first five columns (plus any actions column) by default;
  // the rest stay one click away under Columns.
  const [hidden, setHidden] = useState<string[]>(
    () =>
      defaultHidden ??
      columns.filter((c, i) => i >= MAX_DEFAULT_COLUMNS && c.key !== 'actions').map((c) => c.key),
  )
  const query = controlled ?? local
  const setQuery = onQueryChange ?? setLocal

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || !searchText) return rows
    return rows.filter((r) => searchText(r).toLowerCase().includes(q))
  }, [rows, query, searchText])

  const visible = columns.filter((c, i) => i === 0 || !hidden.includes(c.key))

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {searchText ? (
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`${searchLabel}…`}
              aria-label={searchLabel}
              className="h-10 bg-card ps-9"
            />
          </div>
        ) : null}
        {filters}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ms-auto h-10">
              <Columns3 aria-hidden /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Show columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns.map((c, i) => (
              <DropdownMenuCheckboxItem
                key={c.key}
                checked={i === 0 || !hidden.includes(c.key)}
                disabled={i === 0}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={(on) =>
                  setHidden((h) => (on ? h.filter((k) => k !== c.key) : [...h, c.key]))
                }
              >
                {c.header}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DataTable
        columns={visible}
        rows={filtered}
        getRowId={getRowId}
        isLoading={isLoading}
        onRowClick={onRowClick}
        pageSize={pageSize}
        caption={title}
        empty={empty}
        initialSort={initialSort}
        onExport={(cols, sorted) => {
          const { headers, rows: csvRows } = columnsToCsvRows(cols, sorted)
          exportCsv(title, headers, csvRows)
        }}
      />
    </div>
  )
}
