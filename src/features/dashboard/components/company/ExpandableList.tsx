import { type ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'

/** Shows the first few items and reveals the rest behind a "View all" toggle. */
export function ExpandableList<T>({
  items,
  limit = 3,
  render,
  className = 'grid gap-3',
}: {
  items: T[]
  limit?: number
  render: (item: T) => ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const shown = open ? items : items.slice(0, limit)
  return (
    <div className="grid gap-3">
      <ul className={className}>{shown.map(render)}</ul>
      {items.length > limit ? (
        <Button
          variant="link"
          size="sm"
          className="justify-self-start px-0"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Show fewer' : `View all ${items.length}`}
        </Button>
      ) : null}
    </div>
  )
}
