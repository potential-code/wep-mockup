import type { AnnualReport } from '@shared/types'
import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { SectionCard } from '@/components/shared/Cards'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { indicatorKey } from '../lib'

const COLORS = ['#006fa8', '#263955', '#F0493E', '#2E8B6A']

/** Selected reported indicators across years. Company-reported; no causality claimed. */
export function ProgressOverTime({ reports }: { reports: AnnualReport[] }) {
  const sorted = useMemo(() => [...reports].sort((a, b) => a.year - b.year), [reports])
  const options = useMemo(() => {
    const m = new Map<string, { key: string; label: string; unit: string }>()
    for (const r of sorted)
      for (const i of r.indicators)
        if (i.value !== null)
          m.set(indicatorKey(i), { key: indicatorKey(i), label: i.label, unit: i.unit })
    return [...m.values()].filter(
      (o) =>
        sorted.filter((r) =>
          r.indicators.some((i) => indicatorKey(i) === o.key && i.value !== null),
        ).length >= 2,
    )
  }, [sorted])
  const [selected, setSelected] = useState<string[]>(() => options.slice(0, 2).map((o) => o.key))
  const chosen = options.filter((o) => selected.includes(o.key)).slice(0, 4)
  const config: ChartConfig = Object.fromEntries(
    chosen.map((o, n) => [`s${n}`, { label: o.label, color: COLORS[n % COLORS.length] }]),
  )
  const data = sorted.map((r) => ({
    year: String(r.year),
    ...Object.fromEntries(
      chosen.map((o, n) => [
        `s${n}`,
        r.indicators.find((i) => indicatorKey(i) === o.key)?.value ?? null,
      ]),
    ),
  }))
  if (!options.length) return null

  return (
    <SectionCard title="Progress over time" description="Company-reported; no causal claim.">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
        <div className="max-w-full overflow-x-auto pb-1">
          <ToggleGroup
            type="multiple"
            variant="outline"
            value={selected}
            onValueChange={setSelected}
            className="justify-start"
            aria-label="Indicators to chart"
          >
            {options.map((o) => (
              <ToggleGroupItem
                key={o.key}
                value={o.key}
                className="h-auto min-h-10 whitespace-normal px-3 py-1.5 text-start text-xs"
              >
                {o.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        {chosen.length ? (
          <ChartContainer config={config} className="h-64 w-full">
            <LineChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="year" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={36} />
              <ChartTooltip content={<ChartTooltipContent />} />
              {chosen.map((o, n) => (
                <Line
                  key={o.key}
                  dataKey={`s${n}`}
                  stroke={`var(--color-s${n})`}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ChartContainer>
        ) : (
          <p className="text-muted-foreground text-sm">Select an indicator to see it over time.</p>
        )}
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[34rem] text-sm">
            <caption className="sr-only">Selected indicators by reporting year</caption>
            <thead className="bg-surface text-start text-muted-foreground text-xs">
              <tr>
                <th scope="col" className="p-3 text-start">
                  Indicator
                </th>
                <th scope="col" className="p-3 text-start">
                  Baseline
                </th>
                <th scope="col" className="p-3 text-start">
                  Current
                </th>
                <th scope="col" className="p-3 text-start">
                  Unit
                </th>
                <th scope="col" className="p-3 text-start">
                  Evidence
                </th>
              </tr>
            </thead>
            <tbody>
              {chosen.map((o) => {
                const pts = sorted.flatMap((r) =>
                  r.indicators
                    .filter((i) => indicatorKey(i) === o.key && i.value !== null)
                    .map((i) => ({ year: r.year, i })),
                )
                const first = pts[0]
                const last = pts[pts.length - 1]
                return (
                  <tr key={o.key} className="border-t">
                    <th scope="row" className="p-3 text-start font-medium text-navy">
                      {o.label}
                    </th>
                    <td className="p-3">
                      {first?.i.value}
                      {o.unit === '%' ? '%' : ''}{' '}
                      <span className="text-muted-foreground text-xs">({first?.year})</span>
                    </td>
                    <td className="p-3">
                      {last?.i.value}
                      {o.unit === '%' ? '%' : ''}{' '}
                      <span className="text-muted-foreground text-xs">({last?.year})</span>
                    </td>
                    <td className="p-3">{o.unit}</td>
                    <td className="p-3">
                      <StatusBadge tone={last?.i.evidence ? 'success' : 'neutral'}>
                        {last?.i.evidence ? 'Evidence on file' : 'No evidence linked'}
                      </StatusBadge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  )
}
