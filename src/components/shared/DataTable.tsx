import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { type ReactNode, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  /** Enables sorting on this column. */
  sortValue?: (row: T) => string | number | null | undefined
  /** Plain value for CSV export (defaults to sortValue). */
  exportValue?: (row: T) => string | number | null | undefined
  className?: string
  /** Hidden in the mobile card layout. */
  hideOnMobile?: boolean
  align?: 'start' | 'end'
}

/**
 * Client-side table with sorting and pagination. Below `md` it becomes a stacked card list so
 * wide tables stay usable on phones. Optional column chooser and CSV export.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  pageSize = 10,
  isLoading,
  empty,
  onRowClick,
  onExport,
  caption,
  initialSort,
}: {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
  pageSize?: number
  isLoading?: boolean
  empty?: ReactNode
  onRowClick?: (row: T) => void
  onExport?: (visible: Column<T>[], sorted: T[]) => void
  caption?: string
  initialSort?: { key: string; dir: 'asc' | 'desc' }
}) {
  const [sort, setSort] = useState(initialSort)
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col?.sortValue) return rows
    const v = col.sortValue
    return [...rows].sort((a, b) => {
      const x = v(a) ?? ''
      const y = v(b) ?? ''
      const r =
        typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))
      return sort.dir === 'asc' ? r : -r
    })
  }, [rows, sort, columns])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const current = Math.min(page, pageCount - 1)
  const visible = sorted.slice(current * pageSize, current * pageSize + pageSize)

  const toggleSort = (key: string) =>
    setSort((s) =>
      s?.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : undefined) : { key, dir: 'asc' },
    )

  const primary = columns[0]
  const rest = columns.slice(1).filter((c) => !c.hideOnMobile)

  return (
    <div className="grid gap-3">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border bg-card shadow-card md:block">
        <Table>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <TableHeader>
            <TableRow className="bg-surface/60 hover:bg-surface/60">
              {columns.map((c) => (
                <TableHead
                  key={c.key}
                  className={cn(
                    'h-11 font-semibold text-navy text-xs uppercase tracking-wide',
                    c.align === 'end' && 'text-end',
                    c.className,
                  )}
                  aria-sort={
                    sort?.key === c.key
                      ? sort.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {c.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1 hover:text-blue"
                    >
                      {c.header}
                      {sort?.key === c.key ? (
                        sort.dir === 'asc' ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
                <TableRow key={i}>
                  <TableCell colSpan={columns.length}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : visible.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  {empty ?? 'No records match these filters.'}
                </TableCell>
              </TableRow>
            ) : (
              visible.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  className={cn(onRowClick && 'cursor-pointer')}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
                >
                  {columns.map((c) => (
                    <TableCell
                      key={c.key}
                      className={cn('py-3', c.align === 'end' && 'text-end', c.className)}
                    >
                      {c.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <ul className="grid gap-2 md:hidden">
        {isLoading ? (
          Array.from({ length: 4 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
            <li key={i}>
              <Skeleton className="h-24 w-full rounded-2xl" />
            </li>
          ))
        ) : visible.length === 0 ? (
          <li className="rounded-2xl border bg-card p-6 text-center text-muted-foreground text-sm">
            {empty ?? 'No records match these filters.'}
          </li>
        ) : (
          visible.map((row) => (
            <li key={getRowId(row)}>
              <div className="relative grid gap-2 rounded-2xl border bg-card p-4 shadow-card">
                {onRowClick ? (
                  <button
                    type="button"
                    className="absolute inset-0 rounded-2xl"
                    onClick={() => onRowClick(row)}
                  >
                    <span className="sr-only">Open record</span>
                  </button>
                ) : null}
                {primary ? <div className="font-medium text-navy">{primary.cell(row)}</div> : null}
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  {rest.map((c) => (
                    <div key={c.key} className="min-w-0">
                      <dt className="text-muted-foreground text-xs">{c.header}</dt>
                      <dd className="min-w-0 truncate">{c.cell(row)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          ))
        )}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-muted-foreground" aria-live="polite">
          {sorted.length} {sorted.length === 1 ? 'record' : 'records'}
        </p>
        <div className="flex items-center gap-2">
          {onExport ? (
            <Button variant="outline" size="sm" onClick={() => onExport(columns, sorted)}>
              <Download aria-hidden /> Export CSV
            </Button>
          ) : null}
          {pageCount > 1 ? (
            <>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage(current - 1)}
                disabled={current === 0}
                aria-label="Previous page"
              >
                <ChevronLeft />
              </Button>
              <span className="tabular-nums">
                {current + 1} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage(current + 1)}
                disabled={current >= pageCount - 1}
                aria-label="Next page"
              >
                <ChevronRight />
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** Build CSV rows from table columns (uses exportValue or sortValue). */
export function columnsToCsvRows<T>(cols: Column<T>[], rows: T[]) {
  const usable = cols.filter((c) => c.exportValue || c.sortValue)
  return {
    headers: usable.map((c) => c.header),
    rows: rows.map((r) => usable.map((c) => (c.exportValue ?? c.sortValue)?.(r) ?? '')),
  }
}
