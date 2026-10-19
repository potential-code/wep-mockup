import { DEMO_RULES } from '@shared/rules'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoLabel, SectionCard } from '@/components/shared/Cards'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

  if (points.isLoading) return <PageSkeleton />
  if (points.isError || !points.data)
    return <ErrorState message={points.error?.message} onRetry={() => points.refetch()} />
  const { balance, ledger } = points.data
  const clinic = learning.data?.clinic
  const toGo = Math.max(0, DEMO_RULES.qualifyingPointsForClinic - balance.qualifying)

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Points and rewards"
        description="Earn points by learning and contributing, then use them for rewards such as mentoring."
        actions={
          <>
            <DemoLabel>Proposed feature</DemoLabel>
            <Button asChild>
              <Link to="/portal/learn">
                Earn more points
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </>
        }
      />
      <BalanceSummary balance={balance} />
      {toGo > 0 && clinic && !clinic.eligible ? (
        <p className="rounded-xl bg-blue-50 px-4 py-3 text-navy text-sm">
          You are <strong>{toGo} qualifying points</strong> away from the clinic milestone. Each
          lesson in your pathway course is worth {25} points.
        </p>
      ) : null}

      <Tabs defaultValue="rewards">
        <TabsList>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="ledger">Points history</TabsTrigger>
          <TabsTrigger value="rules">How points work</TabsTrigger>
        </TabsList>
        <TabsContent value="rewards" className="mt-5 grid gap-6">
          <RewardsPanel balance={balance} clinic={clinic} />
          <div className="grid gap-6 lg:grid-cols-2">
            <BadgesPanel ledger={ledger} lifetime={balance.lifetime} />
            <LeaderboardPanel companyId={user?.companyId} meId={user?.id} />
          </div>
        </TabsContent>
        <TabsContent value="ledger" className="mt-5">
          <SectionCard
            title="Points history"
            description="Every award and redemption, newest first, with your running balance."
          >
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
