import type { LucideIcon } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { LayerBadge } from '../LayerBadge'
import { MetricInfo } from '../MetricInfo'
import { METRICS, type MetricKey } from '../metric-definitions'

/** KPI card that opens its filtered records, with the layer and definition underneath. */
export function KpiTile({
  metric,
  label,
  value,
  suffix,
  decimals,
  hint,
  icon,
  to,
  search,
  progress,
  tone,
}: {
  metric: MetricKey
  label: string
  value: number
  suffix?: string
  decimals?: number
  hint: string
  icon: LucideIcon
  to: string
  search: Record<string, unknown>
  progress?: number
  tone?: 'blue' | 'navy' | 'gold' | 'success' | 'danger'
}) {
  return (
    <div className="grid content-start gap-1.5">
      <StatCard
        label={label}
        value={value}
        suffix={suffix}
        decimals={decimals}
        hint={hint}
        icon={icon}
        to={to}
        search={search}
        progress={progress}
        tone={tone}
      />
      <div className="flex items-center justify-between gap-2 px-1">
        <LayerBadge layer={METRICS[metric].layer} />
        <MetricInfo metric={metric} label="Definition" />
      </div>
    </div>
  )
}
