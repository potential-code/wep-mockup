// Points ledger (brief §21). Awards are idempotent: one event per sourceKey, so repeated
// clicks, retries and reloads never duplicate points. Three views of one ledger:
// lifetime (achievements), redeemable (spendable) and qualifying (designated preparation).

import { POINTS_RULES } from '@shared/rules'
import type { PointsAction, PointsBalance, PointsEvent } from '@shared/types'
import {
  ApiError,
  audit,
  commit,
  db,
  delay,
  newId,
  now,
  out,
  requireCapability,
  requireUser,
} from './api'

export function pointsBalance(userId: string): PointsBalance {
  const events = db.points.filter((e) => e.userId === userId)
  return {
    lifetime: events
      .filter((e) => e.amount > 0 && e.action !== 'mentor_refund')
      .reduce((n, e) => n + e.amount, 0),
    redeemable: events.reduce((n, e) => n + e.amount, 0),
    qualifying: events.filter((e) => e.qualifying).reduce((n, e) => n + e.amount, 0),
  }
}

/** Internal: award once per sourceKey. Returns the event, or null if already awarded or capped. */
export function award(
  userId: string,
  action: Exclude<PointsAction, 'adjustment'>,
  sourceKey: string,
  sourceLabel: string,
  opts: { amount?: number; qualifying?: boolean; sourceLink?: string } = {},
): PointsEvent | null {
  if (db.points.some((e) => e.userId === userId && e.sourceKey === sourceKey)) return null
  const rule =
    action in POINTS_RULES ? POINTS_RULES[action as keyof typeof POINTS_RULES] : undefined
  const amount = opts.amount ?? rule?.amount ?? 0

  if (action === 'community_contribution') {
    const today = now().slice(0, 10)
    const earnedToday = db.points
      .filter(
        (e) => e.userId === userId && e.action === action && e.createdAt.slice(0, 10) === today,
      )
      .reduce((n, e) => n + e.amount, 0)
    if (earnedToday + amount > db.settings.communityDailyCap) return null
  }
  if (action === 'action_contribution') {
    const month = now().slice(0, 7)
    const earned = db.points
      .filter(
        (e) => e.userId === userId && e.action === action && e.createdAt.slice(0, 7) === month,
      )
      .reduce((n, e) => n + e.amount, 0)
    if (earned + amount > db.settings.actionMonthlyCap) return null
  }

  const event: PointsEvent = {
    id: newId('pts'),
    userId,
    action,
    amount,
    sourceKey,
    sourceLabel,
    sourceLink: opts.sourceLink,
    qualifying: opts.qualifying ?? false,
    createdAt: now(),
  }
  db.points.push(event)
  return event
}

export interface LedgerRow extends PointsEvent {
  balanceAfter: number
}

export async function getMyPoints() {
  await delay()
  const user = requireUser()
  return out(ledgerFor(user.id))
}

export function ledgerFor(userId: string) {
  const events = db.points
    .filter((e) => e.userId === userId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  let running = 0
  const rows: LedgerRow[] = events.map((e) => {
    running += e.amount
    return { ...e, balanceAfter: running }
  })
  return { balance: pointsBalance(userId), ledger: rows.reverse() }
}

/** Global admin correction, always with a reason. */
export async function adjustPoints(userId: string, amount: number, reason: string) {
  await delay()
  requireCapability('admin.manage')
  if (!reason.trim()) throw new ApiError('A reason is required for every adjustment.')
  const event: PointsEvent = {
    id: newId('pts'),
    userId,
    action: 'adjustment',
    amount,
    sourceKey: `adjust:${newId('a')}`,
    sourceLabel: 'Adjustment by UN Women',
    qualifying: false,
    createdAt: now(),
    reason,
  }
  db.points.push(event)
  audit('Points adjustment', userId, `${amount > 0 ? '+' : ''}${amount} · ${reason}`)
  commit()
  return out(event)
}

/** Community leaderboard ranks contribution and learning only. */
export async function getLeaderboard(companyId?: string) {
  await delay()
  const users = db.users.filter(
    (u) =>
      u.role === 'employee' &&
      u.invitationStatus === 'accepted' &&
      (!companyId || u.companyId === companyId),
  )
  return out(
    users
      .map((u) => ({
        userId: u.id,
        name: `${u.firstName} ${u.lastName}`,
        avatar: u.avatar,
        department: u.department,
        lifetime: pointsBalance(u.id).lifetime,
      }))
      .sort((a, b) => b.lifetime - a.lifetime)
      .slice(0, 10),
  )
}
