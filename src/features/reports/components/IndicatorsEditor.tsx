import type { AnnualReport, PrincipleId, ReportIndicator } from '@shared/types'
import { Plus, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSaveIndicators } from '@/queries/reports.queries'
import { compareIndicator, formatDelta, formatValue } from '../lib'
import { SaveIndicator } from './SaveIndicator'
import { useAutosave } from './useAutosave'

const PRINCIPLE_IDS: PrincipleId[] = [1, 2, 3, 4, 5, 6, 7]

/** Inline validation mirroring the service rule: a value needs unit, coverage and period. */
function validate(i: ReportIndicator): string | null {
  if (i.value === null) return null
  const missing = [!i.unit && 'unit', !i.coverage && 'coverage', !i.period && 'period'].filter(
    Boolean,
  )
  return missing.length ? `Add ${missing.join(', ')} for this value.` : null
}

export function IndicatorsEditor({
  report,
  previous,
  readOnly,
}: {
  report: AnnualReport
  previous: AnnualReport | null
  readOnly: boolean
}) {
  const [rows, setRows] = useState<ReportIndicator[]>(report.indicators)
  const [na, setNa] = useState<Set<string>>(new Set())
  const [serverError, setServerError] = useState<string | null>(null)
  const save = useSaveIndicators()
  const auto = useAutosave<ReportIndicator[]>(async (v) => {
    try {
      await save.mutateAsync({ year: report.year, indicators: v })
      setServerError(null)
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Could not save indicators.')
      throw e
    }
  })

  const update = (id: string, patch: Partial<ReportIndicator>) => {
    const next = rows.map((r) => (r.id === id ? { ...r, ...patch } : r))
    setRows(next)
    if (next.every((r) => !validate(r))) auto.schedule(next)
  }
  const toggleNa = (id: string, on: boolean) => {
    setNa((s) => {
      const n = new Set(s)
      on ? n.add(id) : n.delete(id)
      return n
    })
    if (on) update(id, { value: null })
  }
  const add = () => {
    setRows((r) => [
      ...r,
      {
        id: `ind-custom-${Date.now()}`,
        label: '',
        principle: 1,
        value: null,
        unit: '%',
        coverage: '',
        period: `FY${report.year - 1}`,
      },
    ])
  }
  const anyError = rows.some((r) => validate(r))

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading font-medium text-navy">Indicators</h3>
        {readOnly ? null : <SaveIndicator state={anyError ? 'idle' : auto.state} />}
      </div>
      <p className="text-muted-foreground text-sm">
        Leave a value blank if it is not available. Blank is never saved as zero. Values need a
        unit, coverage and reporting period.
      </p>
      {serverError ? (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-danger text-sm">
          {serverError}
        </p>
      ) : null}
      <ul className="grid gap-3">
        {rows.map((i) => {
          const err = validate(i)
          const cmp = compareIndicator(i, previous?.indicators)
          const isNa = na.has(i.id)
          const custom = i.id.startsWith('ind-custom')
          const Trend = cmp.delta !== null && cmp.delta < 0 ? TrendingDown : TrendingUp
          return (
            <li key={i.id} className="grid gap-3 rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                {custom && !readOnly ? (
                  <div className="grid w-full gap-1.5 sm:max-w-sm">
                    <Label htmlFor={`${i.id}-label`}>Indicator name</Label>
                    <Input
                      id={`${i.id}-label`}
                      value={i.label}
                      onChange={(e) => update(i.id, { label: e.target.value })}
                    />
                  </div>
                ) : (
                  <p className="font-semibold text-navy">{i.label}</p>
                )}
                {custom && !readOnly ? (
                  <Select
                    value={String(i.principle)}
                    onValueChange={(v) => update(i.id, { principle: Number(v) as PrincipleId })}
                  >
                    <SelectTrigger className="w-40" aria-label="Principle">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRINCIPLE_IDS.map((p) => (
                        <SelectItem key={p} value={String(p)}>
                          Principle {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <PrincipleTag id={i.principle} />
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="grid gap-1.5">
                  <Label htmlFor={`${i.id}-value`}>Value</Label>
                  <Input
                    id={`${i.id}-value`}
                    type="number"
                    step="any"
                    inputMode="decimal"
                    disabled={readOnly || isNa}
                    placeholder={isNa ? 'Not available' : 'Blank = missing'}
                    value={i.value ?? ''}
                    onChange={(e) =>
                      update(i.id, { value: e.target.value === '' ? null : Number(e.target.value) })
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor={`${i.id}-unit`}>Unit</Label>
                  <Input
                    id={`${i.id}-unit`}
                    disabled={readOnly}
                    value={i.unit}
                    onChange={(e) => update(i.id, { unit: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor={`${i.id}-coverage`}>Coverage</Label>
                  <Input
                    id={`${i.id}-coverage`}
                    disabled={readOnly}
                    value={i.coverage}
                    placeholder="e.g. All UAE operations"
                    onChange={(e) => update(i.id, { coverage: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor={`${i.id}-period`}>Period</Label>
                  <Input
                    id={`${i.id}-period`}
                    disabled={readOnly}
                    value={i.period}
                    onChange={(e) => update(i.id, { period: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor={`${i.id}-evidence`}>Evidence</Label>
                  <Select
                    value={i.evidence ?? 'none'}
                    disabled={readOnly}
                    onValueChange={(v) => update(i.id, { evidence: v === 'none' ? undefined : v })}
                  >
                    <SelectTrigger id={`${i.id}-evidence`}>
                      <SelectValue placeholder="No evidence linked" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No evidence linked</SelectItem>
                      {report.evidence.map((e) => (
                        <SelectItem key={e.id} value={e.fileName}>
                          {e.fileName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs">Previous year</p>
                    <p className="flex items-center gap-1.5 font-medium text-navy">
                      {formatValue(cmp.previous, i.unit)}
                      {cmp.delta !== null ? (
                        <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                          <Trend className="size-3.5" aria-hidden />
                          {formatDelta(cmp.delta, i.unit)}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  {readOnly ? null : (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`${i.id}-na`}
                        checked={isNa}
                        onCheckedChange={(c) => toggleNa(i.id, c === true)}
                      />
                      <Label htmlFor={`${i.id}-na`} className="font-normal">
                        Not available
                      </Label>
                    </div>
                  )}
                </div>
              </div>
              {err ? (
                <p role="alert" className="text-danger text-xs">
                  {err}
                </p>
              ) : null}
              {i.value === null && !isNa ? (
                <p className="text-muted-foreground text-xs">
                  Missing. This will stay blank, not zero.
                </p>
              ) : null}
            </li>
          )
        })}
      </ul>
      {readOnly ? null : (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={add}>
            <Plus /> Add indicator
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={anyError || save.isPending}
            onClick={() => auto.flush(rows)}
          >
            {save.isPending ? 'Saving…' : 'Save indicators'}
          </Button>
        </div>
      )}
    </div>
  )
}
