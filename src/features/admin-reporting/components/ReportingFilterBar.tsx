import { DEPARTMENTS, PRINCIPLES } from '@shared/reference'
import { ListFilter, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  describeScope,
  type FilterKey,
  SUPPRESS_BELOW,
  useReportingFilters,
  YEARS,
} from './filters'
import { useCompanyOptions } from './options'

function Field({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string
  value: string | undefined
  onChange: (v: string | undefined) => void
  options: { value: string; label: string }[]
  allLabel?: string
}) {
  const id = `rf-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div className="grid min-w-0 gap-1">
      <Label htmlFor={id} className="text-muted-foreground text-xs">
        {label}
      </Label>
      <Select value={value ?? 'all'} onValueChange={(v) => onChange(v === 'all' ? undefined : v)}>
        <SelectTrigger id={id} className="h-10 w-full bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allLabel ? <SelectItem value="all">{allLabel}</SelectItem> : null}
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/**
 * Persistent reporting filters, stored in the URL. Year and Country are always visible; the
 * other §22 filters and small-group suppression sit behind "More filters" to keep demos calm.
 */
export function ReportingFilterBar({ showPrinciple }: { showPrinciple?: boolean }) {
  const { filters, filterSearch, suppress, setFilters, reset } = useReportingFilters()
  const opts = useCompanyOptions()
  const extraActive = [
    filters.sector,
    filters.companyId,
    filters.department,
    filters.principle,
  ].filter(Boolean).length
  const [more, setMore] = useState(extraActive > 0)
  const set = (k: FilterKey) => (v: string | undefined) => {
    // Picking a country or sector clears a company that no longer fits.
    setFilters({ [k]: v, ...(k === 'country' || k === 'sector' ? { company: undefined } : {}) })
  }
  const chips = [
    filters.sector,
    opts.companyName(filters.companyId),
    filters.department ? DEPARTMENTS.find((d) => d.id === filters.department)?.short : undefined,
    filters.principle ? `Principle ${filters.principle}` : undefined,
    suppress ? undefined : 'Small groups shown',
  ].filter((c): c is string => Boolean(c))

  return (
    <section
      aria-label="Reporting filters"
      className="mb-6 rounded-2xl border bg-card p-4 shadow-card"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:w-auto sm:max-w-md sm:flex-1">
          <Field
            label="Reporting year"
            value={String(filters.year)}
            onChange={(v) => setFilters({ year: v })}
            options={YEARS.map((y) => ({ value: String(y), label: String(y) }))}
          />
          <Field
            label="Country"
            value={filters.country}
            onChange={set('country')}
            allLabel="All countries"
            options={opts.countries.map((c) => ({ value: c, label: c }))}
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            aria-expanded={more}
            aria-controls="reporting-more-filters"
            onClick={() => setMore((o) => !o)}
            className="h-10"
          >
            <ListFilter aria-hidden /> More filters
            {extraActive > 0 ? ` (${extraActive})` : ''}
          </Button>
          <Button
            variant="ghost"
            onClick={reset}
            disabled={Object.keys(filterSearch).length === 0}
            className="h-10"
          >
            <RotateCcw aria-hidden /> Reset
          </Button>
        </div>
      </div>
      {chips.length > 0 && !more ? (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Other active filters">
          {chips.map((c) => (
            <li
              key={c}
              className="rounded-full bg-blue-50 px-2.5 py-0.5 font-medium text-blue-600 text-xs"
            >
              {c}
            </li>
          ))}
        </ul>
      ) : null}
      <div
        id="reporting-more-filters"
        className={cn(
          'mt-3 grid grid-cols-2 gap-3 border-t pt-3 sm:grid-cols-3 lg:grid-cols-5',
          !more && 'hidden',
        )}
      >
        <Field
          label="Sector"
          value={filters.sector}
          onChange={set('sector')}
          allLabel="All sectors"
          options={opts.sectors.map((c) => ({ value: c, label: c }))}
        />
        <Field
          label="Company"
          value={filters.companyId}
          onChange={set('company')}
          allLabel="All companies"
          options={opts.companies.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Field
          label="Department"
          value={filters.department}
          onChange={set('dept')}
          allLabel="All departments"
          options={DEPARTMENTS.map((d) => ({ value: d.id, label: d.short }))}
        />
        {showPrinciple ? (
          <Field
            label="Principle"
            value={filters.principle ? String(filters.principle) : undefined}
            onChange={set('principle')}
            allLabel="All principles"
            options={PRINCIPLES.map((p) => ({ value: String(p.id), label: `${p.id}. ${p.short}` }))}
          />
        ) : null}
        <div className="col-span-2 flex items-center gap-2 self-end pb-2 sm:col-span-1">
          <Switch
            id="rf-suppress"
            checked={suppress}
            onCheckedChange={(on) => setFilters({ sup: on ? undefined : '0' })}
            aria-label={`Suppress user-level groups under ${SUPPRESS_BELOW}`}
          />
          <Label htmlFor="rf-suppress" className="text-xs">
            Hide groups under {SUPPRESS_BELOW}
          </Label>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {describeScope(filters, { company: opts.companyName(filters.companyId) }, suppress)}
      </p>
    </section>
  )
}
