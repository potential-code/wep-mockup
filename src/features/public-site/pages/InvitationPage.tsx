import { departmentLabel, ROLE_LABELS } from '@shared/reference'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  Loader2,
  MailX,
  UserCheck,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ErrorState } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { homeFor } from '@/config/nav'
import { formatDate } from '@/lib/format'
import { useAcceptInvitation, useInvitation } from '@/queries/session.queries'
import { AuthShell } from '../components/AuthShell'

const route = getRouteApi('/_auth/invite/$token')

export function InvitationPage() {
  const { token } = route.useParams()
  const { data, isLoading, error, refetch } = useInvitation(token)
  const accept = useAcceptInvitation(token)
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', title: '' })
  const [seeded, setSeeded] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  if (data && !seeded) {
    setSeeded(true)
    setForm({ firstName: data.invitation.firstName, lastName: data.invitation.lastName, title: '' })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim() || !form.title.trim())
      return setFormError('Add your first name, last name and job title to continue.')
    setFormError(null)
    try {
      const user = await accept.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        title: form.title.trim(),
      })
      await qc.invalidateQueries()
      toast.success('Welcome aboard. Your account is ready.')
      navigate({ to: homeFor(user) })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'We couldn’t accept the invitation.')
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <AuthShell
      headline="You’ve been invited to the WEPs portal."
      text="Set up your profile and start with the learning and support picked for your role."
    >
      {isLoading ? (
        <div className="grid gap-4" aria-busy>
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      ) : error ? (
        error.message.toLowerCase().includes('not valid') ? (
          <Recovery
            icon={MailX}
            title="This invitation link isn’t valid"
            text="The link may have been copied incorrectly or replaced by a newer invitation."
            hint="Check the latest invitation email, or ask your company administrator or UN Women contact to send a new one."
          />
        ) : (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        )
      ) : data?.invitation.status === 'accepted' ? (
        <Recovery
          icon={UserCheck}
          title="This invitation has already been accepted"
          text="An account already exists for this invitation."
          hint="Sign in with your work email to continue."
          primary
        />
      ) : data && data.invitation.status !== 'pending' ? (
        <Recovery
          icon={CalendarClock}
          title="This invitation has expired"
          text={`It expired on ${formatDate(data.invitation.expiresAt)}.`}
          hint={`Ask ${data.inviterName} to resend it. Nothing else is needed from you.`}
        />
      ) : data ? (
        <form onSubmit={submit} className="grid gap-6" noValidate>
          <header className="grid gap-2">
            <h1 className="font-bold font-heading text-3xl text-navy">Accept your invitation</h1>
            <p className="text-muted-foreground">
              {data.inviterName} invited you to join
              {data.company ? ` ${data.company.name}` : ' the WEPs portal'} as{' '}
              {ROLE_LABELS[data.invitation.role]}.
            </p>
          </header>
          <dl className="grid gap-3 rounded-2xl border bg-card p-5 text-sm shadow-card">
            <Row
              icon={Building2}
              label="Organisation"
              value={data.company?.name ?? 'UN Women / WEPs'}
            />
            <Row icon={UserRound} label="Role" value={ROLE_LABELS[data.invitation.role]} />
            {data.invitation.department ? (
              <Row
                icon={UserRound}
                label="Department"
                value={departmentLabel(data.invitation.department)}
              />
            ) : null}
            <Row icon={UserRound} label="Invited by" value={data.inviterName} />
            <Row
              icon={CalendarClock}
              label="Expires"
              value={formatDate(data.invitation.expiresAt)}
            />
          </dl>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="fn"
                label="First name"
                value={form.firstName}
                onChange={set('firstName')}
                autoComplete="given-name"
              />
              <Field
                id="ln"
                label="Last name"
                value={form.lastName}
                onChange={set('lastName')}
                autoComplete="family-name"
              />
            </div>
            <Field
              id="jt"
              label="Job title"
              value={form.title}
              onChange={set('title')}
              autoComplete="organization-title"
              placeholder="e.g. HR Business Partner"
            />
            <p className="text-muted-foreground text-xs">
              Invited email: <span className="font-medium text-navy">{data.invitation.email}</span>.
              Demo: no password is set and no email is sent.
            </p>
          </div>
          {formError ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-soft/60 px-3 py-2 text-danger text-sm"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {formError}
            </p>
          ) : null}
          <Button type="submit" size="xl" disabled={accept.isPending}>
            {accept.isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden /> Setting up your account…
              </>
            ) : (
              'Accept invitation'
            )}
          </Button>
        </form>
      ) : null}
    </AuthShell>
  )
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
      <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="font-medium text-navy">{value}</dd>
    </div>
  )
}

function Field({
  id,
  label,
  ...props
}: { id: string; label: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className="h-11" {...props} />
    </div>
  )
}

function Recovery({
  icon: Icon,
  title,
  text,
  hint,
  primary,
}: {
  icon: typeof MailX
  title: string
  text: string
  hint: string
  primary?: boolean
}) {
  return (
    <div className="grid gap-5" role="status">
      <span className="grid size-14 place-items-center rounded-2xl bg-warning-soft text-warning">
        <Icon className="size-7" aria-hidden />
      </span>
      <h1 className="font-bold font-heading text-3xl text-navy">{title}</h1>
      <p className="text-muted-foreground">{text}</p>
      <p className="rounded-lg bg-secondary px-4 py-3 text-navy text-sm">{hint}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg" variant={primary ? 'default' : 'outline'}>
          <Link to="/sign-in">Go to sign in</Link>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link to="/">Back to the public site</Link>
        </Button>
      </div>
    </div>
  )
}
