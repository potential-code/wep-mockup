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
      className="rounded-2xl border bg-card p-6 shadow-card sm:p-10"
    >
      <div className="grid place-items-center gap-3 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="size-9" aria-hidden />
        </span>
        <h2 className="text-section text-navy">Application submitted</h2>
        <p className="max-w-lg text-muted-foreground">
          Thank you, {application.data.company.name}. Your commitment to the Women’s Empowerment
          Principles is now with UN Women for review.
        </p>
      </div>
      <dl className="mx-auto mt-8 grid max-w-2xl gap-4 rounded-2xl bg-surface p-5 sm:grid-cols-3">
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
        {NEXT.map((n) => (
          <li key={n.title} className="rounded-xl border p-4 text-sm">
            <n.icon className="mb-2 size-5 text-blue" aria-hidden />
            <p className="font-semibold text-navy">{n.title}</p>
            <p className="text-muted-foreground">{n.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link to="/application-status">
            Track my application <ArrowRight aria-hidden />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </motion.div>
  )
}
