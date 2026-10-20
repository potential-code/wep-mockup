import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { JOIN_STEPS } from '../join-utils'

const ease = [0.22, 1, 0.36, 1] as const

export function Stepper({
  step,
  maxStep,
  onGo,
}: {
  step: number
  maxStep: number
  onGo: (n: number) => void
}) {
  const total = JOIN_STEPS.length
  const current = JOIN_STEPS[step - 1]
  const pct = Math.round(((step - 1) / (total - 1)) * 100)
  return (
    <nav aria-label="Application progress">
      {/* compact: phones and narrow split layouts */}
      <div className="md:hidden">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <p className="font-heading font-medium text-navy">
            Step {step} <span className="font-normal text-muted-foreground">of {total}</span>
          </p>
          <p className="truncate font-medium text-blue text-sm">{current?.label}</p>
        </div>
        <ol className="grid grid-cols-8 gap-1.5" aria-hidden>
          {JOIN_STEPS.map((s) => (
            <li key={s.key} className="h-1.5 overflow-hidden rounded-full bg-blue-100/70">
              <motion.span
                className="block h-full rounded-full bg-[linear-gradient(90deg,var(--blue),var(--navy))]"
                initial={false}
                animate={{ width: s.n <= step ? '100%' : '0%' }}
                transition={{ duration: 0.5, ease }}
              />
            </li>
          ))}
        </ol>
      </div>

      <div className="relative hidden md:block">
        {/* track sits behind the circles, from the first centre to the last */}
        <div
          aria-hidden
          className="absolute top-[18px] h-1 rounded-full bg-blue-100/70"
          style={{ left: `${50 / total}%`, right: `${50 / total}%` }}
        >
          <motion.div
            className="relative h-full rounded-full bg-[linear-gradient(90deg,var(--coral),var(--blue)_35%,var(--navy))]"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease }}
          >
            <span className="-right-1 -translate-y-1/2 absolute top-1/2 size-2 rounded-full bg-coral shadow-[0_0_10px_2px_rgb(240_73_62/0.7)]" />
          </motion.div>
        </div>
        <ol className="relative flex items-start">
          {JOIN_STEPS.map((s) => {
            const done = s.n < step
            const active = s.n === step
            const reachable = s.n <= maxStep
            return (
              <li key={s.key} className="flex flex-1 flex-col items-center text-center">
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => onGo(s.n)}
                  aria-current={active ? 'step' : undefined}
                  className="group grid justify-items-center gap-2 rounded-xl px-1 pb-1 disabled:cursor-default"
                >
                  <span className="relative grid size-10 place-items-center">
                    {active ? (
                      <motion.span
                        layoutId="join-step-halo"
                        aria-hidden
                        className="absolute inset-[-6px] rounded-full bg-blue/15 ring-1 ring-blue/25"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    ) : null}
                    <span
                      className={cn(
                        'relative grid size-10 place-items-center rounded-full border-2 font-heading font-semibold text-sm transition-all duration-300',
                        done &&
                          'border-transparent bg-[linear-gradient(140deg,var(--blue),var(--navy))] text-white shadow-[0_6px_14px_-6px_rgb(0_119_182/0.8)] group-hover:scale-110',
                        active &&
                          'border-white bg-navy text-white shadow-[0_8px_20px_-6px_rgb(38_57_85/0.7)]',
                        !done &&
                          !active &&
                          'border-blue-100 bg-white text-muted-foreground shadow-[var(--shadow-field)]',
                        !done &&
                          !active &&
                          reachable &&
                          'group-hover:border-blue/50 group-hover:text-blue',
                      )}
                    >
                      {done ? (
                        <motion.span
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        >
                          <Check className="size-4" strokeWidth={3} aria-hidden />
                        </motion.span>
                      ) : (
                        s.n
                      )}
                      <span className="sr-only">{done ? ' (completed)' : ''}</span>
                    </span>
                  </span>
                  <span
                    className={cn(
                      'max-w-[6.5rem] text-xs leading-tight transition-colors',
                      active
                        ? 'font-semibold text-navy'
                        : done
                          ? 'text-navy/80 group-hover:text-blue'
                          : 'text-muted-foreground',
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
