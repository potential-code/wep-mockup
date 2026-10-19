import type { AnnualReport } from '@shared/types'
import { useState } from 'react'
import { SectionCard } from '@/components/shared/Cards'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { compareIndicator, formatDelta, formatValue } from '../lib'

/** Compare a year with the one before, flagging where indicator definitions differ. */
export function YearComparison({ reports }: { reports: AnnualReport[] }) {
  const eligible = reports.filter((r) => reports.some((p) => p.year === r.year - 1))
  const [year, setYear] = useState(String(eligible[0]?.year ?? ''))
  const current = reports.find((r) => String(r.year) === year)
  const prior = reports.find((r) => r.year === (current?.year ?? 0) - 1)
  if (!eligible.length) return null
  return (
    <SectionCard
      title="Compare with previous year"
      description="Values are comparable only where the indicator, unit and coverage match."
      action={
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-44" aria-label="Year to compare">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {eligible.map((r) => (
              <SelectItem key={r.year} value={String(r.year)}>
                {r.year} vs {r.year - 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <ul className="grid divide-y">
        {current?.indicators.map((i) => {
          const c = compareIndicator(i, prior?.indicators)
          return (
            <li
              key={i.id}
              className="grid gap-1 py-3 text-sm sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-4"
            >
              <span className="font-medium text-navy">{i.label}</span>
              <span className="text-muted-foreground">
                {prior?.year}: {formatValue(c.previous, i.unit)}
              </span>
              <span className="font-semibold text-navy">
                {current.year}: {formatValue(i.value, i.unit)}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground">{formatDelta(c.delta, i.unit)}</span>
                <StatusBadge tone={c.comparable ? 'success' : 'warning'} icon={null}>
                  {c.comparable ? 'Definitions match' : 'Coverage differs'}
                </StatusBadge>
              </span>
              {c.coverageNote ? (
                <span className="text-muted-foreground text-xs sm:col-span-4">
                  {c.coverageNote}
                </span>
              ) : null}
            </li>
          )
        })}
      </ul>
    </SectionCard>
  )
}
