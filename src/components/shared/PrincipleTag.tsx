import { principleById } from '@shared/reference'
import type { PrincipleId } from '@shared/types'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

/** Principle tag linking to its official page. A navigation theme, not a certification level. */
export function PrincipleTag({
  id,
  className,
  linked = true,
}: {
  id: PrincipleId
  className?: string
  linked?: boolean
}) {
  const p = principleById(id)
  const inner = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 font-medium text-navy text-xs',
        className,
      )}
    >
      <img src={p.icon} alt="" className="size-4 rounded-full" />
      <span>
        P{p.id} · {p.short}
      </span>
    </span>
  )
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {linked ? (
          <a
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full focus-visible:outline-2"
            aria-label={`Principle ${p.id}: ${p.title} (opens weps.org)`}
          >
            {inner}
          </a>
        ) : (
          <span>{inner}</span>
        )}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-semibold">{p.title}</p>
        <p className="opacity-80">{p.description}</p>
      </TooltipContent>
    </Tooltip>
  )
}
