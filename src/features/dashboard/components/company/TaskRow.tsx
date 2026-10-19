import { Link } from '@tanstack/react-router'
import { AlertCircle, ArrowRight, Info, TriangleAlert } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { daysUntil } from '@/lib/format'
import type { CompanyDashboardData } from '@/queries/company.queries'

export type DashTask = CompanyDashboardData['tasks'][number]

const SEVERITY = {
  critical: { icon: AlertCircle, cls: 'bg-danger-soft text-danger' },
  warning: { icon: TriangleAlert, cls: 'bg-warning-soft text-warning' },
  info: { icon: Info, cls: 'bg-blue-50 text-blue' },
} as const

export function dueLabel(iso: string) {
  const d = daysUntil(iso)
  if (d < 0) return `${Math.abs(d)} days overdue`
  if (d === 0) return 'Due today'
  return `Due in ${d} day${d === 1 ? '' : 's'}`
}

/** One open task. It disappears once the underlying record is resolved. */
export function TaskRow({ task, cta = 'Open' }: { task: DashTask; cta?: string }) {
  const sev = SEVERITY[task.severity]
  const Icon = sev.icon
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3.5">
      <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${sev.cls}`}>
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="font-medium text-navy text-sm">{task.title}</p>
        <p className="text-muted-foreground text-xs">{task.detail}</p>
      </div>
      {task.due ? (
        <StatusBadge tone={daysUntil(task.due) < 0 ? 'danger' : 'neutral'} icon={null}>
          {dueLabel(task.due)}
        </StatusBadge>
      ) : null}
      <Button asChild size="sm" variant="outline">
        <Link to={task.to}>
          {cta} <ArrowRight aria-hidden />
        </Link>
      </Button>
    </li>
  )
}
