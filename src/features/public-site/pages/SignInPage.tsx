import { DEPARTMENTS } from '@shared/reference'
import type { DepartmentId } from '@shared/types'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Loader2, Mail, Play, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { DemoLabel } from '@/components/shared/Cards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { homeFor } from '@/config/nav'
import { cn } from '@/lib/utils'
import { DEMO_PERSONAS, useSignInAs, useSignInWithEmail } from '@/queries/session.queries'
import { AuthShell } from '../components/AuthShell'

const route = getRouteApi('/_auth/sign-in')
const EMPLOYEE_DEPTS = ['hr', 'procurement', 'marketing'] as const

export function SignInPage() {
  const { redirect } = route.useSearch()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const signInEmail = useSignInWithEmail()
  const signInAs = useSignInAs()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dept, setDept] = useState<(typeof EMPLOYEE_DEPTS)[number]>('hr')
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const finish = async (user: Parameters<typeof homeFor>[0]) => {
    await qc.invalidateQueries()
    if (redirect?.startsWith('/')) navigate({ href: redirect })
    else navigate({ to: homeFor(user) })
  }

  const onEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim()) return setError('Enter your work email to continue.')
    try {
      await finish(await signInEmail.mutateAsync(email))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We couldn’t sign you in. Please try again.')
    }
  }

  const onDemo = async (key: string, userId: string) => {
    setPendingKey(key)
    setError(null)
    try {
      await finish(await signInAs.mutateAsync(userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo sign-in failed.')
      setPendingKey(null)
    }
  }

  const persona = (key: string) => DEMO_PERSONAS.find((p) => p.key === key)
  const employee = persona(`employee-${dept}`)
  const singles = ['admin', 'ceo', 'company_admin', 'mentor']
    .map(persona)
    .filter((p) => p !== undefined)
  const busy = signInEmail.isPending || pendingKey !== null

  return (
    <AuthShell>
      <div className="grid grid-cols-1 gap-8">
        <header className="grid gap-2">
          <h1 className="font-bold font-heading text-3xl text-navy">Sign in</h1>
          <p className="text-muted-foreground">Access your company’s WEPs portal.</p>
        </header>

        <form onSubmit={onEmail} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Work email</Label>
            <div className="relative">
              <Mail
                className="-translate-y-1/2 pointer-events-none absolute start-3 top-1/2 size-4 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'signin-error' : undefined}
                className="h-11 ps-9"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="font-medium text-blue text-sm hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Demo: any value works"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
            />
          </div>
          {error ? (
            <p
              id="signin-error"
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger-soft/60 px-3 py-2 text-danger text-sm"
            >
              {error}
            </p>
          ) : null}
          <Button type="submit" size="xl" disabled={busy}>
            {signInEmail.isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden /> Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </Button>
          <p className="text-center text-muted-foreground text-sm">
            New company?{' '}
            <Link to="/join" className="font-semibold text-blue hover:underline">
              Join WEPs
            </Link>
          </p>
          <p className="rounded-lg bg-secondary px-3 py-2 text-muted-foreground text-xs">
            Invited by a colleague or UN Women? Open the link in your invitation email to accept it.
          </p>
        </form>

        <section
          aria-labelledby="demo-h"
          className="grid grid-cols-1 gap-4 rounded-2xl border border-gold/40 bg-gold-50/60 p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="demo-h"
              className="flex items-center gap-2 font-heading font-semibold text-navy"
            >
              <Sparkles className="size-4 text-gold-700" aria-hidden /> Explore the demo
            </h2>
            <DemoLabel>Demo only</DemoLabel>
          </div>
          <p className="text-muted-foreground text-sm">
            Skip the form and open the mockup as one of these sample roles. No real accounts or
            passwords are involved.
          </p>
          <div className="grid grid-cols-1 gap-2">
            {singles.slice(0, 3).map((p) => (
              <PersonaButton
                key={p.key}
                label={p.label}
                description={p.description}
                loading={pendingKey === p.key}
                disabled={busy}
                onClick={() => onDemo(p.key, p.userId)}
              />
            ))}
            <div className="grid grid-cols-1 gap-2 rounded-xl border bg-card p-3">
              <PersonaButton
                bare
                label="Company Employee"
                description={employee?.description ?? ''}
                loading={pendingKey === employee?.key}
                disabled={busy || !employee}
                onClick={() => employee && onDemo(employee.key, employee.userId)}
              />
              <fieldset className="flex min-w-0 flex-wrap gap-1.5 border-0 p-0">
                <legend className="sr-only">Employee department</legend>
                {EMPLOYEE_DEPTS.map((d) => {
                  const label = DEPARTMENTS.find((x) => x.id === (d as DepartmentId))?.short ?? d
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={dept === d}
                      onClick={() => setDept(d)}
                      className={cn(
                        'min-h-9 rounded-full border px-3.5 font-medium text-sm transition-colors',
                        dept === d
                          ? 'border-navy bg-navy text-white'
                          : 'bg-card text-navy hover:bg-secondary',
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </fieldset>
            </div>
            {singles.slice(3).map((p) => (
              <PersonaButton
                key={p.key}
                label={p.label}
                description={p.description}
                loading={pendingKey === p.key}
                disabled={busy}
                onClick={() => onDemo(p.key, p.userId)}
              />
            ))}
          </div>
        </section>
      </div>
    </AuthShell>
  )
}

function PersonaButton({
  label,
  description,
  loading,
  disabled,
  onClick,
  bare,
}: {
  label: string
  description: string
  loading: boolean
  disabled: boolean
  onClick: () => void
  bare?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group flex min-h-14 w-full items-center gap-3 rounded-xl text-start transition-colors disabled:opacity-60',
        bare ? 'p-0' : 'border bg-card px-4 py-2.5 hover:border-blue/50 hover:bg-blue-50/50',
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue">
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Play className="size-4" aria-hidden />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-navy text-sm">Sign in as {label}</span>
        <span className="block truncate text-muted-foreground text-xs">{description}</span>
      </span>
      <ArrowRight
        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </button>
  )
}
