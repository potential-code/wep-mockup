import { DEMO_RULES } from '@shared/rules'
import type { PointsAction, PointsBalance } from '@shared/types'
import {
  BookOpenCheck,
  CalendarCheck,
  ClipboardCheck,
  Crown,
  Flame,
  GraduationCap,
  type LucideIcon,
  Medal,
  MessageSquareHeart,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import type { LedgerRow } from '@/queries/learning.queries'

/** Medal finish. Blue for first steps, gold for milestones, navy for the rarest awards. */
export type MedalTier = 'blue' | 'gold' | 'navy'

export interface Achievement {
  id: string
  label: string
  /** What the learner did, written for the earned state. */
  description: string
  /** How to earn it, written for the locked state. */
  criteria: string
  icon: LucideIcon
  tier: MedalTier
  earned: boolean
  earnedAt?: string
  current: number
  target: number
  /** Unit for the progress line, e.g. "lessons". */
  unit: string
}

export interface Level {
  name: string
  min: number
  tier: MedalTier
}

/** Illustrative recognition levels from lifetime points. Purely a record; they unlock nothing. */
export const LEVELS: Level[] = [
  { name: 'Starter', min: 0, tier: 'blue' },
  { name: 'Contributor', min: 150, tier: 'blue' },
  { name: 'Advocate', min: 400, tier: 'gold' },
  { name: 'Champion', min: 800, tier: 'gold' },
  { name: 'Trailblazer', min: 1500, tier: 'navy' },
]

export function levelFor(lifetime: number) {
  let index = 0
  LEVELS.forEach((l, i) => {
    if (lifetime >= l.min) index = i
  })
  const level = LEVELS[index] as Level
  const next = LEVELS[index + 1]
  const pct = next ? Math.round(((lifetime - level.min) / (next.min - level.min)) * 100) : 100
  return { level, index, next, pct, toNext: next ? next.min - lifetime : 0 }
}

/** Positive events in the order they happened, with a running lifetime total. */
function timeline(ledger: LedgerRow[]) {
  let lifetime = 0
  return [...ledger]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .filter((e) => e.amount > 0)
    .map((e) => {
      lifetime += e.amount
      return { ...e, lifetime }
    })
}

export function deriveAchievements(ledger: LedgerRow[], balance: PointsBalance): Achievement[] {
  const events = timeline(ledger)
  const ofAction = (a: PointsAction) => events.filter((e) => e.action === a)
  const count = (a: PointsAction, target: number) => {
    const list = ofAction(a)
    return { current: list.length, earnedAt: list[target - 1]?.createdAt }
  }
  const lifetimeAt = (target: number) => events.find((e) => e.lifetime >= target)?.createdAt
  const qualifyingAt = (target: number) => {
    let q = 0
    return events.find((e) => {
      if (e.qualifying) q += e.amount
      return q >= target
    })?.createdAt
  }
  const make = (
    a: Omit<Achievement, 'earned' | 'earnedAt' | 'current'> & {
      current: number
      earnedAt?: string
    },
  ): Achievement => ({
    ...a,
    current: Math.min(a.current, a.target),
    earned: a.current >= a.target,
    earnedAt: a.current >= a.target ? a.earnedAt : undefined,
  })
  const clinicTarget = DEMO_RULES.qualifyingPointsForClinic

  return [
    make({
      id: 'first-lesson',
      label: 'First steps',
      description: 'Completed your first lesson.',
      criteria: 'Complete any lesson.',
      icon: BookOpenCheck,
      tier: 'blue',
      target: 1,
      unit: 'lesson',
      ...count('lesson_complete', 1),
    }),
    make({
      id: 'five-lessons',
      label: 'Steady learner',
      description: 'Completed five lessons.',
      criteria: 'Complete five lessons.',
      icon: GraduationCap,
      tier: 'blue',
      target: 5,
      unit: 'lessons',
      ...count('lesson_complete', 5),
    }),
    make({
      id: 'quiz',
      label: 'Quiz ace',
      description: 'Passed a pathway quiz.',
      criteria: 'Pass the quiz in your designated pathway course.',
      icon: Medal,
      tier: 'gold',
      target: 1,
      unit: 'quiz',
      ...count('quiz_pass', 1),
    }),
    make({
      id: 'clinic-ready',
      label: 'Clinic ready',
      description: 'Reached the qualifying milestone for your clinic.',
      criteria: `Earn ${clinicTarget} qualifying points from your pathway course.`,
      icon: ShieldCheck,
      tier: 'gold',
      target: clinicTarget,
      unit: 'qualifying points',
      current: balance.qualifying,
      earnedAt: qualifyingAt(clinicTarget),
    }),
    make({
      id: 'clinic',
      label: 'Clinic attendee',
      description: 'Attended an expert clinic.',
      criteria: 'Attend a confirmed clinic.',
      icon: CalendarCheck,
      tier: 'navy',
      target: 1,
      unit: 'clinic',
      ...count('clinic_attend', 1),
    }),
    make({
      id: 'voice',
      label: 'Helpful voice',
      description: 'Shared knowledge with the community.',
      criteria: 'Post a helpful reply or listing in the community.',
      icon: MessageSquareHeart,
      tier: 'blue',
      target: 1,
      unit: 'contribution',
      ...count('community_contribution', 1),
    }),
    make({
      id: 'action',
      label: 'Action taker',
      description: 'Delivered a contribution to your company action plan.',
      criteria: 'Submit evidence for an action assigned to you.',
      icon: ClipboardCheck,
      tier: 'navy',
      target: 1,
      unit: 'action',
      ...count('action_contribution', 1),
    }),
    make({
      id: '250',
      label: '250 club',
      description: 'Earned 250 lifetime points.',
      criteria: 'Earn 250 lifetime points.',
      icon: Flame,
      tier: 'gold',
      target: 250,
      unit: 'points',
      current: balance.lifetime,
      earnedAt: lifetimeAt(250),
    }),
    make({
      id: '500',
      label: '500 club',
      description: 'Earned 500 lifetime points.',
      criteria: 'Earn 500 lifetime points.',
      icon: Sparkles,
      tier: 'gold',
      target: 500,
      unit: 'points',
      current: balance.lifetime,
      earnedAt: lifetimeAt(500),
    }),
    make({
      id: '1000',
      label: '1,000 club',
      description: 'Earned 1,000 lifetime points.',
      criteria: 'Earn 1,000 lifetime points.',
      icon: Crown,
      tier: 'navy',
      target: 1000,
      unit: 'points',
      current: balance.lifetime,
      earnedAt: lifetimeAt(1000),
    }),
  ]
}

/** Locked achievements closest to completion first. */
export const nextUp = (list: Achievement[]) =>
  list.filter((a) => !a.earned).sort((a, b) => b.current / b.target - a.current / a.target)

export const countOf = (ledger: LedgerRow[], action: PointsAction) =>
  ledger.filter((e) => e.action === action && e.amount > 0).length
