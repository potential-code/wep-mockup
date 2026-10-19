// Proposed demo rules from the brief (§12, §14, §15, §17, §21). Configurable in Platform
// Management; these are the starting values, labelled in the UI as demo rules.

import type { PointsAction } from './types'

export const POINTS_RULES: Record<
  Exclude<PointsAction, 'mentor_refund' | 'adjustment'>,
  { amount: number; label: string; control: string; qualifying: boolean }
> = {
  profile_complete: {
    amount: 20,
    label: 'Complete personal profile',
    control: 'Once per user.',
    qualifying: false,
  },
  lesson_complete: {
    amount: 25,
    label: 'Complete a learning lesson',
    control: 'Once per unique lesson completion.',
    qualifying: true,
  },
  quiz_pass: {
    amount: 100,
    label: 'Pass the designated path quiz',
    control: 'Once per designated quiz.',
    qualifying: true,
  },
  clinic_attend: {
    amount: 75,
    label: 'Attend a confirmed clinic',
    control: 'Once per attended event.',
    qualifying: false,
  },
  feedback: {
    amount: 10,
    label: 'Complete a feedback form',
    control: 'Once per form.',
    qualifying: false,
  },
  community_contribution: {
    amount: 5,
    label: 'Helpful community contribution',
    control: 'Maximum 20 points daily, subject to moderation.',
    qualifying: false,
  },
  action_contribution: {
    amount: 25,
    label: 'Submit an assigned action contribution',
    control: 'Once after accepted contribution, maximum 100 per month.',
    qualifying: false,
  },
  mentor_redeem: {
    amount: -500,
    label: 'Redeem a 30 minute mentoring session',
    control: 'Deduct once when booking confirms.',
    qualifying: false,
  },
}

export const DEMO_RULES = {
  quizPassMark: 70,
  qualifyingPointsForClinic: 200,
  mentorSessionCost: 500,
  mentorSessionMinutes: 30,
  cancellationWindowHours: 24,
  certificationPrice: 1200,
  certificationPassMark: 80,
  certificationQuestions: 10,
  communityDailyCap: 20,
  actionMonthlyCap: 100,
  reportingYear: 2026,
} as const

/** "Now" for the demo, so seeded dates stay coherent. */
export const DEMO_NOW = '2026-10-19T09:00:00.000Z'
