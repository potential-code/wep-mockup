import { type ErrorComponentProps, Link } from '@tanstack/react-router'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFound() {
  return (
    <main id="main" className="grid min-h-[70vh] place-items-center bg-surface px-4 text-center">
      <div className="grid max-w-md justify-items-center gap-4">
        <span className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue">
          <Compass className="size-7" aria-hidden />
        </span>
        <h1 className="text-page-title text-navy">Page not found</h1>
        <p className="text-muted-foreground">
          The page you’re looking for doesn’t exist or has moved.
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/">Go to home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/sign-in">Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

export function RouteError({ error, reset }: ErrorComponentProps) {
  return (
    <main id="main" className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div className="grid max-w-md justify-items-center gap-3">
        <h1 className="font-heading font-medium text-2xl text-navy">Something went wrong</h1>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : 'Unexpected error'}
        </p>
        <div className="flex gap-2">
          {reset ? <Button onClick={reset}>Try again</Button> : null}
          <Button asChild variant="outline">
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
