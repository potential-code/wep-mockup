import { useMemo } from 'react'
import { useCompaniesTable } from '@/queries/admin.queries'
import { useReportingFilters } from './filters'

/** Filter option lists derived from the full (unfiltered) company set. */
export function useCompanyOptions() {
  const { filters } = useReportingFilters()
  const q = useCompaniesTable({})
  return useMemo(() => {
    const rows = q.data ?? []
    const uniq = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b))
    const companies = rows
      .map((r) => r.company)
      .filter(
        (c) =>
          (!filters.country || c.country === filters.country) &&
          (!filters.sector || c.sector === filters.sector),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
    return {
      isLoading: q.isLoading,
      countries: uniq(rows.map((r) => r.company.country)),
      sectors: uniq(rows.map((r) => r.company.sector)),
      companies,
      companyName: (id?: string) => rows.find((r) => r.company.id === id)?.company.name,
    }
  }, [q.data, q.isLoading, filters.country, filters.sector])
}
