import type { LucideIcon } from 'lucide-react'
import { AlertCircle, Inbox, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid place-items-center gap-3 rounded-2xl border border-dashed bg-card/60 px-6 py-12 text-center',
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue">
        <Icon className="size-6" aria-hidden />
      </span>
      <div className="grid gap-1">
        <p className="font-heading font-semibold text-navy">{title}</p>
        {description ? (
          <p className="max-w-md text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="grid place-items-center gap-3 rounded-2xl border border-danger/30 bg-danger-soft/50 px-6 py-10 text-center"
    >
      <AlertCircle className="size-7 text-danger" aria-hidden />
      <div>
        <p className="font-semibold text-navy">{title}</p>
        {message ? <p className="text-muted-foreground text-sm">{message}</p> : null}
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}

export function AccessNotice({
  title,
  message,
  action,
}: {
  title: string
  message: string
  action?: ReactNode
}) {
  return (
    <div className="grid place-items-center gap-3 rounded-2xl border bg-card px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-navy">
        <Lock className="size-6" aria-hidden />
      </span>
      <p className="font-heading font-semibold text-lg text-navy">{title}</p>
      <p className="max-w-md text-muted-foreground">{message}</p>
      {action}
    </div>
  )
}

/** Skeletons shaped like the content they replace. */
export function CardGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
        <div key={i} className="overflow-hidden rounded-2xl border bg-card">
          <Skeleton className="aspect-[16/9] w-full rounded-none" />
          <div className="grid gap-2 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
        <div key={i} className="grid gap-3 rounded-2xl border bg-card p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="grid gap-6" role="status" aria-busy="true" aria-label="Loading">
      <div className="grid gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <StatsSkeleton />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  )
}
