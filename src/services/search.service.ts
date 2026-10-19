// Global search (brief §25): only records the active role may access, with labelled types.

import { can, fullName } from '@shared/permissions'
import { companyOf, db, delay, out, requireUser } from './api'

export interface SearchResult {
  id: string
  type:
    | 'Course'
    | 'Resource'
    | 'Clinic'
    | 'Mentor'
    | 'Action'
    | 'Report'
    | 'Company'
    | 'User'
    | 'Application'
    | 'Thread'
    | 'Listing'
  title: string
  subtitle?: string
  to: string
}

export async function search(query: string): Promise<SearchResult[]> {
  await delay(120)
  const user = requireUser()
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const hit = (...s: (string | undefined)[]) => s.some((x) => x?.toLowerCase().includes(q))
  const company = companyOf(user)
  const isAdmin = user.role === 'global_admin'
  const res: SearchResult[] = []

  for (const c of db.courses)
    if (hit(c.title, c.topic))
      res.push({
        id: c.id,
        type: 'Course',
        title: c.title,
        subtitle: c.topic,
        to: isAdmin ? `/admin/manage/courses` : `/portal/learn/${c.id}`,
      })
  for (const r of db.resources)
    if (r.status === 'published' && hit(r.title, r.topic))
      res.push({
        id: r.id,
        type: 'Resource',
        title: r.title,
        subtitle: r.publisher,
        to: `/portal/resources/${r.id}`,
      })
  if (!isAdmin && user.role !== 'mentor') {
    for (const e of db.events)
      if (hit(e.title, e.topic))
        res.push({
          id: e.id,
          type: 'Clinic',
          title: e.title,
          subtitle: e.type,
          to: `/portal/clinics/${e.id}`,
        })
    for (const p of db.mentorProfiles.filter((m) => m.published)) {
      const u = db.users.find((x) => x.id === p.userId)
      if (u && hit(fullName(u), p.headline, ...p.expertise))
        res.push({
          id: p.userId,
          type: 'Mentor',
          title: fullName(u),
          subtitle: p.headline,
          to: `/portal/mentorship/${p.userId}`,
        })
    }
    if (can(user, 'actions.manage', company)) {
      for (const a of db.actions.filter((x) => x.companyId === user.companyId))
        if (hit(a.title))
          res.push({ id: a.id, type: 'Action', title: a.title, to: `/portal/action-plan/${a.id}` })
    }
    if (can(user, 'reports.view', company)) {
      for (const r of db.reports.filter((x) => x.companyId === user.companyId))
        if (hit(String(r.year), 'report'))
          res.push({
            id: r.id,
            type: 'Report',
            title: `${r.year} annual report`,
            subtitle: r.status,
            to: `/portal/reports/${r.year}`,
          })
    }
  }
  if (isAdmin) {
    for (const c of db.companies)
      if (hit(c.name, c.country, c.sector))
        res.push({
          id: c.id,
          type: 'Company',
          title: c.name,
          subtitle: `${c.country} · ${c.sector}`,
          to: `/admin/reporting/companies/${c.id}`,
        })
    for (const u of db.users)
      if (hit(fullName(u), u.email))
        res.push({
          id: u.id,
          type: 'User',
          title: fullName(u),
          subtitle: u.email,
          to: `/admin/reporting/users?q=${encodeURIComponent(u.email)}`,
        })
    for (const a of db.applications)
      if (hit(a.reference, a.data.company.name))
        res.push({
          id: a.id,
          type: 'Application',
          title: a.data.company.name,
          subtitle: a.reference,
          to: `/admin/manage/applications/${a.id}`,
        })
    for (const r of db.reports) {
      const c = db.companies.find((x) => x.id === r.companyId)
      if (hit(c?.name, String(r.year)) && q.length > 3)
        res.push({
          id: r.id,
          type: 'Report',
          title: `${c?.name} · ${r.year}`,
          subtitle: r.status,
          to: `/admin/reporting/companies/${r.companyId}`,
        })
    }
  }
  for (const t of db.threads.filter(
    (x) =>
      x.status === 'visible' &&
      (x.space === 'discussions' || can(user, 'community.signatory_circle', company)),
  )) {
    if (hit(t.title))
      res.push({
        id: t.id,
        type: 'Thread',
        title: t.title,
        subtitle: t.channel,
        to: `/portal/community/thread/${t.id}`,
      })
  }
  return out(res.slice(0, 30))
}
