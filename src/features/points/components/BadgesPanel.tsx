import {
  type Award,
  BookOpenCheck,
  CalendarCheck,
  Flame,
  Medal,
  MessageSquareHeart,
  Sparkles,
} from 'lucide-react'
import { DemoLabel, SectionCard } from '@/components/shared/Cards'
import { cn } from '@/lib/utils'
import type { LedgerRow } from '@/queries/learning.queries'

interface Badge {
  id: string
  label: string
  hint: string
  icon: typeof Award
  earned: boolean
}

export function deriveBadges(ledger: LedgerRow[], lifetime: number): Badge[] {
  const has = (a: string) => ledger.some((e) => e.action === a && e.amount > 0)
  return [
    {
      id: 'first',
      label: 'First lesson',
      hint: 'Complete any lesson',
      icon: BookOpenCheck,
      earned: has('lesson_complete'),
    },
    {
      id: 'quiz',
      label: 'Quiz passed',
      hint: 'Pass a path quiz',
      icon: Medal,
      earned: has('quiz_pass'),
    },
    {
      id: 'clinic',
      label: 'Clinic attendee',
      hint: 'Attend a clinic',
      icon: CalendarCheck,
      earned: has('clinic_attend'),
    },
    {
      id: 'voice',
      label: 'Helpful voice',
      hint: 'Contribute to the community',
      icon: MessageSquareHeart,
      earned: has('community_contribution'),
    },
    {
      id: '250',
      label: '250 club',
      hint: 'Earn 250 lifetime points',
      icon: Flame,
      earned: lifetime >= 250,
    },
    {
      id: '500',
      label: '500 club',
      hint: 'Earn 500 lifetime points',
      icon: Sparkles,
      earned: lifetime >= 500,
    },
  ]
}

export function BadgesPanel({ ledger, lifetime }: { ledger: LedgerRow[]; lifetime: number }) {
  const badges = deriveBadges(ledger, lifetime)
  return (
    <SectionCard
      title="Badges and milestones"
      action={<DemoLabel>Proposed</DemoLabel>}
      bodyClassName="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
    >
      {badges.map((b) => (
        <div
          key={b.id}
          className={cn(
            'flex items-center gap-3 rounded-xl border p-3',
            b.earned ? 'border-gold/40 bg-gold-50' : 'bg-muted/40 opacity-80',
          )}
        >
          <span
            className={cn(
              'grid size-10 shrink-0 place-items-center rounded-full',
              b.earned ? 'bg-gold text-navy' : 'bg-secondary text-muted-foreground',
            )}
          >
            <b.icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-navy text-sm">{b.label}</p>
            <p className="text-muted-foreground text-xs">{b.earned ? 'Earned' : b.hint}</p>
          </div>
        </div>
      ))}
    </SectionCard>
  )
}
