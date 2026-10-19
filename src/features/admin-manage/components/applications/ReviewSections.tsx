import type { ApplicationData, ContactPerson } from '@shared/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { JOIN_STEPS } from '@/features/join/join-utils'

const dash = (v?: string) => (v?.trim() ? v : 'Not provided')
const label = (v?: string) =>
  v ? v.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()) : 'Not provided'
const person = (p: ContactPerson) => `${p.firstName} ${p.lastName}`.trim() || 'Not provided'

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-3 sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-0.5">
          <dt className="text-muted-foreground text-xs">{k}</dt>
          <dd className="break-words text-navy text-sm">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

function GenderBars({ data }: { data: ApplicationData['genderBalance'] }) {
  const items: [string, string | undefined][] = [
    ['Employees', data.employees],
    ['Management', data.management],
    ['Board', data.board],
    ...(data.investmentCommittee
      ? ([['Investment committee', data.investmentCommittee]] as [string, string][])
      : []),
  ]
  return (
    <div
      className="mt-4 grid gap-3 rounded-xl bg-surface p-4"
      role="img"
      aria-label={items.map(([k, v]) => `${k}: ${v ?? 0} percent women`).join(', ')}
    >
      {items.map(([k, v]) => {
        const n = Math.max(0, Math.min(100, Number(v) || 0))
        return (
          <div key={k} className="grid gap-1">
            <div className="flex justify-between text-xs">
              <span>{k}</span>
              <span className="font-medium text-navy">{n}% women</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-card">
              <div className="h-full rounded-full bg-blue" style={{ width: `${n}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ReviewSections({ data }: { data: ApplicationData }) {
  const c = data.company
  const sections: Record<string, React.ReactNode> = {
    company: (
      <Rows
        rows={[
          ['Company', dash(c.name)],
          ['Sector', dash(c.sector)],
          ['Region', dash(c.region)],
          ['Country', dash(c.country)],
          ['Website', dash(c.website)],
          ['Employees', dash(c.employeeCount)],
          ['Ownership', label(c.ownership)],
          ['Ownership by gender', label(c.ownerGender)],
          ['UN Global Compact member', label(c.ungcMember)],
          [
            'Asset owner',
            c.isAssetOwner === 'yes' ? `Yes, ${dash(c.fundName)}` : label(c.isAssetOwner),
          ],
        ]}
      />
    ),
    presence: (
      <Rows
        rows={[
          ['Other countries', data.presence.otherCountries.join(', ') || 'None'],
          ['Legally registered', label(data.presence.legallyRegistered)],
        ]}
      />
    ),
    executive: (
      <Rows
        rows={[
          ['Name', person(data.executive)],
          ['Title', dash(data.executive.title)],
          ['Email', dash(data.executive.email)],
          ['Gender', label(data.executive.gender)],
          ['CEO line', dash(data.executive.quote)],
        ]}
      />
    ),
    contacts: (
      <Rows
        rows={[
          ['Primary contact', person(data.contacts.primary)],
          ['Primary email', dash(data.contacts.primary.email)],
          ['Primary phone', dash(data.contacts.primary.phone)],
          ['Secondary contact', person(data.contacts.secondary)],
          ['Secondary email', dash(data.contacts.secondary.email)],
          ['Secondary phone', dash(data.contacts.secondary.phone)],
        ]}
      />
    ),
    gender: <GenderBars data={data.genderBalance} />,
    plans: <Rows rows={[['Gender Action Plan', label(data.plans.hasGenderActionPlan)]]} />,
    referral: (
      <Rows
        rows={[
          ['Heard about WEPs via', dash(data.referral.source)],
          ['Details', dash(data.referral.details)],
          [
            'Interest in contributing (optional, not a condition)',
            label(data.referral.contributionInterest),
          ],
        ]}
      />
    ),
  }
  return (
    <Accordion type="multiple" defaultValue={['company', 'executive', 'gender']}>
      {JOIN_STEPS.filter((s) => sections[s.key]).map((s) => (
        <AccordionItem key={s.key} value={s.key}>
          <AccordionTrigger className="font-heading font-semibold text-navy">
            {s.n}. {s.label}
          </AccordionTrigger>
          <AccordionContent>{sections[s.key]}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
