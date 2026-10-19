import { Link } from '@tanstack/react-router'
import { AlertTriangle, ArrowRight, CheckCircle2, Info } from 'lucide-react'
import { useState } from 'react'
import { SectionCard } from '@/components/shared/Cards'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface AttentionItem {
  id: string
  label: string
  target: string
  to: string
  severity: 'critical' | 'warning' | 'info'
}

const ORDER = { critical: 0, warning: 1, info: 2 }
const SEV = {
  critical: { icon: AlertTriangle, cls: 'bg-danger-soft text-danger', text: 'Urgent' },
  warning: { icon: AlertTriangle, cls: 'bg-warning-soft text-warning', text: 'Needs action' },
  info: { icon: Info, cls: 'bg-blue-50 text-blue-600', text: 'To review' },
}

/** Attention-required queue (brief §23). Every row links to its record. */
/** Splits "/path?a=b" into a path and search object, merged over the shared filters. */
export function withFilters(to: string, search: Record<string, unknown>) {
  const [path = to, qs] = to.split('?')
  return { to: path, search: { ...search, ...Object.fromEntries(new URLSearchParams(qs)) } }
}

export function AttentionQueue({
  items,
  search,
}: {
  items: AttentionItem[]
  search: Record<string, unknown>
}) {
  const [all, setAll] = useState(false)
  const sorted = [...items].sort((a, b) => ORDER[a.severity] - ORDER[b.severity])
  const shown = all ? sorted : sorted.slice(0, 6)
  return (
    <SectionCard
      title="Attention required"
      description="Information requests, inactive companies, clinic preparation gaps, overdue actions, report revisions and marketplace reviews."
      action={
        <span className="rounded-full bg-danger-soft px-2.5 py-0.5 font-semibold text-danger text-xs">
          {items.length} open
        </span>
      }
    >
      {items.length === 0 ? (
        <p className="flex items-center gap-2 text-muted-foreground text-sm">
          <CheckCircle2 className="size-4 text-success" aria-hidden /> Nothing needs attention for
          this scope.
        </p>
      ) : (
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
          {shown.map((it) => {
            const sev = SEV[it.severity]
            const Icon = sev.icon
            return (
              <li key={it.id}>
                <Link
                  {...withFilters(it.to, search)}
                  className="group flex items-center gap-3 rounded-xl border p-3 transition-colors hover:border-blue/40 hover:bg-surface focus-visible:outline-2"
                >
                  <span
                    className={cn('grid size-8 shrink-0 place-items-center rounded-lg', sev.cls)}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-navy text-sm">
                      {it.target}
                    </span>
                    <span className="block truncate text-muted-foreground text-xs">
                      {sev.text} · {it.label}
                    </span>
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      {sorted.length > 6 ? (
        <Button variant="ghost" size="sm" className="mt-3" onClick={() => setAll((v) => !v)}>
          {all ? 'Show fewer' : `Show all ${sorted.length}`}
        </Button>
      ) : null}
    </SectionCard>
  )
}
