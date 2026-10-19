import type { ApplicationData, ApplicationDocument } from '@shared/types'
import { AlertTriangle, CheckCircle2, FileText, Pencil } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { DOC_LABEL, JOIN_STEPS, type JoinIssue } from '../join-utils'

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
  return (
    <section className="rounded-2xl border bg-card p-4 sm:p-5" aria-labelledby={`rv-${step}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 id={`rv-${step}`} className="font-heading font-semibold text-navy">
          {step}. {meta?.label}
        </h3>
        <Button variant="ghost" size="sm" onClick={() => onEdit(step)}>
          <Pencil aria-hidden /> Edit<span className="sr-only"> {meta?.label}</span>
        </Button>
      </div>
      {rows ? (
        <dl className="grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-0.5">
              <dt className="text-muted-foreground text-xs">{k}</dt>
              <dd className="break-words text-navy">{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {children}
    </section>
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
        <div role="alert" className="rounded-2xl border border-warning/30 bg-warning-soft p-4">
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
        <div className="flex items-center gap-2 rounded-2xl border border-success/30 bg-success-soft p-4 text-sm">
          <CheckCircle2 className="size-5 text-success" aria-hidden />
          <p className="font-medium text-navy">
            Everything required is complete. Review and submit.
          </p>
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
        <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-2 border-t pt-3 text-sm sm:grid-cols-2">
          {(['ceo_statement', 'registration', 'ceo_portrait'] as const).map((k) => {
            const d = documents.find((x) => x.kind === k)
            return (
              <li key={k} className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" aria-hidden />
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
