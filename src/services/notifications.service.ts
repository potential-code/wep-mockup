import { commit, db, delay, out, requireUser } from './api'

export async function listNotifications() {
  await delay(150)
  const user = requireUser()
  return out(
    db.notifications
      .filter((n) => n.userId === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  )
}

export async function markRead(id: string) {
  await delay(60)
  const user = requireUser()
  const n = db.notifications.find((x) => x.id === id && x.userId === user.id)
  if (n) n.read = true
  commit()
}

export async function markAllRead() {
  await delay(120)
  const user = requireUser()
  for (const n of db.notifications) if (n.userId === user.id) n.read = true
  commit()
}

export const PREFERENCE_CATEGORIES = [
  { id: 'learning', label: 'Learning reminders', critical: false },
  { id: 'clinic', label: 'Clinic updates', critical: false },
  { id: 'community', label: 'Community replies', critical: false },
  { id: 'mentorship', label: 'Mentoring bookings', critical: true },
  { id: 'report', label: 'Reporting deadlines', critical: true },
  { id: 'application', label: 'Account and application', critical: true },
] as const

export async function getPreferences() {
  await delay(100)
  const user = requireUser()
  return out(db.notificationPrefs[user.id] ?? {})
}

export async function setPreference(category: string, enabled: boolean) {
  await delay(100)
  const user = requireUser()
  db.notificationPrefs[user.id] = { ...(db.notificationPrefs[user.id] ?? {}), [category]: enabled }
  commit()
}
