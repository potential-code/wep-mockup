import type { ActionStatus } from '@shared/types'
import { LayoutGroup } from 'motion/react'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { ActionCard, type DecoratedAction } from './ActionCard'

export const BOARD_COLUMNS: ActionStatus[] = [
  'draft',
  'ceo_review',
  'in_progress',
  'evidence_submitted',
  'needs_revision',
  'complete',
]

/** Kanban board by status (desktop). Cards animate between columns when status changes. */
export function ActionBoard({ items }: { items: DecoratedAction[] }) {
  return (
    <LayoutGroup>
      <div className="grid auto-cols-[minmax(250px,1fr)] grid-flow-col gap-4 overflow-x-auto pb-3">
        {BOARD_COLUMNS.map((status) => {
          const col = items.filter((i) => i.action.status === status)
          return (
            <section
              key={status}
              aria-label={`${status.replace(/_/g, ' ')} actions`}
              className="grid content-start gap-3 rounded-2xl bg-secondary/60 p-3"
            >
              <header className="flex items-center justify-between">
                <WorkflowStatus status={status} />
                <span className="font-semibold text-navy text-sm tabular-nums">{col.length}</span>
              </header>
              {col.length === 0 ? (
                <p className="rounded-xl border border-dashed p-4 text-center text-muted-foreground text-xs">
                  Nothing here
                </p>
              ) : (
                col.map((i) => <ActionCard key={i.action.id} item={i} />)
              )}
            </section>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
