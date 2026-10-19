import { COUNTRIES, OFFICIAL_LINKS, REGIONS, SECTORS } from '@shared/reference'
import type { ApplicationData, ApplicationDocument, ContactPerson } from '@shared/types'
import { ExternalLink, Info } from 'lucide-react'
import { FileDrop, type UploadResult } from '@/components/shared/FileDrop'
import { cn } from '@/lib/utils'
import { validateUpload } from '@/queries/applications.queries'
import {
  GENDER_OPTIONS,
  OWNER_GENDER_OPTIONS,
  OWNERSHIP_OPTIONS,
  REFERRAL_SOURCES,
} from '../join-utils'
import { ChoiceField, FieldGroup, SelectField, TextAreaField, TextField, YES_NO } from './fields'

export interface StepProps {
  data: ApplicationData
  set: (path: string, value: unknown) => void
  err: (field: string) => string | undefined
  documents: ApplicationDocument[]
  setDoc: (kind: ApplicationDocument['kind'], file: UploadResult | null) => void
  showMissing: boolean
}

const docValue = (docs: ApplicationDocument[], kind: ApplicationDocument['kind']) => {
  const d = docs.find((x) => x.kind === kind)
  return d ? { fileName: d.fileName, sizeKb: d.sizeKb } : null
}

export function CompanyStep({ data, set, err }: StepProps) {
  const c = data.company
  return (
    <div className="grid gap-8">
      <FieldGroup>
        <TextField
          className="sm:col-span-2"
          label="Company name"
          required
          value={c.name}
          onChange={(v) => set('company.name', v)}
          error={err('company.name')}
          help="Use the name that appears on your legal registration."
          autoComplete="organization"
        />
        <SelectField
          label="Sector"
          required
          value={c.sector}
          onChange={(v) => set('company.sector', v)}
          options={SECTORS}
          error={err('company.sector')}
        />
        <TextField
          label="Number of employees"
          required
          inputMode="numeric"
          value={c.employeeCount}
          onChange={(v) => set('company.employeeCount', v.replace(/[^\d]/g, ''))}
          error={err('company.employeeCount')}
          help="Total across all countries."
        />
        <SelectField
          label="Region"
          value={c.region}
          onChange={(v) => set('company.region', v)}
          options={REGIONS}
        />
        <SelectField
          label="Country of headquarters"
          required
          value={c.country}
          onChange={(v) => set('company.country', v)}
          options={COUNTRIES}
          error={err('company.country')}
        />
        <TextField
          className="sm:col-span-2"
          label="Website"
          type="url"
          inputMode="url"
          placeholder="https://"
          value={c.website}
          onChange={(v) => set('company.website', v)}
        />
        <SelectField
          label="Ownership"
          value={c.ownership}
          onChange={(v) => set('company.ownership', v)}
          options={OWNERSHIP_OPTIONS}
        />
        <SelectField
          label="Ownership by gender"
          value={c.ownerGender ?? ''}
          onChange={(v) => set('company.ownerGender', v)}
          options={OWNER_GENDER_OPTIONS}
          help="Optional. Helps UN Women report on women-owned businesses."
        />
        <ChoiceField
          label="Member of the UN Global Compact?"
          required
          value={c.ungcMember}
          onChange={(v) => set('company.ungcMember', v)}
          options={YES_NO}
          error={err('company.ungcMember')}
        />
        <ChoiceField
          label="Is your company an asset owner?"
          required
          value={c.isAssetOwner}
          onChange={(v) => set('company.isAssetOwner', v)}
          options={YES_NO}
          error={err('company.isAssetOwner')}
          help="Pension funds, sovereign funds, foundations and insurers that invest on behalf of others."
        />
        {c.isAssetOwner === 'yes' ? (
          <TextField
            className="sm:col-span-2"
            label="Fund name"
            required
            value={c.fundName ?? ''}
            onChange={(v) => set('company.fundName', v)}
            error={err('company.fundName')}
          />
        ) : null}
      </FieldGroup>
    </div>
  )
}

export function PresenceStep({ data, set, err, documents, setDoc, showMissing }: StepProps) {
  const selected = data.presence.otherCountries
  const toggle = (country: string) =>
    set(
      'presence.otherCountries',
      selected.includes(country) ? selected.filter((x) => x !== country) : [...selected, country],
    )
  return (
    <div className="grid gap-8">
      <fieldset className="grid gap-2">
        <legend className="font-medium text-navy text-sm">Other countries where you operate</legend>
        <p className="text-muted-foreground text-xs">
          Select every country where you have offices or staff, besides your headquarters.
        </p>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.filter((x) => x !== data.company.country).map((country) => {
            const on = selected.includes(country)
            return (
              <button
                key={country}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(country)}
                className={cn(
                  'min-h-9 rounded-full border px-3.5 text-sm transition-colors',
                  on
                    ? 'border-blue bg-blue-50 font-medium text-navy'
                    : 'bg-card hover:border-blue/50',
                )}
              >
                {country}
              </button>
            )
          })}
        </div>
      </fieldset>
      <ChoiceField
        label="Is the company legally registered?"
        required
        value={data.presence.legallyRegistered}
        onChange={(v) => set('presence.legallyRegistered', v)}
        options={YES_NO}
        error={err('presence.legallyRegistered')}
      />
      <FileDrop
        label="Legal registration document"
        hint="PDF, JPG or PNG, up to 20 MB"
        accept=".pdf,.jpg,.jpeg,.png"
        required
        showMissing={showMissing}
        sampleName="Commercial_Registration_2026.pdf"
        value={docValue(documents, 'registration')}
        onChange={(f) => setDoc('registration', f)}
        validate={(f) => validateUpload('registration', f.fileName, f.sizeKb)}
      />
    </div>
  )
}

