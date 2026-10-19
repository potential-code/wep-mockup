import { COUNTRIES, SECTORS } from '@shared/reference'
import type { Company, CompanySize } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { Clock3, Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SectionCard } from '@/components/shared/Cards'
import { PageSkeleton } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCurrentUser } from '@/hooks/use-session'
import { formatDate } from '@/lib/format'
import { useTeam, useUpdateCompany } from '@/queries/company.queries'
import { FormField } from '../components/FormField'

const SIZES: CompanySize[] = ['1-49', '50-249', '250-999', '1000-4999', '5000+']

export function CompanyDetailsPage() {
  const { company, can } = useCurrentUser()
  if (!company) return <PageSkeleton />
  return <DetailsForm company={company} editable={can('company.edit_profile')} />
}

function DetailsForm({ company, editable }: { company: Company; editable: boolean }) {
  const [form, setForm] = useState({
    name: company.name,
    country: company.country,
    sector: company.sector,
    summary: company.summary,
    website: company.website,
    employeeCount: String(company.employeeCount),
    size: company.size,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const update = useUpdateCompany(company.id)
  const team = useTeam(company.id)
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }))
  const contacts = [company.ceoId, company.focalPointId]
    .map((id) => team.data?.find((u) => u.id === id))
    .filter((u) => u !== undefined)

  const submit = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Enter the company’s legal name.'
    if (form.summary.trim().length < 20) next.summary = 'Write at least a short sentence.'
    if (!/^https?:\/\//.test(form.website)) next.website = 'Start with https://'
    if (!(Number(form.employeeCount) > 0)) next.employeeCount = 'Enter the number of employees.'
    setErrors(next)
    if (Object.keys(next).length) return
    update.mutate(
      {
        name: form.name.trim(),
        country: form.country,
        sector: form.sector,
        summary: form.summary.trim(),
        website: form.website.trim(),
        employeeCount: Number(form.employeeCount),
        size: form.size,
      },
      {
        onSuccess: (res) =>
          res.reviewPending
            ? toast.info('Saved. Identity and public changes are pending UN Women review.')
            : toast.success('Company details saved'),
      },
    )
  }

  const pending = company.pendingProfileRevision
  return (
    <form
      className="grid gap-6 lg:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      noValidate
    >
      <div className="grid content-start gap-6 lg:col-span-2">
        {pending ? (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning-soft p-4 text-sm"
          >
            <Clock3 className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
            <p>
              <span className="font-semibold text-navy">Review pending.</span> Your requested{' '}
              {pending.field} (“{pending.value.slice(0, 80)}
              {pending.value.length > 80 ? '…' : ''}”) was sent to UN Women on{' '}
              {formatDate(pending.requestedAt)}. The approved version stays public until then.
            </p>
          </div>
        ) : null}
        <SectionCard
          title="Company information"
          description={
            editable
              ? 'Name, country and summary are identity and public information, so changes are reviewed by UN Women.'
              : 'You can view these details. Ask your administrator to change them.'
          }
        >
          <fieldset disabled={!editable || update.isPending} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormField
                id="cd-name"
                label="Approved company name"
                required
                error={errors.name}
                hint={<ReviewedHint />}
              >
                <Input
                  id="cd-name"
                  value={form.name}
                  onChange={(e) => set('name')(e.target.value)}
                />
              </FormField>
            </div>
            <FormField id="cd-country" label="Country" hint={<ReviewedHint />}>
              <Select value={form.country} onValueChange={set('country')}>
                <SelectTrigger id="cd-country" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="cd-sector" label="Sector">
              <Select value={form.sector} onValueChange={set('sector')}>
                <SelectTrigger id="cd-sector" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <div className="sm:col-span-2">
              <FormField
                id="cd-summary"
                label="Public summary"
                required
                error={errors.summary}
                hint={<ReviewedHint />}
              >
                <Textarea
                  id="cd-summary"
                  rows={4}
                  value={form.summary}
                  onChange={(e) => set('summary')(e.target.value)}
                />
              </FormField>
            </div>
            <FormField id="cd-web" label="Website" required error={errors.website}>
              <Input
                id="cd-web"
                value={form.website}
                onChange={(e) => set('website')(e.target.value)}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField id="cd-emp" label="Employees" required error={errors.employeeCount}>
                <Input
                  id="cd-emp"
                  inputMode="numeric"
                  value={form.employeeCount}
                  onChange={(e) => set('employeeCount')(e.target.value.replace(/\D/g, ''))}
                />
              </FormField>
              <FormField id="cd-size" label="Size band">
                <Select value={form.size} onValueChange={set('size')}>
                  <SelectTrigger id="cd-size" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </fieldset>
        </SectionCard>
        {editable ? (
          <div className="sticky bottom-3 z-10 flex justify-end rounded-2xl border bg-card/95 p-3 shadow-lift backdrop-blur">
            <Button type="submit" disabled={update.isPending}>
              <Save aria-hidden /> {update.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        ) : null}
      </div>
      <SectionCard title="Company contacts" description="Who UN Women and colleagues contact">
        <ul className="grid gap-4">
          {contacts.map((u) => (
            <li key={u.id} className="flex items-center gap-3">
              <UserAvatar
                name={`${u.firstName} ${u.lastName}`}
                src={u.avatar}
                className="size-10"
              />
              <div className="min-w-0 text-sm">
                <p className="font-medium text-navy">
                  {u.firstName} {u.lastName}
                </p>
                <p className="text-muted-foreground">{u.title}</p>
                <a href={`mailto:${u.email}`} className="block truncate text-blue hover:underline">
                  {u.email}
                </a>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-muted-foreground text-xs">
          The executive sponsor is set by UN Women. The focal point is appointed by the CEO in{' '}
          <Link to="/portal/company/permissions" className="text-blue underline">
            Permissions
          </Link>
          .
        </p>
      </SectionCard>
    </form>
  )
}

function ReviewedHint() {
  return (
    <span className="inline-flex items-center gap-1">
      <StatusBadge tone="info" icon={Clock3}>
        Changes need review
      </StatusBadge>
    </span>
  )
}
