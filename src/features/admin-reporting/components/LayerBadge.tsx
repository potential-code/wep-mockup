import { Activity, ClipboardList, FileCheck2, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LAYERS, type Layer } from './metric-definitions'

const STYLE: Record<Layer, { icon: LucideIcon; cls: string }> = {
  activity: { icon: Activity, cls: 'bg-blue-50 text-blue-600 ring-blue/25' },
  evidence: { icon: FileCheck2, cls: 'bg-coral-50 text-coral-700 ring-coral/35' },
  outcomes: { icon: ClipboardList, cls: 'bg-secondary text-navy ring-navy/20' },
}

/** Marks which evidence layer a metric belongs to. Icon + text, never colour alone. */
export function LayerBadge({ layer, className }: { layer: Layer; className?: string }) {
  const { icon: Icon, cls } = STYLE[layer]
  return (
    <span
      title={LAYERS[layer].description}
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 font-medium text-[11px] ring-1 ring-inset',
        cls,
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {LAYERS[layer].label}
    </span>
  )
}

/** Dashboard section heading that introduces one layer. */
export function LayerHeading({ layer }: { layer: Layer }) {
  const { icon: Icon, cls } = STYLE[layer]
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className={cn('grid size-7 place-items-center rounded-lg ring-1 ring-inset', cls)}>
        <Icon className="size-4" aria-hidden />
      </span>
      <h2 className="font-heading font-medium text-navy">{LAYERS[layer].label}</h2>
      <p className="text-muted-foreground text-sm">{LAYERS[layer].description}</p>
    </div>
  )
}
