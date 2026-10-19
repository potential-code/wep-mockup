import { departmentLabel, ROLE_LABELS } from '@shared/reference'
import type { User } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { Bell, Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { PageSkeleton } from '@/components/shared/States'
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
import { FormField } from '@/features/company/components/FormField'
import { useCurrentUser } from '@/hooks/use-session'
import { useUpdateMyProfile } from '@/queries/session.queries'
import { DepartmentCorrectionDialog } from '../components/DepartmentCorrectionDialog'

const ZONES = [
  'Africa/Cairo',
  'Africa/Casablanca',
  'Africa/Nairobi',
  'America/New_York',
  'America/Sao_Paulo',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Paris',
]

export function MyProfilePage() {
  const { user, company } = useCurrentUser()
  if (!user) return <PageSkeleton />
  return <ProfileForm user={user} companyName={company?.name} />
}

function ProfileForm({ user, companyName }: { user: User; companyName?: string }) {
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    title: user.title,
    timezone: user.timezone,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [correcting, setCorrecting] = useState(false)
  const save = useUpdateMyProfile()
  const zones = ZONES.includes(form.timezone) ? ZONES : [form.timezone, ...ZONES]
  const name = `${user.firstName} ${user.lastName}`

  const submit = () => {
    const next: Record<string, string> = {}
    if (!form.firstName.trim()) next.firstName = 'Enter your first name.'
    if (!form.lastName.trim()) next.lastName = 'Enter your last name.'
    if (!form.title.trim()) next.title = 'Enter your job title.'
    setErrors(next)
    if (Object.keys(next).length) return
    save.mutate(form, { onSuccess: () => toast.success('Profile saved') })
  }

  return (
    <div>
      <PageHeader
        title="My profile"
        description="Your personal details and how you appear to colleagues."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <form
          className="lg:col-span-2"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <SectionCard
            title="Personal details"
            action={<UserAvatar name={name} src={user.avatar} className="size-14" />}
          >
            <fieldset disabled={save.isPending} className="grid gap-4 sm:grid-cols-2">
              <FormField id="pf-first" label="First name" required error={errors.firstName}>
                <Input
                  id="pf-first"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </FormField>
              <FormField id="pf-last" label="Last name" required error={errors.lastName}>
                <Input
                  id="pf-last"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </FormField>
              <div className="sm:col-span-2">
                <FormField id="pf-title" label="Job title" required error={errors.title}>
                  <Input
                    id="pf-title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </FormField>
              </div>
              <FormField
                id="pf-email"
                label="Work email"
                hint="Contact your administrator to change it."
              >
                <Input id="pf-email" value={user.email} readOnly disabled />
              </FormField>
              <FormField id="pf-tz" label="Time zone" hint="Used for clinic and mentoring times.">
                <Select
                  value={form.timezone}
                  onValueChange={(v) => setForm({ ...form, timezone: v })}
                >
                  <SelectTrigger id="pf-tz" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((z) => (
                      <SelectItem key={z} value={z}>
                        {z.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </fieldset>
            <div className="mt-5 flex justify-end">
              <Button type="submit" disabled={save.isPending}>
                <Save aria-hidden /> {save.isPending ? 'Saving…' : 'Save profile'}
              </Button>
            </div>
          </SectionCard>
        </form>
        <div className="grid content-start gap-6">
          <SectionCard title="Role and department">
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground text-xs">Company</dt>
                <dd className="font-medium text-navy">{companyName ?? 'UN Women'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Role</dt>
                <dd className="font-medium text-navy">{ROLE_LABELS[user.role]}</dd>
              </div>
              {user.department ? (
                <div>
                  <dt className="text-muted-foreground text-xs">Department</dt>
                  <dd className="font-medium text-navy">{departmentLabel(user.department)}</dd>
                </div>
              ) : null}
            </dl>
            {user.department && user.role !== 'mentor' ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setCorrecting(true)}
              >
                Request a department correction
              </Button>
            ) : null}
          </SectionCard>
          <SectionCard title="Notifications">
            <p className="text-muted-foreground text-sm">
              Choose which non-essential updates reach you. Critical account and reporting notices
              always stay on.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/portal/notifications">
                <Bell aria-hidden /> Notification preferences
              </Link>
            </Button>
          </SectionCard>
        </div>
      </div>
      <DepartmentCorrectionDialog
        open={correcting}
        onOpenChange={setCorrecting}
        current={user.department}
      />
    </div>
  )
}
