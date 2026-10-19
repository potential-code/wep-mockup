import { Link } from '@tanstack/react-router'
import { AlertTriangle, CheckCircle2, Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { CompanyLogo } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAnnualReportsMatrix } from '@/queries/admin.queries'
import { searchProp, useReportingFilters } from '../components/filters'
import { MetricInfo } from '../components/MetricInfo'
import { QueryState } from '../components/QueryState'
import { ReportingShell } from '../components/ReportingShell'
import { useCsvExport } from '../components/useExport'

export function AnnualReportsMatrixPage() {
  const { filters, filterSearch } = useReportingFilters()
  const q = useAnnualReportsMatrix(filters)
  const exportCsv = useCsvExport()
  const [query, setQuery] = useState('')
  const search = searchProp(filterSearch)
  const d = q.data
  const rows = useMemo(
    () => (d?.rows ?? []).filter((r) => r.company.name.toLowerCase().includes(query.toLowerCase())),
    [d, query],
  )

  return (
    <ReportingShell
      title="Annual reports"
      description="Company by year matrix with review status, overdue submissions, versions and comparison-ready indicators."
      actions={
        <Button
          variant="outline"
          disabled={!d}
          onClick={() =>
            d &&
            exportCsv(
              'Annual reports matrix',
              [
                'Company',
                ...d.years.map((y) => `${y} status`),
                ...d.years.map((y) => `${y} versions`),
                'Comparison-ready',
              ],
              rows.map((r) => [
                r.company.name,
                ...r.cells.map((c) => c.status),
                ...r.cells.map((c) => c.versions),
                r.comparisonReady ? 'Yes' : 'No',
              ]),
            )
          }
        >
          <Download aria-hidden /> Export CSV
        </Button>
      }
    >
      <QueryState isLoading={q.isLoading} isError={q.isError} refetch={q.refetch} hasData={!!d}>
        {d ? (
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search companies…"
                aria-label="Search companies"
                className="h-10 max-w-xs bg-card"
              />
              <MetricInfo metric="reporting_completion" label="Reporting completion definition" />
            </div>
            <div className="overflow-x-auto rounded-2xl border bg-card shadow-card">
              <table className="w-full min-w-[720px] text-sm">
                <caption className="sr-only">Annual report status by company and year</caption>
                <thead className="bg-surface/60 text-left">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 font-semibold text-navy text-xs uppercase tracking-wide"
                    >
                      Company
                    </th>
                    {d.years.map((y) => (
                      <th
                        key={y}
                        scope="col"
                        className={cn(
                          'px-3 py-3 font-semibold text-navy text-xs uppercase tracking-wide',
                          y === filters.year && 'bg-blue-50',
                        )}
                      >
                        {y}
                        {y === filters.year ? ' (selected)' : ''}
                      </th>
                    ))}
                    <th
                      scope="col"
                      className="px-3 py-3 font-semibold text-navy text-xs uppercase tracking-wide"
                    >
                      Comparison
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="h-28 text-center text-muted-foreground">
                        No companies match these filters.
                      </td>
                    </tr>
                  ) : null}
                  {rows.map((r) => (
                    <tr key={r.company.id} className="border-t">
                      <th scope="row" className="px-4 py-3 text-left font-normal">
                        <Link
                          to="/admin/reporting/companies/$companyId"
                          params={{ companyId: r.company.id }}
                          search={search}
                          className="flex items-center gap-3 hover:underline"
                        >
                          <CompanyLogo
                            name={r.company.name}
                            src={r.company.logo}
                            className="size-8"
                          />
                          <span className="font-medium text-navy">{r.company.name}</span>
                        </Link>
                      </th>
                      {r.cells.map((c) => (
                        <td
                          key={c.year}
                          className={cn(
                            'px-3 py-3 align-top',
                            c.year === filters.year && 'bg-blue-50/50',
                          )}
                        >
                          {c.reportId ? (
                            <Link
                              to="/admin/reporting/annual-reports/$reportId"
                              params={{ reportId: c.reportId }}
                              aria-label={`Open ${r.company.name} ${c.year} report`}
                              className="grid w-fit gap-1 rounded-lg p-1 hover:bg-surface focus-visible:outline-2"
                            >
                              <WorkflowStatus status={c.status} />
                              <span className="text-muted-foreground text-xs">
                                v{c.versions}
                                {c.openChanges ? ` · ${c.openChanges} open change` : ''}
                              </span>
                              {c.overdue ? (
                                <span className="inline-flex items-center gap-1 font-semibold text-danger text-xs">
                                  <AlertTriangle className="size-3" aria-hidden /> Overdue
                                </span>
                              ) : null}
                            </Link>
                          ) : (
                            <span className="grid gap-1 p-1">
                              <WorkflowStatus status="not_started" />
                              <span className="text-muted-foreground text-xs">No report</span>
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="px-3 py-3 align-top text-xs">
                        {r.comparisonReady ? (
                          <span className="inline-flex items-center gap-1 font-medium text-success">
                            <CheckCircle2 className="size-3.5" aria-hidden /> Comparison-ready (
                            {r.acceptedYears} years)
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Needs 2+ accepted years</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-xs">
              Comparison-ready means at least two accepted reports. Cross-year comparison still
              requires consistent units, boundaries and indicator definitions, checked in each
              report review. Indicator values are company-reported and not verified by this portal.
            </p>
          </div>
        ) : null}
      </QueryState>
    </ReportingShell>
  )
}
