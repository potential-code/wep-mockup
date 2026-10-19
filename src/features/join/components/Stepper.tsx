import { Check } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { JOIN_STEPS } from '../join-utils'

export function Stepper({
  step,
  maxStep,
  onGo,
}: {
  step: number
  maxStep: number
  onGo: (n: number) => void
}) {
  const current = JOIN_STEPS[step - 1]
  return (
    <nav aria-label="Application progress">
      <div className="md:hidden">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="font-heading font-semibold text-navy">
            Step {step} of {JOIN_STEPS.length}
          </p>
          <p className="text-muted-foreground text-sm">{current?.label}</p>
        </div>
        <Progress value={(step / JOIN_STEPS.length) * 100} aria-label="Application progress" />
      </div>
      <ol className="hidden items-start md:flex">
        {JOIN_STEPS.map((s, i) => {
          const done = s.n < step
          const active = s.n === step
          const reachable = s.n <= maxStep
          return (
            <li key={s.key} className="relative flex flex-1 flex-col items-center text-center">
              {i > 0 ? (
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-4 right-1/2 h-0.5 w-full',
                    s.n <= step ? 'bg-blue' : 'bg-border',
                  )}
                />
              ) : null}
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onGo(s.n)}
                aria-current={active ? 'step' : undefined}
                className="group relative z-10 grid justify-items-center gap-2 disabled:cursor-default"
              >
                <span
                  className={cn(
                    'grid size-8 place-items-center rounded-full border-2 font-semibold text-xs transition-colors',
                    done && 'border-blue bg-blue text-white',
                    active && 'border-blue bg-card text-blue ring-4 ring-blue/15',
                    !done && !active && 'border-border bg-card text-muted-foreground',
                  )}
                >
                  {done ? <Check className="size-4" aria-hidden /> : s.n}
                  <span className="sr-only">{done ? ' (completed)' : ''}</span>
                </span>
                <span
                  className={cn(
                    'max-w-[6.5rem] text-xs leading-tight',
                    active ? 'font-semibold text-navy' : 'text-muted-foreground',
                  )}
                >
                  {s.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
