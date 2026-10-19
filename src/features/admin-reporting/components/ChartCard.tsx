import { BarChart3, Download, Table2 } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { CardHeaderBand } from '@/components/shared/Cards'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MetricInfo } from './MetricInfo'
import type { MetricKey } from './metric-definitions'
import { useCsvExport } from './useExport'

export interface TableAlt {
  headers: string[]
  rows: (string | number | null | undefined)[][]
}

/** Chart wrapper: title, definition popover, layer badge and a "View as table" alternative. */
export function ChartCard({
  title,
  description,
  metric,
  table,
  children,
  className,
  actions,
  footer,
}: {
  title: string
  description?: ReactNode
  metric?: MetricKey
  table: TableAlt
  children: ReactNode
  className?: string
  actions?: ReactNode
  footer?: ReactNode
}) {
  const [asTable, setAsTable] = useState(false)
  const exportCsv = useCsvExport()
  return (
    <section
      className={cn('flex min-w-0 flex-col rounded-2xl border bg-card shadow-card', className)}
    >
      <CardHeaderBand className="gap-2 px-5">
        <div className="grid min-w-0 gap-1">
          <div className="flex items-center gap-1">
            <h3 className="font-heading font-semibold text-navy">{title}</h3>
            {metric ? <MetricInfo metric={metric} /> : null}
          </div>
          {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
        </div>
        <div className="flex items-center gap-1">
          {actions}
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={asTable}
            onClick={() => setAsTable((v) => !v)}
          >
            {asTable ? <BarChart3 aria-hidden /> : <Table2 aria-hidden />}
            {asTable ? 'View as chart' : 'View as table'}
          </Button>
        </div>
      </CardHeaderBand>
      <div className="min-w-0 flex-1 p-5">
        {asTable ? (
          <div className="grid gap-2">
            <div className="max-h-80 overflow-auto rounded-xl border">
              <table className="w-full text-sm">
                <caption className="sr-only">{title} as a table</caption>
                <thead className="sticky top-0 bg-surface text-left">
                  <tr>
                    {table.headers.map((h) => (
                      <th key={h} scope="col" className="px-3 py-2 font-semibold text-navy text-xs">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((r) => (
                    <tr key={r.join('|')} className="border-t">
                      {r.map((c, i) => (
                        <td
                          // biome-ignore lint/suspicious/noArrayIndexKey: positional cells
                          key={i}
                          className={cn('px-3 py-2', i > 0 && 'tabular-nums')}
                        >
                          {c ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => exportCsv(title, table.headers, table.rows)}
            >
              <Download aria-hidden /> Export CSV
            </Button>
          </div>
        ) : (
          <div role="img" aria-label={`${title}. Use View as table for the data.`}>
            {children}
          </div>
        )}
      </div>
      {footer ? (
        <div className="border-t px-5 py-3 text-muted-foreground text-xs">{footer}</div>
      ) : null}
    </section>
  )
}
