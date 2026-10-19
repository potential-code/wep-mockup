import { DemoLabel, SectionCard } from '@/components/shared/Cards'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useLeaderboard } from '@/queries/learning.queries'

/** Optional, opt-in company view. Ranks learning and contribution only. */
export function LeaderboardPanel({ companyId, meId }: { companyId?: string; meId?: string }) {
  const { data, isLoading } = useLeaderboard(companyId)
  return (
    <SectionCard
      title="Company learning leaderboard"
      description="Top learners at your company by lifetime points."
      action={<DemoLabel>Illustrative demo data</DemoLabel>}
    >
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <ol className="grid gap-1">
          {(data ?? []).slice(0, 5).map((r, i) => (
            <li
              key={r.userId}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-2',
                r.userId === meId && 'bg-blue-50',
              )}
            >
              <span className="w-5 text-center font-semibold text-muted-foreground text-sm tabular-nums">
                {i + 1}
              </span>
              <UserAvatar name={r.name} src={r.avatar} />
              <span className="min-w-0 flex-1 truncate font-medium text-navy text-sm">
                {r.name}
                {r.userId === meId ? ' (you)' : ''}
              </span>
              <span className="font-semibold text-sm tabular-nums">{r.lifetime}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-3 text-muted-foreground text-xs">
        Ranks learning and community contribution only. No performance, pay or compliance data is
        used, and you can hide yourself in your profile settings.
      </p>
    </SectionCard>
  )
}
