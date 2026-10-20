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
        <CardHeaderBand className="px-5 sm:px-6">
          <div className="grid gap-0.5">
            {title ? <h2 className="font-heading font-medium text-lg text-navy">{title}</h2> : null}
            {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
          </div>
          {action}
        </CardHeaderBand>
      ) : null}
      <div className={cn('p-5 sm:p-6', bodyClassName)}>{children}</div>
    </section>
  )
}

/** Header strip for cards: a thin brand rule over a soft blue-to-coral wash. */
export function CardHeaderBand({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative flex flex-wrap items-start justify-between gap-3 overflow-hidden rounded-t-2xl border-b bg-[linear-gradient(100deg,var(--blue-50),#fff_55%,var(--coral-50))] py-4',
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,var(--navy),var(--blue)_60%,var(--coral))]"
      />
      {children}
    </div>
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
