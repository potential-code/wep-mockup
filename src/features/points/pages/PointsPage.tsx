import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AchievementStats } from '@/features/points/components/AchievementsSummary'
import { deriveAchievements } from '@/features/points/components/achievements'
import { BadgesPanel } from '@/features/points/components/BadgesPanel'
import { BalanceSummary } from '@/features/points/components/BalanceSummary'
import { LeaderboardPanel } from '@/features/points/components/LeaderboardPanel'
import { LedgerTable } from '@/features/points/components/LedgerTable'
import { RewardsPanel } from '@/features/points/components/RewardsPanel'
import { RulesTable } from '@/features/points/components/RulesTable'
import { useCurrentUser } from '@/hooks/use-session'
import { useMyLearning, useMyPoints } from '@/queries/learning.queries'

export function PointsPage() {
  const { user } = useCurrentUser()
  const points = useMyPoints()
  const learning = useMyLearning()

  const achievements = useMemo(
    () => (points.data ? deriveAchievements(points.data.ledger, points.data.balance) : []),
    [points.data],
  )

  if (points.isLoading) return <PageSkeleton />
  if (points.isError || !points.data)
    return <ErrorState message={points.error?.message} onRetry={() => points.refetch()} />
  const { balance, ledger } = points.data
  const clinic = learning.data?.clinic

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <PageHeader
        eyebrow="Gamification"
        title="Points and rewards"
        description="Earn points by learning, then use them for rewards such as mentoring."
        actions={
          <Button asChild>
            <Link to="/portal/learn">
              Earn more points
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        }
      />
      <BalanceSummary balance={balance} />
      <Tabs defaultValue="rewards">
        <TabsList className="max-w-full justify-start overflow-x-auto">
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="ledger">Points history</TabsTrigger>
          <TabsTrigger value="rules">How points work</TabsTrigger>
        </TabsList>
        <TabsContent value="rewards" className="mt-5">
          <RewardsPanel balance={balance} clinic={clinic} />
        </TabsContent>
        <TabsContent value="badges" className="mt-5 grid gap-6">
          <AchievementStats achievements={achievements} ledger={ledger} />
          <BadgesPanel achievements={achievements} />
        </TabsContent>
        <TabsContent value="leaderboard" className="mt-5">
          <LeaderboardPanel companyId={user?.companyId} meId={user?.id} />
        </TabsContent>
        <TabsContent value="ledger" className="mt-5">
          <SectionCard title="Points history">
            <LedgerTable rows={ledger} />
          </SectionCard>
        </TabsContent>
        <TabsContent value="rules" className="mt-5">
          <RulesTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
