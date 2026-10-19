import type { ReactNode } from 'react'
import { STAT_TONES, type StatTone } from '@/components/shared/StatCard'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { cn } from '@/lib/utils'

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
  tone: toneProp,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: StatTone
}) {
  const toneSet = toneProp !== undefined
  const tone = toneProp ?? 'navy'
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-4 shadow-card',
        STAT_TONES[tone].surface,
        STAT_TONES[tone].text,
        // Rows of tiles alternate brand surfaces so a grid does not read as one block.
        !toneSet &&
          'nth-[3n+2]:bg-[linear-gradient(135deg,#0e5a85,var(--blue-600)_45%,var(--blue))] nth-[3n+3]:bg-[linear-gradient(135deg,var(--navy),var(--blue-600)_60%,var(--blue))]',
      )}
    >
      <span
        aria-hidden
        className="-top-10 -right-10 absolute size-28 rounded-full bg-white/15 blur-xl"
      />
      <p className={cn('relative text-xs', STAT_TONES[tone].muted)}>{label}</p>
      <p className="relative mt-1 font-bold font-heading text-2xl tabular-nums">{value}</p>
      {hint ? <p className={cn('relative mt-1 text-xs', STAT_TONES[tone].muted)}>{hint}</p> : null}
    </div>
  )
}
