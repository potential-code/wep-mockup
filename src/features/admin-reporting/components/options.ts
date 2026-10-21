import { useMemo } from 'react'
import { useCompaniesTable } from '@/queries/admin.queries'
import { useGlobalNetwork } from '@/queries/network.queries'
import { useReportingFilters } from './filters'

/**
 * Filter option lists. Countries cover the whole signatory network; the company picker lists
 * the portal's own companies only.
 */
export function useCompanyOptions() {
  const { filters } = useReportingFilters()
  const q = useCompaniesTable({})
  const network = useGlobalNetwork()
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
      countries: uniq([
        ...rows.map((r) => r.company.country),
        ...(network.data?.countries.map((c) => c.name) ?? []),
      ]),
      sectors: uniq(rows.map((r) => r.company.sector)),
      companies,
      companyName: (id?: string) => rows.find((r) => r.company.id === id)?.company.name,
    }
  }, [q.data, q.isLoading, network.data, filters.country, filters.sector])
}