function PersonFields({
  prefix,
  person,
  set,
  err,
  requiredEmail,
  requiredName,
}: {
  prefix: string
  person: ContactPerson
  set: StepProps['set']
  err: StepProps['err']
  requiredEmail?: boolean
  requiredName?: boolean
}) {
  return (
    <FieldGroup>
      <TextField
        label="First name"
        required={requiredName}
        value={person.firstName}
        onChange={(v) => set(`${prefix}.firstName`, v)}
        error={err(`${prefix}.firstName`)}
        autoComplete="given-name"
      />
      <TextField
        label="Last name"
        required={requiredName}
        value={person.lastName}
        onChange={(v) => set(`${prefix}.lastName`, v)}
        error={err(`${prefix}.lastName`)}
        autoComplete="family-name"
      />
      <TextField
        label="Work email"
        type="email"
        inputMode="email"
        required={requiredEmail}
        value={person.email}
        onChange={(v) => set(`${prefix}.email`, v)}
        error={err(`${prefix}.email`)}
        autoComplete="email"
      />
      <TextField
        label="Job title"
        value={person.title}
        onChange={(v) => set(`${prefix}.title`, v)}
      />
      <SelectField
        label="Gender"
        value={person.gender}
        onChange={(v) => set(`${prefix}.gender`, v)}
        options={GENDER_OPTIONS}
        help="Used for aggregated reporting only."
      />
      <TextField
        label="Phone"
        type="tel"
        inputMode="tel"
        value={person.phone ?? ''}
        onChange={(v) => set(`${prefix}.phone`, v)}
      />
    </FieldGroup>
  )
}

export function ExecutiveStep(p: StepProps) {
  const { data, set, err, documents, setDoc, showMissing } = p
  return (
    <div className="grid gap-8">
      <PersonFields
        prefix="executive"
        person={data.executive}
        set={set}
        err={err}
        requiredEmail
        requiredName
      />
      <TextAreaField
        label="A line from your CEO (optional)"
        help="May appear on your public profile once approved. Maximum two sentences."
        value={data.executive.quote}
        onChange={(v) => set('executive.quote', v)}
      />
      <div className="grid gap-5 rounded-2xl border bg-surface/60 p-4 sm:p-5">
        <div className="flex gap-3 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
          <p>
            The CEO statement must be the <strong>official, unmodified template</strong>, signed by
            your CEO.{' '}
            <a
              href={OFFICIAL_LINKS.join}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-blue hover:underline"
            >
              Download the template and guidance on weps.org
              <ExternalLink className="size-3" aria-hidden />
            </a>
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <FileDrop
            label="Signed CEO statement"
            hint="PDF only, up to 20 MB"
            accept=".pdf"
            required
            showMissing={showMissing}
            sampleName="WEPs_CEO_Statement_signed.pdf"
            value={docValue(documents, 'ceo_statement')}
            onChange={(f) => setDoc('ceo_statement', f)}
            validate={(f) => validateUpload('ceo_statement', f.fileName, f.sizeKb)}
          />
          <FileDrop
            label="CEO portrait"
            hint="JPG or PNG, up to 8 MB"
            accept=".jpg,.jpeg,.png"
            required
            showMissing={showMissing}
            sampleName="CEO_portrait.jpg"
            value={docValue(documents, 'ceo_portrait')}
            onChange={(f) => setDoc('ceo_portrait', f)}
            validate={(f) => validateUpload('ceo_portrait', f.fileName, f.sizeKb)}
          />
        </div>
      </div>
    </div>
  )
}

export function ContactsStep({ data, set, err }: StepProps) {
  return (
    <div className="grid gap-8">
      <section aria-labelledby="primary-contact" className="grid gap-3">
        <h3 id="primary-contact" className="font-heading font-semibold text-navy">
          Primary contact
        </h3>
        <p className="-mt-2 text-muted-foreground text-sm">
          Receives application updates. Usually your HR, sustainability or DEI lead.
        </p>
        <PersonFields
          prefix="contacts.primary"
          person={data.contacts.primary}
          set={set}
          err={err}
          requiredEmail
          requiredName
        />
      </section>
      <section aria-labelledby="secondary-contact" className="grid gap-3">
        <h3 id="secondary-contact" className="font-heading font-semibold text-navy">
          Secondary contact{' '}
          <span className="font-normal text-muted-foreground text-sm">(optional)</span>
        </h3>
        <PersonFields
          prefix="contacts.secondary"
          person={data.contacts.secondary}
          set={set}
          err={err}
        />
      </section>
    </div>
  )
}

