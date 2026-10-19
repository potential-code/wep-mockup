// Resource library (brief §13). Member-only material shows a source link and access note
// rather than pretending to download restricted content.

import type { Resource } from '@shared/types'
import {
  audit,
  commit,
  currentUser,
  db,
  delay,
  findOr404,
  newId,
  now,
  out,
  requireCapability,
  requireUser,
} from './api'

export async function listPublicResources() {
  await delay()
  return out(db.resources.filter((r) => r.status === 'published' && r.access === 'public'))
}

export async function listResources() {
  await delay()
  const user = requireUser()
  const isAdmin = user.role === 'global_admin'
  return out({
    resources: db.resources.filter((r) => isAdmin || r.status === 'published'),
    saved: db.savedResources.filter((s) => s.userId === user.id).map((s) => s.resourceId),
    recent: db.recentResources
      .filter((s) => s.userId === user.id)
      .sort((a, b) => b.at.localeCompare(a.at))
      .map((s) => s.resourceId)
      .slice(0, 6),
  })
}

export async function getResource(resourceId: string) {
  await delay()
  const user = currentUser()
  const r = findOr404(db.resources, (x) => x.id === resourceId, 'Resource')
  if (user) {
    db.recentResources = db.recentResources.filter(
      (x) => !(x.userId === user.id && x.resourceId === resourceId),
    )
    db.recentResources.push({ userId: user.id, resourceId, at: now() })
    commit()
  }
  return out({
    resource: r,
    saved: user
      ? db.savedResources.some((s) => s.userId === user.id && s.resourceId === resourceId)
      : false,
    courses: db.courses.filter((c) => r.relatedCourseIds.includes(c.id)),
    events: db.events.filter((e) => r.relatedEventIds.includes(e.id)),
    related: db.resources
      .filter(
        (x) =>
          x.id !== r.id &&
          x.status === 'published' &&
          (x.principle === r.principle || x.topic === r.topic),
      )
      .slice(0, 3),
    actions: user ? db.actions.filter((a) => a.companyId === user.companyId) : [],
  })
}

export async function toggleSaved(resourceId: string) {
  await delay(150)
  const user = requireUser()
  const i = db.savedResources.findIndex((s) => s.userId === user.id && s.resourceId === resourceId)
  if (i >= 0) db.savedResources.splice(i, 1)
  else db.savedResources.push({ userId: user.id, resourceId, at: now() })
  commit()
  return i < 0
}

export async function attachToAction(resourceId: string, actionId: string) {
  await delay(250)
  const user = requireUser()
  const a = findOr404(
    db.actions,
    (x) => x.id === actionId && x.companyId === user.companyId,
    'Action',
  )
  if (!a.linkedResourceIds.includes(resourceId)) a.linkedResourceIds.push(resourceId)
  a.history.push({ at: now(), byId: user.id, label: 'Reference attached from Resources' })
  commit()
}

/** Global admin: upload, tag, version, schedule, archive. Submitted reports keep old references. */
export async function upsertResource(input: Resource) {
  await delay(300)
  requireCapability('admin.manage')
  const i = db.resources.findIndex((r) => r.id === input.id)
  if (i >= 0) db.resources[i] = input
  else db.resources.unshift({ ...input, id: input.id || newId('res') })
  audit(
    i >= 0 ? 'Resource updated' : 'Resource uploaded',
    input.title,
    `v${input.version} · ${input.status}`,
  )
  commit()
  return out(input)
}
