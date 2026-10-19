import type { ActionItem } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { ArrowRight, ClipboardList } from 'lucide-react'
import { SectionCard } from '@/components/shared/Cards'
import { EmptyState } from '@/components/shared/States'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'

/** Assigned actions only. The confidential company assessment is never shown to employees. */
export function ContributionsCard({ actions, userId }: { actions: ActionItem[]; userId: string }) {
  return (
    <SectionCard
      title="Your company contributions"
      description="Actions in your company’s plan where you are an owner or contributor."
    >
      {actions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nothing assigned yet"
          description="When your company assigns you a WEPs action it will appear here."
        />
      ) : (
        <ul className="grid gap-3">
          {actions.map((a) => {
            const open = a.status === 'in_progress' || a.status === 'needs_revision'
            return (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
              >
                <div className="grid min-w-0 gap-1">
                  <Link
                    to="/portal/action-plan/$actionId"
                    params={{ actionId: a.id }}
                    className="font-medium text-navy hover:underline"
                  >
                    {a.title}
                  </Link>
                  <p className="text-muted-foreground text-sm">
                    {a.ownerId === userId ? 'You own this action' : 'You are a contributor'} · due{' '}
                    {formatDate(a.dueDate)}
                  </p>
                  <div>
                    <WorkflowStatus status={a.status} />
                  </div>
                </div>
                {open ? (
                  <Button asChild size="sm">
                    <Link to="/portal/action-plan/$actionId" params={{ actionId: a.id }}>
                      Submit evidence <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}
