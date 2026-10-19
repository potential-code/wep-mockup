import type { ReactNode } from 'react'
import { ErrorState, PageSkeleton } from '@/components/shared/States'

/** Loading skeleton / error state wrapper shared by the reporting pages. */
export function QueryState({
  isLoading,
  isError,
  refetch,
  hasData,
  children,
}: {
  isLoading: boolean
  isError: boolean
  refetch: () => void
  hasData: boolean
  children: ReactNode
}) {
  if (isLoading) return <PageSkeleton />
  if (isError || !hasData)
    return <ErrorState message="This report could not be loaded." onRetry={refetch} />
  return <>{children}</>
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 font-bold font-heading text-2xl text-navy tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  )
}
