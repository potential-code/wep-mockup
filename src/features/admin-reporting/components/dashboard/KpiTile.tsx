import type { LucideIcon } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import type { MetricKey } from '../metric-definitions'

/** KPI card that opens its filtered records. `metric` names the definition it follows (§23). */
export function KpiTile({
  metric: _metric,
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
  )
}
