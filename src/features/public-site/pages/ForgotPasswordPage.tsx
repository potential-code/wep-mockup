import { Link } from '@tanstack/react-router'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRequestPasswordReset } from '@/queries/session.queries'
import { AuthShell } from '../components/AuthShell'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPasswordPage() {
  const reset = useRequestPasswordReset()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.')
    setError(null)
    const r = await reset.mutateAsync(email.trim())
    setSentTo(r.sentTo)
  }

  return (
    <AuthShell
      headline="Back in, in a minute."
      text="We’ll send a reset link to the email on your account."
    >
      {sentTo ? (
        <div
          className="grid gap-5 rounded-2xl border border-white bg-white/80 p-6 shadow-lift backdrop-blur sm:p-8"
          role="status"
        >
          <CheckCircle2 className="size-12 text-success" aria-hidden />
          <h1 className="font-bold font-heading text-3xl text-navy">Check your inbox</h1>
          <p className="text-muted-foreground">
            If an account exists for <strong className="text-navy">{sentTo}</strong>, a reset link
            is on its way. It expires in 60 minutes.
          </p>
          <p className="rounded-lg bg-secondary px-3 py-2 text-muted-foreground text-xs">
            Demo: no email is sent. Return to sign in and use the demo options.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="gloss-blue">
              <Link to="/sign-in">Back to sign in</Link>
            </Button>
            <Button variant="outline" size="lg" onClick={() => setSentTo(null)}>
              Use a different email
            </Button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="grid gap-5 rounded-2xl border border-white bg-white/80 p-6 shadow-lift backdrop-blur sm:p-8"
          noValidate
        >
          <header className="grid gap-2">
            <h1 className="font-bold font-heading text-3xl text-navy">Reset your password</h1>
            <p className="text-muted-foreground">
              Enter your work email and we’ll send a reset link.
            </p>
          </header>
          <div className="grid gap-1.5">
            <Label htmlFor="reset-email">Work email</Label>
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'reset-error' : undefined}
              className="h-11"
              placeholder="you@company.com"
            />
            {error ? (
              <p id="reset-error" role="alert" className="text-danger text-sm">
                {error}
              </p>
            ) : null}
          </div>
          <Button type="submit" size="xl" variant="gloss-blue" disabled={reset.isPending}>
            {reset.isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden /> Sending…
              </>
            ) : (
              'Send reset link'
            )}
          </Button>
          <Link to="/sign-in" className="text-center font-medium text-blue text-sm hover:underline">
            Back to sign in
          </Link>
        </form>
      )}
    </AuthShell>
  )
}
