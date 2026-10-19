import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Titled content card used across dashboards. */
export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  id,
}: {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  id?: string
}) {
  return (
    <section id={id} className={cn('rounded-2xl border bg-card shadow-card', className)}>
      {title || action ? (
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <div className="grid gap-0.5">
            {title ? (
              <h2 className="font-heading font-semibold text-lg text-navy">{title}</h2>
            ) : null}
            {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={cn('p-5 sm:p-6', title || action ? 'pt-4 sm:pt-4' : '', bodyClassName)}>
        {children}
      </div>
    </section>
  )
}

/** "Proposed / illustrative" label required by the brief for non-official features and data. */
export function DemoLabel({
  children = 'Illustrative demo data',
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold-50 px-2 py-0.5 font-medium text-[11px] text-gold-700 uppercase tracking-wide',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function FilterBar({
  children,
  count,
  className,
}: {
  children: ReactNode
  count?: number
  className?: string
}) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-center gap-2', className)}>
      {children}
      {count !== undefined ? (
        <span className="ms-auto text-muted-foreground text-sm" aria-live="polite">
          {count} {count === 1 ? 'result' : 'results'}
        </span>
      ) : null}
    </div>
  )
}
