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

/** Persistent reporting filters. Everything is stored in the URL search params. */
export function ReportingFilterBar({ showPrinciple }: { showPrinciple?: boolean }) {
  const { filters, filterSearch, suppress, setFilters, reset, activeCount } = useReportingFilters()
  const opts = useCompanyOptions()
  const [open, setOpen] = useState(false)
  const set = (k: FilterKey) => (v: string | undefined) => {
    // Picking a country or sector clears a company that no longer fits.
    setFilters({ [k]: v, ...(k === 'country' || k === 'sector' ? { company: undefined } : {}) })
  }

  return (
    <section
      aria-label="Reporting filters"
      className="mb-6 rounded-2xl border bg-card p-4 shadow-card"
    >
      <div className="flex items-center justify-between gap-2 sm:hidden">
        <Button
          variant="outline"
          size="sm"
          aria-expanded={open}
          aria-controls="reporting-filter-fields"
          onClick={() => setOpen((o) => !o)}
        >
          <ListFilter aria-hidden /> Filters
          {activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>
        <span className="text-muted-foreground text-xs">Year {filters.year}</span>
      </div>
      <div
        id="reporting-filter-fields"
        className={cn(
          'mt-3 grid grid-cols-2 gap-3 sm:mt-0 sm:grid sm:grid-cols-3 lg:grid-cols-6',
          !open && 'hidden sm:grid',
        )}
      >
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
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs">
        <p className="min-w-0 text-muted-foreground" aria-live="polite">
          <span className="font-medium text-navy">Scope: </span>
          {describeScope(filters, { company: opts.companyName(filters.companyId) }, suppress)}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="rf-suppress"
              checked={suppress}
              onCheckedChange={(on) => setFilters({ sup: on ? undefined : '0' })}
              aria-label={`Suppress user-level groups under ${SUPPRESS_BELOW}`}
            />
            <Label htmlFor="rf-suppress" className="text-xs">
              Suppress groups under {SUPPRESS_BELOW}
            </Label>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            disabled={Object.keys(filterSearch).length === 0}
          >
            <RotateCcw aria-hidden /> Reset
          </Button>
        </div>
      </div>
    </section>
  )
}
