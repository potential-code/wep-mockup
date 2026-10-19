import { DEPARTMENTS } from '@shared/reference'
import type { DepartmentId, PrincipleId } from '@shared/types'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'
import type { ReportingFilters } from '@/queries/admin.queries'

/** Filters live in the URL so they persist across reporting tabs and detail round-trips. */
export const FILTER_KEYS = [
  'year',
  'country',
  'sector',
  'company',
  'dept',
  'principle',
  'sup',
] as const
export type FilterKey = (typeof FILTER_KEYS)[number]
export type FilterSearch = Partial<Record<FilterKey, string | number>>

export const DEFAULT_YEAR = 2026
export const YEARS = [2026, 2025, 2024]
export const SUPPRESS_BELOW = 5

const NUMERIC: string[] = ['year', 'principle', 'sup']
const str = (v: unknown) => (v === undefined || v === null || v === '' ? undefined : String(v))

export function useReportingFilters() {
  const raw = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()

  const filterSearch = useMemo(() => {
    const out: FilterSearch = {}
    for (const k of FILTER_KEYS) {
      const v = str(raw[k])
      if (v !== undefined)
        out[k] = NUMERIC.includes(k) && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : v
    }
    return out
  }, [raw])

  const filters = useMemo<ReportingFilters>(() => {
    const year = Number(filterSearch.year)
    const principle = Number(filterSearch.principle)
    const dept = filterSearch.dept as string | undefined
    return {
      year: Number.isFinite(year) && year > 0 ? year : DEFAULT_YEAR,
      country: str(filterSearch.country),
      sector: str(filterSearch.sector),
      companyId: str(filterSearch.company),
      department: DEPARTMENTS.some((d) => d.id === dept) ? (dept as DepartmentId) : undefined,
      principle: principle >= 1 && principle <= 7 ? (principle as PrincipleId) : undefined,
    }
  }, [filterSearch])

  /** Small-group suppression is on unless explicitly switched off (sup=0). */
  const suppress = String(filterSearch.sup) !== '0'

  const setFilters = useCallback(
    (patch: Partial<Record<FilterKey, string | undefined>>) => {
      navigate({
        to: '.',
        replace: true,
        search: (prev: Record<string, unknown>) => {
          const next = { ...prev }
          for (const [k, v] of Object.entries(patch)) {
            if (v === undefined || v === '') delete next[k]
            else next[k] = NUMERIC.includes(k) && !Number.isNaN(Number(v)) ? Number(v) : v
          }
          return next
        },
      } as never)
    },
    [navigate],
  )

  const reset = useCallback(() => {
    navigate({
      to: '.',
      replace: true,
      search: (prev: Record<string, unknown>) => {
        const next = { ...prev }
        for (const k of FILTER_KEYS) delete next[k]
        return next
      },
    } as never)
  }, [navigate])

  const activeCount = FILTER_KEYS.filter(
    (k) => k !== 'year' && filterSearch[k] !== undefined,
  ).length

  return { filters, filterSearch, suppress, setFilters, reset, activeCount }
}

/** Human-readable scope used on screen and in every export. */
export function describeScope(
  f: ReportingFilters,
  names: { company?: string } = {},
  suppress = true,
) {
  const dept = DEPARTMENTS.find((d) => d.id === f.department)?.label
  return [
    `Reporting year ${f.year}`,
    `Country: ${f.country ?? 'all'}`,
    `Sector: ${f.sector ?? 'all'}`,
    `Company: ${f.companyId ? (names.company ?? f.companyId) : 'all'}`,
    `Department: ${dept ?? 'all'}`,
    ...(f.principle ? [`Principle: ${f.principle}`] : []),
    suppress ? 'Groups under 5 suppressed' : 'No suppression',
  ].join('; ')
}

/** Typed bridge for `<Link search>`; reporting routes validate nothing, params pass through. */
export const searchProp = (s: FilterSearch): Record<string, unknown> => s

/** A single page-level URL param (e.g. ?q= or ?event=) alongside the shared filters. */
export function useUrlParam(key: string): [string | undefined, (v: string | undefined) => void] {
  const raw = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()
  const value = str(raw[key])
  const set = useCallback(
    (v: string | undefined) => {
      navigate({
        to: '.',
        replace: true,
        search: (prev: Record<string, unknown>) => {
          const next = { ...prev }
          if (v === undefined || v === '') delete next[key]
          else next[key] = v
          return next
        },
      } as never)
    },
    [navigate, key],
  )
  return [value, set]
}

/** Navigate to another reporting screen carrying the current filters. */
export function useGoto() {
  const navigate = useNavigate()
  const { filterSearch } = useReportingFilters()
  return useCallback(
    (to: string) => navigate({ to, search: filterSearch } as never),
    [navigate, filterSearch],
  )
}
