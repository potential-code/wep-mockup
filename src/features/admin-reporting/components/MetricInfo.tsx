import { Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { LayerBadge } from './LayerBadge'
import { METRICS, type MetricKey } from './metric-definitions'

/** Info popover with a metric's definition and denominator (brief §23). */
export function MetricInfo({ metric, label }: { metric: MetricKey; label?: string }) {
  const m = METRICS[metric]
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Definition of ${m.name}`}
          className={
            label
              ? 'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-muted-foreground text-xs hover:bg-muted hover:text-blue focus-visible:outline-2'
              : 'inline-grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-blue focus-visible:outline-2'
          }
        >
          <Info className="size-4" aria-hidden />
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm" align="start">
        <p className="font-heading font-medium text-navy">{m.name}</p>
        <dl className="mt-2 grid gap-2">
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Definition</dt>
            <dd>{m.definition}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Denominator</dt>
            <dd>{m.denominator}</dd>
          </div>
        </dl>
        <div className="mt-3">
          <LayerBadge layer={m.layer} />
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Compact list of all definitions used on a page. */
export function DefinitionsList({ metrics }: { metrics: MetricKey[] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {metrics.map((k) => (
        <div key={k} className="rounded-xl border bg-surface/50 p-4 text-sm">
          <dt className="flex items-center justify-between gap-2 font-semibold text-navy">
            {METRICS[k].name}
            <LayerBadge layer={METRICS[k].layer} />
          </dt>
          <dd className="mt-1 text-muted-foreground">{METRICS[k].definition}</dd>
          <dd className="mt-1">
            <span className="font-medium text-navy">Denominator: </span>
            <span className="text-muted-foreground">{METRICS[k].denominator}</span>
          </dd>
        </div>
      ))}
    </dl>
  )
}
