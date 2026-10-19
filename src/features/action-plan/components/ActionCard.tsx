import type { ActionItem } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { CalendarClock, FileWarning, Paperclip } from 'lucide-react'
import { motion } from 'motion/react'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { formatDate } from '@/lib/format'

export interface DecoratedAction {
  action: ActionItem
  ownerName: string
  ownerAvatar?: string
  overdue: boolean
  missingEvidence: boolean
}

/** Compact action card for the board and list. Overdue and missing evidence are flagged in text. */
export function ActionCard({ item, showStatus }: { item: DecoratedAction; showStatus?: boolean }) {
  const { action: a } = item
  return (
    <motion.div layout="position" transition={{ duration: 0.2 }} whileHover={{ y: -2 }}>
      <Link
        to="/portal/action-plan/$actionId"
        params={{ actionId: a.id }}
        className="grid gap-2.5 rounded-xl border bg-card p-3.5 shadow-card transition-shadow hover:shadow-lift"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <PrincipleTag id={a.principle} linked={false} />
          {showStatus ? <WorkflowStatus status={a.status} /> : null}
        </div>
        <p className="font-medium text-navy text-sm leading-snug">{a.title}</p>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <UserAvatar name={item.ownerName} src={item.ownerAvatar} className="size-6" />
          <span className="truncate">{item.ownerName}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <CalendarClock className="size-3.5" aria-hidden /> {formatDate(a.dueDate)}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Paperclip className="size-3.5" aria-hidden /> {a.evidence.length}
          </span>
          {item.overdue ? <StatusBadge tone="danger">Overdue</StatusBadge> : null}
          {item.missingEvidence ? (
            <StatusBadge tone="warning" icon={FileWarning}>
              No evidence
            </StatusBadge>
          ) : null}
        </div>
      </Link>
    </motion.div>
  )
}
