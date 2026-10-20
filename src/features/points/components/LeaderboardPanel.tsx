import { Crown } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useLeaderboard } from '@/queries/learning.queries'

type Row = NonNullable<ReturnType<typeof useLeaderboard>['data']>[number]

// Podium order left to right: 2nd, 1st, 3rd.
const PODIUM = [
  { rank: 2, height: 'h-16', step: 'from-[#e9eff5] to-[#cdd9e4]', ring: 'ring-[#cdd9e4]' },
  { rank: 1, height: 'h-24', step: 'from-coral to-coral-700', ring: 'ring-coral' },
  { rank: 3, height: 'h-12', step: 'from-blue-100 to-blue', ring: 'ring-blue' },
] as const

/** Optional, opt-in company view. Ranks learning and contribution only. */
export function LeaderboardPanel({ companyId, meId }: { companyId?: string; meId?: string }) {
  const { data, isLoading } = useLeaderboard(companyId)
  const reduce = useReducedMotion()
  const rows = (data ?? []).slice(0, 6)
  const rest = rows.slice(3)

  return (
    <section
      aria-labelledby="leaderboard-heading"
      className="rounded-[1.75rem] bg-navy/[0.04] p-1.5 ring-1 ring-navy/[0.06]"
    >
      <div className="h-full rounded-[calc(1.75rem-0.375rem)] bg-card p-5 shadow-card sm:p-6">
        <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-[0.65rem] text-blue-600 uppercase tracking-[0.2em] ring-1 ring-blue/20">
          Leaderboard
        </span>
        <h2 id="leaderboard-heading" className="mt-2 font-heading font-medium text-navy text-xl">
          Top learners at your company
        </h2>
        <p className="text-muted-foreground text-sm">By lifetime points.</p>

        {isLoading ? (
          <Skeleton className="mt-5 h-56 w-full" />
        ) : (
          <>
            <ol className="mt-6 grid grid-cols-3 items-end gap-2" aria-label="Top three">
              {PODIUM.map((p, i) => {
                const r = rows[p.rank - 1]
                if (!r) return <li key={p.rank} />
                return (
                  <motion.li
                    key={r.userId}
                    initial={reduce ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.7,
                      ease: [0.32, 0.72, 0, 1],
                      delay: [0.15, 0, 0.3][i],
                    }}
                    className="grid min-w-0 justify-items-center gap-1.5 text-center"
                  >
                    <span className="relative">
                      {p.rank === 1 ? (
                        <Crown
                          className="-top-5 -translate-x-1/2 absolute left-1/2 size-5 fill-coral text-coral-700"
                          aria-hidden
                        />
                      ) : null}
                      <UserAvatar
                        name={r.name}
                        src={r.avatar}
                        className={cn(
                          'ring-2 ring-offset-2',
                          p.ring,
                          p.rank === 1 ? 'size-14' : 'size-11',
                        )}
                      />
                    </span>
                    <span className="w-full truncate font-medium text-navy text-xs sm:text-sm">
                      {r.name.split(' ')[0]}
                      {r.userId === meId ? ' (you)' : ''}
                    </span>
                    <span className="font-semibold text-muted-foreground text-xs tabular-nums">
                      {r.lifetime} pts
                    </span>
                    <span
                      className={cn(
                        'grid w-full place-items-center rounded-t-xl bg-gradient-to-b font-bold font-heading text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]',
                        p.height,
                        p.step,
                        p.rank === 2 && 'text-navy',
                      )}
                    >
                      <span className="sr-only">Rank </span>
                      {p.rank}
                    </span>
                  </motion.li>
                )
              })}
            </ol>
            {rest.length ? (
              <ol start={4} className="mt-3 grid gap-1 border-t pt-3">
                {rest.map((r: Row, i) => (
                  <li
                    key={r.userId}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-2 py-2',
                      r.userId === meId && 'bg-blue-50',
                    )}
                  >
                    <span className="w-5 text-center font-semibold text-muted-foreground text-sm tabular-nums">
                      {i + 4}
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
            ) : null}
          </>
        )}
        <p className="mt-4 text-muted-foreground text-xs">
          Ranks learning and community contribution only. No performance, pay or compliance data is
          used, and you can hide yourself in your profile settings.
        </p>
      </div>
    </section>
  )
}
