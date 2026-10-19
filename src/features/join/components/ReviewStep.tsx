import type { ApplicationData, ApplicationDocument } from '@shared/types'
import { AlertTriangle, CheckCircle2, FileText, ListChecks, Pencil } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DOC_LABEL, JOIN_STEPS, type JoinIssue } from '../join-utils'
import { STEP_ICONS } from './step-icons'

const dash = (v?: string) => (v?.trim() ? v : 'Not provided')
const yn = (v?: string) =>
  ({ yes: 'Yes', no: 'No', in_progress: 'In development', maybe: 'Maybe later' })[v ?? ''] ??
  dash(v)

function Group({
  step,
  onEdit,
  rows,
  children,
}: {
  step: number
  onEdit: (n: number) => void
  rows?: [string, string][]
  children?: ReactNode
}) {
  const meta = JOIN_STEPS[step - 1]
  const Icon = STEP_ICONS[step - 1] ?? ListChecks
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: step * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl border bg-white shadow-card transition-shadow duration-300 hover:shadow-lift"
      aria-labelledby={`rv-${step}`}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,var(--gold),var(--blue))]"
      />
      <div className="flex items-center justify-between gap-3 border-b bg-[linear-gradient(100deg,var(--blue-50),#fff_65%)] py-3 ps-5 pe-3 sm:ps-6">
        <h3
          id={`rv-${step}`}
          className="flex items-center gap-3 font-heading font-semibold text-navy"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-blue shadow-[var(--shadow-field)] ring-1 ring-blue-100">
            <Icon className="size-4" aria-hidden />
          </span>
          <span>
            <span className="block font-medium font-sans text-[11px] text-muted-foreground uppercase tracking-wider">
              Step {step}
            </span>
            {meta?.label}
          </span>
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full bg-white hover:border-blue/40 hover:text-blue"
          onClick={() => onEdit(step)}
        >
          <Pencil aria-hidden /> Edit<span className="sr-only"> {meta?.label}</span>
        </Button>
      </div>
      <div className="p-4 ps-5 sm:p-5 sm:ps-6">
        {rows ? (
          <dl className="grid grid-cols-[minmax(0,1fr)] gap-3 text-sm sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div
                key={k}
                className={cn(
                  'grid gap-0.5 rounded-xl border border-blue-100/70 bg-surface/70 px-3.5 py-2.5',
                  v.length > 60 && 'sm:col-span-2',
                )}
              >
                <dt className="text-muted-foreground text-xs">{k}</dt>
                <dd
                  className={cn(
                    'break-words font-medium',
                    v === 'Not provided' ? 'text-muted-foreground italic' : 'text-navy',
                  )}
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {children}
      </div>
    </motion.section>
  )
}

export function ReviewStep({
  data,
  documents,
  issues,
  onEdit,
}: {
  data: ApplicationData
  documents: ApplicationDocument[]
  issues: JoinIssue[]
  onEdit: (n: number) => void
}) {
  const { company: c, executive: e, genderBalance: g } = data
  const pct = (v?: string) => (v ? `${v}%` : 'Not provided')
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      {issues.length > 0 ? (
        <div
          role="alert"
          className="rounded-2xl border border-warning/30 bg-[linear-gradient(120deg,var(--warning-soft),#fff)] p-4 shadow-card sm:p-5"
        >
          <p className="mb-2 flex items-center gap-2 font-semibold text-navy text-sm">
            <AlertTriangle className="size-4 text-warning" aria-hidden />
            {issues.length} {issues.length === 1 ? 'item needs' : 'items need'} attention before you
            can submit
          </p>
          <ul className="grid gap-1 text-sm">
            {issues.map((i) => (
              <li key={i.field} className="flex flex-wrap items-center gap-x-2">
                <span>{i.message}</span>
                <button
                  type="button"
                  className="font-medium text-blue underline-offset-2 hover:underline"
                  onClick={() => onEdit(i.step)}
                >
                  Go to step {i.step}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-[linear-gradient(120deg,var(--success-soft),#fff)] p-4 text-sm shadow-card sm:p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success text-white shadow-[0_6px_16px_-6px_rgb(31_138_91/0.8)]">
            <CheckCircle2 className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-heading font-semibold text-navy">
              Everything required is complete. Review and submit.
            </p>
            <p className="text-muted-foreground text-xs">
              Check each section below. You can still edit any step.
            </p>
          </div>
        </div>
      )}
      <Group
        step={1}
        onEdit={onEdit}
        rows={[
          ['Company', dash(c.name)],
          ['Sector', dash(c.sector)],
          ['Headquarters', `${dash(c.country)}${c.region ? `, ${c.region}` : ''}`],
          ['Employees', dash(c.employeeCount)],
          ['UN Global Compact member', yn(c.ungcMember)],
          [
            'Asset owner',
            c.isAssetOwner === 'yes' ? `Yes, ${dash(c.fundName)}` : yn(c.isAssetOwner),
          ],
        ]}
      />
      <Group
        step={2}
        onEdit={onEdit}
        rows={[
          ['Other countries', data.presence.otherCountries.join(', ') || 'None selected'],
          ['Legally registered', yn(data.presence.legallyRegistered)],
        ]}
      />
      <Group
        step={3}
        onEdit={onEdit}
        rows={[
          ['Chief Executive', `${e.firstName} ${e.lastName}`.trim() || 'Not provided'],
          ['Email', dash(e.email)],
          ['Title', dash(e.title)],
          ['CEO line', dash(e.quote)],
        ]}
      >
        <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-2 text-sm">
          {(['ceo_statement', 'registration', 'ceo_portrait'] as const).map((k) => {
            const d = documents.find((x) => x.kind === k)
            return (
              <li
                key={k}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2',
                  d ? 'border-success/25 bg-success-soft/50' : 'border-danger/25 bg-danger-soft/50',
                )}
              >
                <FileText
                  className={cn('size-4 shrink-0', d ? 'text-success' : 'text-danger')}
                  aria-hidden
                />
                <span className="min-w-0 truncate">
                  {DOC_LABEL[k]}:{' '}
                  {d ? (
                    <span className="text-navy">{d.fileName}</span>
                  ) : (
                    <span className="text-danger">missing</span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </Group>
      <Group
        step={4}
        onEdit={onEdit}
        rows={[
          [
            'Primary contact',
            `${data.contacts.primary.firstName} ${data.contacts.primary.lastName} · ${dash(data.contacts.primary.email)}`,
          ],
          [
            'Secondary contact',
            data.contacts.secondary.email
              ? `${data.contacts.secondary.firstName} ${data.contacts.secondary.lastName} · ${data.contacts.secondary.email}`
              : 'None',
          ],
        ]}
      />
      <Group
        step={5}
        onEdit={onEdit}
        rows={[
          ['Women, employees', pct(g.employees)],
          ['Women, management', pct(g.management)],
          ['Women, board', pct(g.board)],
          ...(c.isAssetOwner === 'yes'
            ? ([['Women, investment committee', pct(g.investmentCommittee)]] as [string, string][])
            : []),
        ]}
      />
      <Group
        step={6}
        onEdit={onEdit}
        rows={[['Gender Action Plan', yn(data.plans.hasGenderActionPlan)]]}
      />
      <Group
        step={7}
        onEdit={onEdit}
        rows={[
          ['Heard about WEPs via', dash(data.referral.source)],
          ['Details', dash(data.referral.details)],
          ['Interest in contributing (optional)', yn(data.referral.contributionInterest)],
        ]}
      />
    </div>
  )
}
