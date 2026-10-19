import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BookingStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Booking progress">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li
            key={label}
            aria-current={active ? 'step' : undefined}
            className="grid gap-1.5 text-center sm:text-left"
          >
            <span
              className={cn('h-1.5 rounded-full', done || active ? 'bg-blue' : 'bg-border')}
              aria-hidden
            />
            <span
              className={cn(
                'flex items-center justify-center gap-1.5 text-xs sm:justify-start sm:text-sm',
                active ? 'font-semibold text-navy' : 'text-muted-foreground',
              )}
            >
              {done ? (
                <Check className="size-3.5 text-success" aria-hidden />
              ) : (
                <span className="hidden sm:inline">{i + 1}.</span>
              )}
              <span className="truncate">{label}</span>
              {done ? <span className="sr-only">(completed)</span> : null}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
