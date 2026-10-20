import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Loader2, LogIn, Mail, MailOpen, Play, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { homeFor } from '@/config/nav'
import { cn } from '@/lib/utils'
import { DEMO_PERSONAS, useSignInAs, useSignInWithEmail } from '@/queries/session.queries'
import { AuthShell } from '../components/AuthShell'

const route = getRouteApi('/_auth/sign-in')

export function SignInPage() {
  const { redirect } = route.useSearch()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const signInEmail = useSignInWithEmail()
  const signInAs = useSignInAs()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
  const singles = ['admin', 'ceo', 'company_admin', 'employee', 'mentor']
    .map(persona)
    .filter((p) => p !== undefined)
  const busy = signInEmail.isPending || pendingKey !== null

  return (
    <AuthShell>
      <div className="grid grid-cols-1 gap-8">
        <header className="grid gap-2">
          <span className="mb-1 grid size-12 place-items-center rounded-2xl bg-[linear-gradient(140deg,var(--navy),var(--blue))] text-white shadow-[0_10px_24px_-10px_rgb(0_119_182/0.7)] ring-4 ring-white">
            <LogIn className="size-5" aria-hidden />
          </span>
          <h1 className="font-medium font-heading text-3xl text-navy sm:text-4xl">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to access your company’s WEPs portal.</p>
        </header>

        <form
          onSubmit={onEmail}
          className="relative grid gap-4 overflow-hidden rounded-2xl border border-white bg-white/80 p-5 shadow-lift backdrop-blur sm:p-6"
          noValidate
        >
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--coral),var(--blue)_60%,var(--navy))]"
          />
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
          <Button type="submit" size="xl" variant="coral" disabled={busy}>
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
          <p className="flex gap-2 rounded-xl border border-blue/15 bg-blue-50/70 px-3 py-2.5 text-muted-foreground text-xs">
            <MailOpen className="size-4 shrink-0 text-blue" aria-hidden />
            Invited by a colleague or UN Women? Open the link in your invitation email to accept it.
          </p>
        </form>

        <section
          aria-labelledby="demo-h"
          className="relative grid grid-cols-1 gap-4 overflow-hidden rounded-2xl border border-coral/40 bg-[linear-gradient(160deg,var(--coral-50),#fff_70%)] p-5 shadow-card"
        >
          <span
            aria-hidden
            className="-top-10 -right-10 pointer-events-none absolute size-32 rounded-full border border-coral/30"
          />
          <span
            aria-hidden
            className="-top-4 -right-4 pointer-events-none absolute size-20 rounded-full border border-coral/40"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="demo-h" className="flex items-center gap-2 font-heading font-medium text-navy">
              <Sparkles className="size-4 text-coral-700" aria-hidden /> Explore the demo
            </h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Skip the form and open the mockup as one of these sample roles. No real accounts or
            passwords are involved.
          </p>
          <div className="grid grid-cols-1 gap-2">
            {singles.map((p) => (
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
        'group flex min-h-14 w-full items-center gap-3 rounded-xl text-start transition-all duration-300 disabled:opacity-60',
        bare
          ? 'p-0'
          : 'border bg-card px-4 py-2.5 shadow-card hover:-translate-y-0.5 hover:border-blue/40 hover:shadow-lift',
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue transition-colors group-hover:bg-blue group-hover:text-white">
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
        className="size-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-blue"
        aria-hidden
      />
    </button>
  )
}
