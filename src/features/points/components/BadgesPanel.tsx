import { CalendarCheck2, Target } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { celebrate } from '@/components/motion/Celebrate'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Achievement } from './achievements'
import { BadgeMedal } from './BadgeMedal'

const EASE = [0.32, 0.72, 0, 1] as const

export function ProgressLine({ a, className }: { a: Achievement; className?: string }) {
  const pct = Math.round((a.current / a.target) * 100)
  return (
    <div className={cn('grid gap-1', className)}>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={a.target}
        aria-valuenow={a.current}
        aria-label={`${a.label} progress`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue to-blue-600"
          style={{ width: `${Math.max(4, pct)}%` }}
        />
      </div>
      <span className="text-muted-foreground text-xs tabular-nums">
        {a.current.toLocaleString('en-GB')} of {a.target.toLocaleString('en-GB')} {a.unit}
      </span>
    </div>
  )
}

/** Achievement wall: earned medals in colour, locked ones greyed with progress, each opens detail. */
export function BadgesPanel({ achievements }: { achievements: Achievement[] }) {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState<Achievement | null>(null)
  const earned = achievements.filter((a) => a.earned).length
  const ordered = [...achievements].sort((a, b) => Number(b.earned) - Number(a.earned))

  return (
    <section
      aria-labelledby="badges-heading"
      className="rounded-[1.75rem] bg-navy/[0.04] p-1.5 ring-1 ring-navy/[0.06]"
    >
      <div className="rounded-[calc(1.75rem-0.375rem)] bg-card p-5 shadow-card sm:p-7">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-1">
            <span className="w-fit rounded-full bg-gold-50 px-3 py-1 font-semibold text-[0.65rem] text-gold-700 uppercase tracking-[0.2em] ring-1 ring-gold/30">
              Achievements
            </span>
            <h2 id="badges-heading" className="font-heading font-semibold text-2xl text-navy">
              Your badge collection
            </h2>
            <p className="text-muted-foreground text-sm">
              Select a badge to see how it was earned or what is left to do.
            </p>
          </div>
          <div className="grid min-w-44 gap-1.5">
            <p className="text-end font-heading font-semibold text-navy tabular-nums">
              {earned}{' '}
              <span className="font-normal text-muted-foreground">
                of {achievements.length} earned
              </span>
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-gold to-gold-700"
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: earned / achievements.length }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: EASE }}
                style={{ originX: 0, scaleX: reduce ? earned / achievements.length : undefined }}
              />
            </div>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ordered.map((a, i) => (
            <motion.li
              key={a.id}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: EASE, delay: Math.min(i, 9) * 0.04 }}
              className="min-w-0"
            >
              <button
                type="button"
                onClick={() => {
                  setOpen(a)
                  if (a.earned) celebrate({ y: 0.45 })
                }}
                aria-label={`${a.label}: ${a.earned ? 'earned' : 'locked'}. Show details`}
                className={cn(
                  'group relative grid h-full w-full justify-items-center gap-2 overflow-hidden rounded-2xl border px-3 pt-5 pb-4 text-center outline-none transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]',
                  a.earned
                    ? 'border-gold/25 bg-[radial-gradient(120%_70%_at_50%_0%,var(--gold-50),#fff_70%)]'
                    : 'border-dashed bg-surface/60',
                )}
              >
                <BadgeMedal icon={a.icon} tier={a.tier} earned={a.earned} size="md" />
                <span
                  className={cn(
                    'font-heading font-semibold text-sm leading-tight',
                    a.earned ? 'text-navy' : 'text-muted-foreground',
                  )}
                >
                  {a.label}
                </span>
                {a.earned ? (
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 font-medium text-[0.7rem] text-gold-700">
                    {a.earnedAt
                      ? `Earned ${formatDate(a.earnedAt, { day: 'numeric', month: 'short' })}`
                      : 'Earned'}
                  </span>
                ) : (
                  <ProgressLine a={a} className="w-full" />
                )}
              </button>
            </motion.li>
          ))}
        </ul>
      </div>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-md">
          {open ? (
            <>
              <div
                className={cn(
                  'relative grid place-items-center px-6 pt-10 pb-8',
                  open.earned
                    ? 'bg-[radial-gradient(70%_80%_at_50%_30%,rgba(214,164,74,0.35),transparent_70%),linear-gradient(160deg,var(--navy-900),var(--navy))]'
                    : 'bg-[linear-gradient(160deg,var(--surface),#e9eff5)]',
                )}
              >
                <motion.div
                  initial={reduce ? false : { scale: 0.6, rotate: -12, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 15 }}
                >
                  <BadgeMedal icon={open.icon} tier={open.tier} earned={open.earned} size="xl" />
                </motion.div>
              </div>
              <div className="grid gap-4 p-6">
                <DialogHeader className="text-center sm:text-center">
                  <DialogTitle className="font-heading text-2xl text-navy">
                    {open.label}
                  </DialogTitle>
                  <DialogDescription>
                    {open.earned ? open.description : 'You have not earned this badge yet.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 rounded-2xl bg-surface p-4 text-sm">
                  <p className="flex items-start gap-2">
                    <Target className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
                    <span>
                      <span className="block font-medium text-navy">How to earn it</span>
                      {open.criteria}
                    </span>
                  </p>
                  {open.earned ? (
                    <p className="flex items-start gap-2">
                      <CalendarCheck2
                        className="mt-0.5 size-4 shrink-0 text-gold-700"
                        aria-hidden
                      />
                      <span>
                        <span className="block font-medium text-navy">Earned</span>
                        {open.earnedAt ? formatDate(open.earnedAt) : 'Yes'}
                      </span>
                    </p>
                  ) : (
                    <ProgressLine a={open} />
                  )}
                </div>
                <p className="text-center text-muted-foreground text-xs">
                  Badges recognise learning and contribution. They are a record only and are never
                  spent.
                </p>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}
