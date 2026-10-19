import { fullName } from '@shared/permissions'
import { Activity } from 'lucide-react'
import { motion } from 'motion/react'
import { SectionCard } from '@/components/shared/Cards'
import { EmptyState, ErrorState } from '@/components/shared/States'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/use-session'
import { formatDateTime, relativeTime } from '@/lib/format'
import { useCompanyActivity, useTeam } from '@/queries/company.queries'

export function CompanyActivityPage() {
  const { company } = useCurrentUser()
  const activity = useCompanyActivity(company?.id)
  const team = useTeam(company?.id)
  const nameOf = (id: string) => {
    const u = team.data?.find((m) => m.id === id)
    return u ? fullName(u) : id === 'u-admin' ? 'UN Women' : 'System'
  }
  return (
    <SectionCard
      title="Company activity"
      description="A record of who changed what, kept for reporting evidence."
    >
      {activity.isLoading ? (
        <div className="grid gap-3" role="status" aria-label="Loading">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : activity.isError ? (
        <ErrorState message="The activity log couldn’t load." onRetry={() => activity.refetch()} />
      ) : !activity.data?.length ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Invitations, permission changes and profile edits will appear here."
        />
      ) : (
        <ol className="relative grid gap-5 border-s ps-6">
          {activity.data.map((a, i) => (
            <motion.li
              key={a.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i, 10) * 0.03, duration: 0.25 }}
              className="relative"
            >
              <span
                className="absolute -start-[31px] top-1.5 size-2.5 rounded-full bg-blue ring-4 ring-card"
                aria-hidden
              />
              <p className="font-medium text-navy text-sm">
                {a.action} <span className="font-normal text-muted-foreground">· {a.target}</span>
              </p>
              {a.detail ? <p className="text-muted-foreground text-sm">{a.detail}</p> : null}
              <p className="text-muted-foreground text-xs">
                {nameOf(a.actorId)} · {formatDateTime(a.at)} ({relativeTime(a.at)})
              </p>
            </motion.li>
          ))}
        </ol>
      )}
    </SectionCard>
  )
}
