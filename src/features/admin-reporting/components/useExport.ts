import { toast } from 'sonner'
import { downloadText } from '@/lib/format'
import { toCsv } from '@/queries/admin.queries'
import { describeScope, useReportingFilters } from './filters'
import { useCompanyOptions } from './options'

/** CSV export labelled with period, scope and timestamp, always using the current filters. */
export function useCsvExport() {
  const { filters, suppress } = useReportingFilters()
  const { companyName } = useCompanyOptions()
  return (title: string, headers: string[], rows: (string | number | null | undefined)[][]) => {
    const scope = describeScope(filters, { company: companyName(filters.companyId) }, suppress)
    const csv = toCsv(`${title} — Reporting year ${filters.year}`, scope, headers, rows)
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    downloadText(`weps-${slug}-${filters.year}.csv`, csv, 'text/csv')
    toast.success(`Exported ${rows.length} rows`, {
      description: `${title}, ${scope.split(';')[0]}. File includes scope and export time.`,
    })
  }
}
