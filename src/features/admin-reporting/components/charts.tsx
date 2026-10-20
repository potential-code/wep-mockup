import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

export const SERIES_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export interface Series {
  key: string
  label: string
  color?: string
}

const toConfig = (series: Series[]): ChartConfig =>
  Object.fromEntries(
    series.map((s, i) => [
      s.key,
      { label: s.label, color: s.color ?? SERIES_COLORS[i % SERIES_COLORS.length] },
    ]),
  )

/** Area or line trend over time. */
export function TrendChart<T extends Record<string, string | number>>({
  data,
  xKey,
  series,
  type = 'area',
  height = 260,
}: {
  data: T[]
  xKey: string
  series: Series[]
  type?: 'area' | 'line'
  height?: number
}) {
  const config = toConfig(series)
  const axes = (
    <>
      <CartesianGrid vertical={false} strokeDasharray="3 3" />
      <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} />
      <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
    </>
  )
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      {type === 'area' ? (
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
          {axes}
          {series.map((s) => (
            <Area
              key={s.key}
              dataKey={s.key}
              type="monotone"
              stroke={`var(--color-${s.key})`}
              fill={`var(--color-${s.key})`}
              fillOpacity={0.14}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      ) : (
        <LineChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
          {axes}
          {series.map((s) => (
            <Line
              key={s.key}
              dataKey={s.key}
              type="monotone"
              stroke={`var(--color-${s.key})`}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      )}
    </ChartContainer>
  )
}

/** Grouped or stacked bars; `horizontal` lays categories on the y axis for long labels. */
export function BarsChart<T extends Record<string, string | number>>({
  data,
  xKey,
  series,
  stacked,
  horizontal,
  height = 260,
  labelWidth = 110,
}: {
  data: T[]
  xKey: string
  series: Series[]
  stacked?: boolean
  horizontal?: boolean
  height?: number
  labelWidth?: number
}) {
  const config = toConfig(series)
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      <BarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ left: 0, right: 8, top: 8 }}
      >
        <CartesianGrid vertical={!!horizontal} horizontal={!horizontal} strokeDasharray="3 3" />
        {horizontal ? (
          <>
            <YAxis
              dataKey={xKey}
              type="category"
              tickLine={false}
              axisLine={false}
              width={labelWidth}
            />
            <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
          </>
        )}
        <ChartTooltip content={<ChartTooltipContent />} />
        {series.length > 1 ? <ChartLegend content={<ChartLegendContent />} /> : null}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            stackId={stacked ? 'a' : undefined}
            fill={`var(--color-${s.key})`}
            radius={stacked ? (i === series.length - 1 ? [4, 4, 0, 0] : 0) : 4}
            maxBarSize={36}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

export interface DonutDatum {
  name: string
  value: number
  color?: string
}

/** Donut with a centre total and an always-visible legend carrying counts and shares. */
export function DonutChart({
  data,
  centerValue,
  centerLabel,
}: {
  data: DonutDatum[]
  centerValue: string | number
  centerLabel: string
}) {
  const total = data.reduce((n, d) => n + d.value, 0)
  const colored = data.map((d, i) => ({
    ...d,
    color: d.color ?? SERIES_COLORS[i % SERIES_COLORS.length],
  }))
  const config: ChartConfig = Object.fromEntries(
    colored.map((d) => [d.name, { label: d.name, color: d.color }]),
  )
  return (
    <div className="grid items-center gap-4">
      <div className="relative mx-auto size-[180px]">
        <ChartContainer config={config} className="aspect-square size-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
            <Pie
              data={colored}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={2}
              strokeWidth={0}
            >
              {colored.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-medium font-heading text-2xl text-navy leading-none">
              {centerValue}
            </p>
            <p className="mt-1 text-muted-foreground text-xs">{centerLabel}</p>
          </div>
        </div>
      </div>
      <ul className="grid gap-2 text-sm">
        {colored.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span
              className="size-3 shrink-0 rounded-sm"
              style={{ backgroundColor: d.color }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate">{d.name}</span>
            <span className="font-medium text-navy tabular-nums">{d.value}</span>
            <span className="w-10 text-end text-muted-foreground text-xs tabular-nums">
              {total ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export interface FunnelStage {
  label: string
  value: number
  to?: string
  search?: Record<string, unknown>
  note?: string
}

/** Animated horizontal funnel; every stage opens its records. */
export function FunnelBars({ stages }: { stages: FunnelStage[] }) {
  const reduce = usePrefersReducedMotion()
  const max = Math.max(1, ...stages.map((s) => s.value))
  return (
    <ol className="grid gap-2.5">
      {stages.map((s, i) => {
        const prev = stages[i - 1]
        const row = (
          <div className="grid gap-1">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium text-navy">
                {i + 1}. {s.label}
              </span>
              <span className="tabular-nums">
                <strong className="text-navy">{s.value}</strong>
                {prev && prev.value > 0 ? (
                  <span className="ms-2 text-muted-foreground text-xs">
                    {Math.round((s.value / prev.value) * 100)}% of previous
                  </span>
                ) : null}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-blue"
                style={{ opacity: 1 - i * 0.1 }}
                initial={{ width: reduce ? `${(s.value / max) * 100}%` : 0 }}
                animate={{ width: `${(s.value / max) * 100}%` }}
                transition={{ duration: 0.7, delay: reduce ? 0 : i * 0.08, ease: 'easeOut' }}
              />
            </div>
            {s.note ? <p className="text-muted-foreground text-xs">{s.note}</p> : null}
          </div>
        )
        return (
          <li key={s.label}>
            {s.to ? (
              <Link
                to={s.to}
                search={s.search}
                className="-mx-2 block rounded-lg px-2 py-1 hover:bg-surface focus-visible:outline-2"
              >
                {row}
              </Link>
            ) : (
              row
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Percentage heat grid (rows × steps). Numbers stay visible so meaning is not colour-only. */
export function HeatGrid({
  columns,
  rows,
}: {
  columns: string[]
  rows: { label: string; cells: { pct: number | null; text: string }[] }[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="w-28 text-start font-medium text-muted-foreground" scope="col">
              Department
            </th>
            {columns.map((c) => (
              <th key={c} scope="col" className="font-medium text-muted-foreground">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row" className="text-start font-medium text-navy">
                {r.label}
              </th>
              {r.cells.map((c, i) => (
                <td
                  // biome-ignore lint/suspicious/noArrayIndexKey: positional cells
                  key={i}
                  className={cn(
                    'rounded-md py-2 text-center font-medium tabular-nums',
                    c.pct === null
                      ? 'bg-muted text-muted-foreground'
                      : c.pct >= 55
                        ? 'text-white'
                        : 'text-navy',
                  )}
                  style={
                    c.pct === null
                      ? undefined
                      : {
                          backgroundColor: `color-mix(in oklab, var(--chart-1) ${Math.max(8, c.pct)}%, white)`,
                        }
                  }
                >
                  {c.text}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
