import { DEMO_RULES } from '@shared/rules'
import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarCheck, CheckCircle2, Circle, Lock, LockOpen } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'
import type { Eligibility } from '@/queries/clinics.queries'

/**
 * Shows exactly what stands between a learner and a clinic: lessons, qualifying points and the
 * remaining checklist. When eligible it turns into a Register action with an unlock animation.
 * Registration never spends points.
 */
export function EligibilityPanel({
  eligibility,
  eventTitle,
  registered,
  onRegister,
  registering,
  className,
  footer,
}: {
  eligibility: Eligibility
  eventTitle?: string
  /** Hide the register action (already registered / waitlisted / past). */
  registered?: boolean
  onRegister?: () => void
  registering?: boolean
  className?: string
  footer?: ReactNode
}) {
  const reduced = usePrefersReducedMotion()
  const e = eligibility
  const required = e.required || DEMO_RULES.qualifyingPointsForClinic
  const pointsPct = Math.min(100, Math.round((e.qualifying / Math.max(1, required)) * 100))
  const lessonsPct = e.lessonsTotal ? Math.round((e.lessonsDone / e.lessonsTotal) * 100) : 100
  const Icon = e.eligible ? LockOpen : Lock

  return (
    <section
      aria-label="Clinic eligibility"
      className={cn(
        'overflow-hidden rounded-2xl border bg-card shadow-card transition-colors',
        e.eligible ? 'border-success/40 bg-success-soft/30' : '',
        className,
      )}
    >
      <div className="grid gap-4 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <motion.span
            key={String(e.eligible)}
            initial={reduced ? false : { scale: 0.6, rotate: -18 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14 }}
            className={cn(
              'grid size-11 shrink-0 place-items-center rounded-xl',
              e.eligible ? 'bg-success text-white' : 'bg-secondary text-navy',
            )}
          >
            <Icon className="size-5" aria-hidden />
          </motion.span>
          <div className="grid gap-0.5">
            <h3 className="font-heading font-semibold text-navy">
              {registered
                ? 'You are registered'
                : e.eligible
                  ? 'You are eligible to register'
                  : 'Unlock this clinic'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {e.eligible
                ? `You have met every requirement${eventTitle ? ` for ${eventTitle}` : ''}. Registration is free and spends no points.`
                : 'Finish the designated pathway course and reach the qualifying points below.'}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Meter
            label={e.courseTitle ? `Lessons in ${e.courseTitle}` : 'Lessons'}
            value={`${e.lessonsDone} of ${e.lessonsTotal}`}
            pct={lessonsPct}
          />
          <Meter
            label="Qualifying learning points"
            value={`${e.qualifying} of ${required}`}
            pct={pointsPct}
          />
        </div>

        {e.remaining.length > 0 ? (
          <div>
            <p className="mb-2 font-medium text-navy text-sm">Still to do</p>
            <ul className="grid gap-1.5 text-sm">
              {e.remaining.map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="size-4" aria-hidden />
            Course complete and qualifying points reached.
          </p>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {registered ? null : e.eligible ? (
            <motion.div
              key="register"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button size="lg" onClick={onRegister} disabled={registering || !onRegister}>
                <CalendarCheck aria-hidden />
                {registering ? 'Registering…' : 'Register for the clinic'}
              </Button>
            </motion.div>
          ) : e.courseId ? (
            <motion.div key="continue" exit={{ opacity: 0 }}>
              <Button asChild>
                <Link to="/portal/learn/$courseId" params={{ courseId: e.courseId }}>
                  Continue learning
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
        {footer}
      </div>
    </section>
  )
}

function Meter({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="grid gap-1.5 rounded-xl bg-muted/60 p-3">
      <div className="grid gap-0.5 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-navy tabular-nums">{value}</span>
      </div>
      <Progress value={pct} aria-label={label} className="h-2" />
    </div>
  )
}