function Bar({ label, value }: { label: string; value: string }) {
  const n = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className="grid gap-1">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="font-medium text-navy">{value ? `${n}%` : '—'}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-blue transition-all" style={{ width: `${n}%` }} />
      </div>
    </div>
  )
}

export function GenderStep({ data, set, err }: StepProps) {
  const g = data.genderBalance
  const asset = data.company.isAssetOwner === 'yes'
  return (
    <div className="grid gap-6">
      <p className="text-muted-foreground text-sm">
        Enter the share of women at each level, as a percentage. Approximate figures are fine; you
        will measure in detail later with the WEPs Gender Gap Analysis Tool.
      </p>
      <FieldGroup>
        <TextField
          label="Women among all employees"
          required
          inputMode="numeric"
          suffix="%"
          value={g.employees}
          onChange={(v) => set('genderBalance.employees', v.replace(/[^\d.]/g, ''))}
          error={err('genderBalance.employees')}
        />
        <TextField
          label="Women in management"
          required
          inputMode="numeric"
          suffix="%"
          value={g.management}
          onChange={(v) => set('genderBalance.management', v.replace(/[^\d.]/g, ''))}
          error={err('genderBalance.management')}
          help="Senior and middle management combined."
        />
        <TextField
          label="Women on the board"
          required
          inputMode="numeric"
          suffix="%"
          value={g.board}
          onChange={(v) => set('genderBalance.board', v.replace(/[^\d.]/g, ''))}
          error={err('genderBalance.board')}
        />
        {asset ? (
          <TextField
            label="Women on the investment committee"
            required
            inputMode="numeric"
            suffix="%"
            value={g.investmentCommittee ?? ''}
            onChange={(v) => set('genderBalance.investmentCommittee', v.replace(/[^\d.]/g, ''))}
            error={err('genderBalance.investmentCommittee')}
            help="Shown because you are an asset owner."
          />
        ) : null}
      </FieldGroup>
      <div className="grid gap-3 rounded-2xl border bg-surface/60 p-4">
        <p className="font-medium text-navy text-sm">Preview</p>
        <Bar label="Employees" value={g.employees} />
        <Bar label="Management" value={g.management} />
        <Bar label="Board" value={g.board} />
        {asset ? <Bar label="Investment committee" value={g.investmentCommittee ?? ''} /> : null}
      </div>
    </div>
  )
}

export function PlansStep({ data, set, err }: StepProps) {
  return (
    <div className="grid gap-6">
      <ChoiceField
        label="Does your company already have a Gender Action Plan?"
        required
        value={data.plans.hasGenderActionPlan}
        onChange={(v) => set('plans.hasGenderActionPlan', v)}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'in_progress', label: 'In development' },
          { value: 'no', label: 'Not yet' },
        ]}
        error={err('plans.hasGenderActionPlan')}
        help="A written set of goals and actions on gender equality in the workplace, marketplace and community."
      />
      <div className="flex gap-3 rounded-2xl border border-blue/20 bg-blue-50 p-4 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
        <p>
          You do not need a plan to join. After approval the portal helps you build one, step by
          step, using the Gender Gap Analysis Tool and your priority principles.
        </p>
      </div>
    </div>
  )
}

export function ReferralStep({ data, set, err }: StepProps) {
  return (
    <div className="grid gap-8">
      <FieldGroup>
        <SelectField
          label="How did you hear about the WEPs?"
          required
          value={data.referral.source}
          onChange={(v) => set('referral.source', v)}
          options={REFERRAL_SOURCES}
          error={err('referral.source')}
        />
        <TextField
          label="Details (optional)"
          value={data.referral.details ?? ''}
          onChange={(v) => set('referral.details', v)}
          help="For example the name of the event or colleague."
        />
      </FieldGroup>
      <div className="grid gap-3 rounded-2xl border border-gold/40 bg-gold-50/60 p-4 sm:p-5">
        <div>
          <h3 className="font-heading font-semibold text-navy">
            Financial contribution (optional)
          </h3>
          <p className="text-muted-foreground text-sm">
            Some signatories choose to support the WEPs financially. This is voluntary,{' '}
            <strong>never a condition of joining</strong>, and has no effect on your application.
          </p>
        </div>
        <ChoiceField
          label="Would you like UN Women to contact you about contributing?"
          value={data.referral.contributionInterest}
          onChange={(v) => set('referral.contributionInterest', v)}
          options={[
            { value: 'yes', label: 'Yes, please' },
            { value: 'maybe', label: 'Maybe later' },
            { value: 'no', label: 'No, thank you' },
          ]}
        />
      </div>
    </div>
  )
}
