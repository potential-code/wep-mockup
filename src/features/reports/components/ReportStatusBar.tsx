import type { ReportStatus } from '@shared/types'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WORKFLOW, workflowIndex } from '../lib'

/** Workflow tracker: Draft > Ready for company approval > ... > Accepted. */
export function ReportStatusBar({ status }: { status: ReportStatus }) {
  const current = workflowIndex(status)
  return (
    <nav
      aria-label="Report workflow"
      className="relative overflow-x-auto rounded-2xl border bg-card p-4 shadow-card"
    >
      <ol className="flex min-w-max items-center gap-2">
        {WORKFLOW.map((step, i) => {
          const done = i < current
          const active = i === current
          return (
            <li
              key={step.status}
              className="flex items-center gap-2"
              aria-current={active ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 font-medium text-xs ring-1 ring-inset',
                  active && 'bg-navy text-white ring-navy',
                  done && 'bg-success-soft text-success ring-success/20',
                  !active && !done && 'bg-muted text-muted-foreground ring-border',
                )}
              >
                {done ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <span className="grid size-4 place-items-center rounded-full bg-white/20 text-[10px]">
                    {i + 1}
                  </span>
                )}
                {step.label}
                {active ? <span className="sr-only"> (current step)</span> : null}
              </span>
              {i < WORKFLOW.length - 1 ? <span className="h-px w-4 bg-border" aria-hidden /> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
