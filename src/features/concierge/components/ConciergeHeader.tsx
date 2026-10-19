import type { ReactNode } from 'react'
import { ConciergeAvatar } from '@/components/shared/ConciergeAvatar'
import { cn } from '@/lib/utils'

/** Chat header shared by the floating launcher and the full concierge page. */
export function ConciergeHeader({
  thinking = false,
  compact = false,
  actions,
  className,
}: {
  thinking?: boolean
  /** Narrow popup: status only, no source note. */
  compact?: boolean
  actions?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative isolate flex items-center gap-3 overflow-hidden bg-[linear-gradient(120deg,var(--navy-900),var(--navy)_45%,var(--blue-600))] px-4 py-3 text-white',
        className,
      )}
    >
      <span
        aria-hidden
        className="-top-12 -right-10 -z-10 absolute size-36 rounded-full border border-white/10"
      />
      <span
        aria-hidden
        className="-top-6 -right-4 -z-10 absolute size-20 rounded-full border border-gold/30"
      />
      <ConciergeAvatar size="lg" online thinking={thinking} />
      <div className="min-w-0 flex-1">
        <p className="font-heading font-semibold leading-tight">AI Concierge</p>
        <p className="flex items-center gap-1.5 text-white/80 text-xs" aria-live="polite">
          <span className="size-1.5 rounded-full bg-success" aria-hidden />
          {thinking ? 'Typing…' : 'Online'}
          <span className={cn('text-white/60', compact ? 'hidden' : 'hidden sm:inline')}>
            · Answers from approved WEPs sources
          </span>
        </p>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </div>
  )
}
