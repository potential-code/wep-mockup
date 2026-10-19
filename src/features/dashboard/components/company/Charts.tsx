import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { SectionCard } from '@/components/shared/Cards'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { CompanyDashboardData } from '@/queries/company.queries'

const deptConfig = {
  active: { label: 'Activated', color: 'var(--chart-1)' },
  completed: { label: 'Completed path', color: 'var(--chart-3)' },
} satisfies ChartConfig

const trendConfig = {
  complete: { label: 'Completed', color: 'var(--chart-1)' },
  active: { label: 'Started', color: 'var(--chart-5)' },
} satisfies ChartConfig

/** Department participation: who is active and who has completed the learning path. */
export function DepartmentChart({ rows }: { rows: CompanyDashboardData['departments'] }) {
  return (
    <SectionCard
      title="Participation by department"
      description="Activated employees and path completions"
    >
      <ChartContainer config={deptConfig} className="h-60 w-full">
        <BarChart data={rows} margin={{ left: -16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} interval={0} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="active" fill="var(--color-active)" radius={4} />
          <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
        </BarChart>
      </ChartContainer>
      <table className="sr-only">
        <caption>Participation by department</caption>
        <thead>
          <tr>
            <th>Department</th>
            <th>Activated</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.department}>
              <td>{r.label}</td>
              <td>{r.active}</td>
              <td>{r.completed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  )
}

/** Action completion over the last six months. */
export function TrendChart({ rows }: { rows: CompanyDashboardData['trend'] }) {
  return (
    <SectionCard
      title="Action completion trend"
      description="Actions started and completed, May to October"
    >
      <ChartContainer config={trendConfig} className="h-60 w-full">
        <LineChart data={rows} margin={{ left: -16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line dataKey="active" stroke="var(--color-active)" strokeWidth={2} dot={false} />
          <Line
            dataKey="complete"
            stroke="var(--color-complete)"
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ChartContainer>
      <table className="sr-only">
        <caption>Action completion by month</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Started</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.month}>
              <td>{r.month}</td>
              <td>{r.active}</td>
              <td>{r.complete}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  )
}
