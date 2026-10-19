import { Link, useMatches } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface Crumb {
  label: string
  to?: string
}

/** Page title, one line of description and the primary action on the right (layout rules). */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  eyebrow,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  breadcrumbs?: Crumb[]
  eyebrow?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('mb-6 grid gap-3 sm:mb-8', className)}>
      {breadcrumbs && breadcrumbs.length > 0 ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid min-w-0 gap-1.5">
          {eyebrow ? <div className="font-medium text-blue text-sm">{eyebrow}</div> : null}
          <h1 className="text-page-title text-navy">{title}</h1>
          {description ? <p className="max-w-3xl text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={`${c.label}-${c.to ?? 'current'}`} className="flex items-center gap-1">
            {i > 0 ? <ChevronRight className="size-3.5" aria-hidden /> : null}
            {c.to && i < items.length - 1 ? (
              <Link to={c.to} className="hover:text-navy hover:underline">
                {c.label}
              </Link>
            ) : (
              <span
                aria-current={i === items.length - 1 ? 'page' : undefined}
                className="text-navy"
              >
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** The current route's title from staticData (used by the top bar). */
export function useRouteTitle() {
  const matches = useMatches()
  for (let i = matches.length - 1; i >= 0; i--) {
    const t = (matches[i]?.staticData as { title?: string } | undefined)?.title
    if (t) return t
  }
  return ''
}
