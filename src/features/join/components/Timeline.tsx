import type { TimelineEvent } from '@shared/types'
import { Circle } from 'lucide-react'
import { formatDateTime } from '@/lib/format'

/** Vertical activity timeline of every application transition (newest last). */
export function ApplicationTimeline({ events }: { events: TimelineEvent[] }) {
  const sorted = events
  return (
    <ol className="relative grid gap-5 border-s ps-6">
      {sorted.map((e, i) => (
        <li key={e.id} className="relative">
          <span
            aria-hidden
            className="absolute -start-[1.95rem] top-0.5 grid size-4 place-items-center rounded-full bg-card"
          >
            <Circle
              className={
                i === sorted.length - 1 ? 'size-3.5 fill-blue text-blue' : 'size-3.5 text-border'
              }
            />
          </span>
          <p className="font-medium text-navy text-sm">{e.label}</p>
          <p className="text-muted-foreground text-xs">
            {e.actor} · {formatDateTime(e.at)}
          </p>
          {e.note ? <p className="mt-1 rounded-lg bg-surface px-3 py-2 text-sm">{e.note}</p> : null}
        </li>
      ))}
    </ol>
  )
}
