import type { Application } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, Mail, SearchCheck, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'

const NEXT = [
  {
    icon: Mail,
    title: 'Confirmation email',
    text: 'A copy of this reference is on its way to the CEO’s email address.',
  },
  {
    icon: SearchCheck,
    title: 'UN Women review',
    text: 'The team checks your documents and details, usually within 10 working days.',
  },
  {
    icon: ShieldCheck,
    title: 'Workspace activated',
    text: 'On approval your CEO account is created and the full portal unlocks.',
  },
]

export function SuccessScreen({ application }: { application: Application }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border bg-white p-6 shadow-lift sm:p-10"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--gold),var(--blue)_45%,var(--navy))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(31,138,91,0.12),transparent_70%)]"
      />
      <div className="relative grid place-items-center gap-3 text-center">
        <span className="relative grid size-20 place-items-center">
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-success/20"
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.6, repeat: 2, ease: 'easeOut' }}
          />
          <motion.span
            className="relative grid size-20 place-items-center rounded-full bg-success text-white shadow-[0_14px_30px_-12px_rgb(31_138_91/0.9)] ring-8 ring-success-soft"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.15 }}
          >
            <CheckCircle2 className="size-10" aria-hidden />
          </motion.span>
        </span>
        <h2 className="font-bold font-heading text-3xl text-navy">Application submitted</h2>
        <p className="max-w-lg text-muted-foreground">
          Thank you, {application.data.company.name}. Your commitment to the Women’s Empowerment
          Principles is now with UN Women for review.
        </p>
      </div>
      <dl className="relative mx-auto mt-8 grid max-w-2xl gap-4 rounded-2xl border border-blue-100/80 bg-[linear-gradient(160deg,var(--blue-50),var(--surface))] p-5 sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground text-xs">Application reference</dt>
          <dd className="font-heading font-semibold text-navy">{application.reference}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Submitted</dt>
          <dd className="font-medium text-navy">{formatDate(application.submittedAt)}</dd>
        </div>
        <div>
          <dt className="mb-1 text-muted-foreground text-xs">Status</dt>
          <dd>
            <WorkflowStatus status={application.status} />
          </dd>
        </div>
      </dl>
      <h3 className="mt-8 mb-3 text-center font-heading font-semibold text-navy">
        What happens next
      </h3>
      <ol className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
        {NEXT.map((n, i) => (
          <motion.li
            key={n.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
            whileHover={{ y: -4 }}
            className="rounded-xl border bg-white p-4 text-sm shadow-card transition-shadow hover:shadow-lift"
          >
            <span className="mb-3 flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue ring-1 ring-blue/15">
                <n.icon className="size-4" aria-hidden />
              </span>
              <span className="font-bold font-heading text-2xl text-navy/10">0{i + 1}</span>
            </span>
            <p className="font-semibold text-navy">{n.title}</p>
            <p className="text-muted-foreground">{n.text}</p>
          </motion.li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" variant="gloss-blue">
          <Link to="/application-status">
            Track my application <ArrowRight aria-hidden />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="bg-white">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </motion.div>
  )
}
