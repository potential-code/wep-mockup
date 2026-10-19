// Mock API plumbing shared by every service: latency, errors, demo clock, auth context.

import { type Capability, can } from '@shared/permissions'
import { DEMO_NOW } from '@shared/rules'
import type { Company, Notification, User } from '@shared/types'
import { commit, db, newId } from '@/mocks/db'

export class ApiError extends Error {
  constructor(
    message: string,
    public code: 'unauthorised' | 'forbidden' | 'not_found' | 'invalid' | 'conflict' = 'invalid',
  ) {
    super(message)
  }
}

/** Simulated network latency so loading states are visible. */
export const delay = (ms = 220) =>
  new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 120))

const loadedAt = Date.now()

/** Demo clock: starts at 19 Oct 2026 and moves forward in real time. */
export const now = () =>
  new Date(new Date(DEMO_NOW).getTime() + (Date.now() - loadedAt)).toISOString()

export const out = <T>(value: T): T => structuredClone(value)

export function currentUser(): User | null {
  const id = db.session?.userId
  return id ? (db.users.find((u) => u.id === id) ?? null) : null
}

export function requireUser(): User {
  const user = currentUser()
  if (!user) throw new ApiError('Please sign in to continue.', 'unauthorised')
  return user
}

export const companyOf = (user: User | null): Company | undefined =>
  user?.companyId ? db.companies.find((c) => c.id === user.companyId) : undefined

export function requireCapability(capability: Capability): User {
  const user = requireUser()
  if (!can(user, capability, companyOf(user))) {
    throw new ApiError('You don’t have permission to do that.', 'forbidden')
  }
  return user
}

export function findOr404<T>(items: T[], predicate: (item: T) => boolean, what: string): T {
  const item = items.find(predicate)
  if (!item) throw new ApiError(`${what} not found.`, 'not_found')
  return item
}

export const userById = (id?: string) => db.users.find((u) => u.id === id)

export function notify(
  input: Omit<Notification, 'id' | 'createdAt' | 'read'> & { read?: boolean },
) {
  db.notifications.unshift({ id: newId('ntf'), createdAt: now(), read: false, ...input })
}

export function audit(action: string, target: string, detail?: string) {
  db.audit.unshift({
    id: newId('aud'),
    at: now(),
    actorId: db.session?.userId ?? 'system',
    action,
    target,
    detail,
  })
}

export { commit, db, newId }
