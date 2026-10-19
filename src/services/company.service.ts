import { fullName } from '@shared/permissions'
import { DEFAULT_ADMIN_PERMISSIONS } from '@shared/reference'
import type { Company, CompanyPermission, DepartmentId, Invitation, User } from '@shared/types'
import {
  ApiError,
  audit,
  commit,
  db,
  delay,
  findOr404,
  newId,
  notify,
  now,
  out,
  requireCapability,
  requireUser,
} from './api'
import { pointsBalance } from './points.service'

export async function listCompanies() {
  await delay()
  return out(db.companies)
}

export async function getCompany(companyId: string) {
  await delay()
  return out(findOr404(db.companies, (c) => c.id === companyId, 'Company'))
}

/** Public directory: approved signatories with approved public information only. */
export async function listPublicDirectory() {
  await delay()
  return out(
    db.companies
      .filter((c) => c.signatoryStatus === 'approved' && c.publicProfileApproved)
      .map(
        ({
          id,
          name,
          logo,
          country,
          region,
          sector,
          size,
          memberSince,
          summary,
          ceoCommitment,
          priorityPrinciples,
        }) => ({
          id,
          name,
          logo,
          country,
          region,
          sector,
          size,
          memberSince,
          summary,
          ceoCommitment,
          priorityPrinciples,
        }),
      ),
  )
}

/** Identity and public fields go to review; operational details save directly. */
const REVIEWED_FIELDS = ['name', 'country', 'summary'] as const

export async function updateCompany(companyId: string, patch: Partial<Company>) {
  await delay(300)
  requireCapability('company.edit_profile')
  const company = findOr404(db.companies, (c) => c.id === companyId, 'Company')
  const reviewed = Object.entries(patch).find(
    ([k, v]) =>
      (REVIEWED_FIELDS as readonly string[]).includes(k) && v !== company[k as keyof Company],
  )
  const { name: _n, country: _c, summary: _s, ...direct } = patch
  Object.assign(company, direct)
  if (reviewed) {
    company.pendingProfileRevision = {
      field: reviewed[0],
      value: String(reviewed[1]),
      requestedAt: now(),
    }
    notify({
      userId: 'u-admin',
      category: 'system',
      title: `${company.name} requested a profile change`,
      body: `Change to ${reviewed[0]} awaiting review.`,
      link: '/admin/manage/companies',
      critical: false,
    })
  }
  audit(
    'Company profile updated',
    company.name,
    reviewed ? `${reviewed[0]} sent for review` : undefined,
  )
  commit()
  return { company: out(company), reviewPending: Boolean(reviewed) }
}

export interface TeamMember extends User {
  learningProgress: number
  points: number
}

export async function getTeam(companyId: string): Promise<TeamMember[]> {
  await delay()
  const members = db.users.filter((u) => u.companyId === companyId)
  return out(
    members.map((u) => {
      const progress = db.progress.filter((p) => p.userId === u.id)
      const lessons = progress.reduce((n, p) => n + p.completedLessonIds.length, 0)
      const completed = progress.some((p) => p.completedAt)
      return {
        ...u,
        learningProgress: completed ? 100 : Math.min(95, Math.round((lessons / 5) * 100)),
        points: pointsBalance(u.id).lifetime,
      }
    }),
  )
}

export async function inviteUser(input: {
  firstName: string
  lastName: string
  email: string
  department: DepartmentId
  asAdmin?: boolean
  permissions?: CompanyPermission[]
}) {
  await delay(350)
  const actor = requireCapability('company.manage_team')
  if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new ApiError('Someone with that email already has an account.', 'conflict')
  }
  const companyId = actor.companyId as string
  const id = newId('u')
  const permissions = input.asAdmin ? (input.permissions ?? DEFAULT_ADMIN_PERMISSIONS) : []
  const user: User = {
    id,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    title: input.asAdmin ? 'Company Administrator' : 'Team member',
    role: input.asAdmin ? 'company_admin' : 'employee',
    companyId,
    department: input.department,
    permissions,
    invitationStatus: 'pending',
    invitedAt: now(),
    invitedById: actor.id,
    profileComplete: false,
    timezone: actor.timezone,
  }
  const token = `${input.firstName.toLowerCase()}-${Math.random().toString(36).slice(2, 8)}`
  const invitation: Invitation = {
    id: newId('inv'),
    token,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    role: user.role,
    companyId,
    department: input.department,
    permissions,
    invitedById: actor.id,
    createdAt: now(),
    expiresAt: new Date(new Date(now()).getTime() + 21 * 864e5).toISOString(),
    status: 'pending',
    userId: id,
  }
  db.users.push(user)
  db.invitations.push(invitation)
  audit('User invited', `${fullName(user)} (${user.role})`)
  commit()
  return out({ user, invitation })
}

export async function resendInvitation(userId: string) {
  await delay()
  requireCapability('company.manage_team')
  const inv = findOr404(db.invitations, (i) => i.userId === userId, 'Invitation')
  inv.status = 'pending'
  inv.createdAt = now()
  inv.expiresAt = new Date(new Date(now()).getTime() + 21 * 864e5).toISOString()
  const user = db.users.find((u) => u.id === userId)
  if (user) user.invitationStatus = 'pending'
  commit()
  return out(inv)
}

export async function updateDepartment(userId: string, department: DepartmentId) {
  await delay()
  requireCapability('company.manage_team')
  const user = findOr404(db.users, (u) => u.id === userId, 'User')
  user.department = department
  commit()
  return out(user)
}

/** Employees request a correction rather than silently changing the reporting structure. */
export async function requestDepartmentCorrection(department: DepartmentId, note: string) {
  await delay()
  const user = requireUser()
  const company = db.companies.find((c) => c.id === user.companyId)
  if (company?.focalPointId) {
    notify({
      userId: company.focalPointId,
      category: 'team',
      title: `${fullName(user)} asked to change department`,
      body: `Requested: ${department}. ${note}`,
      link: '/portal/company/team',
      critical: false,
    })
  }
  commit()
}

/** CEO appoints a company administrator (existing colleague) with selected permissions. */
export async function assignAdministrator(userId: string, permissions: CompanyPermission[]) {
  await delay(400)
  const ceo = requireCapability('company.delegate')
  const user = findOr404(
    db.users,
    (u) => u.id === userId && u.companyId === ceo.companyId,
    'Colleague',
  )
  if (user.role === 'ceo') throw new ApiError('The CEO already holds all permissions.', 'invalid')
  user.role = 'company_admin'
  user.permissions = permissions
  const company = db.companies.find((c) => c.id === ceo.companyId)
  if (company && !company.focalPointId) company.focalPointId = user.id
  notify({
    userId: user.id,
    category: 'team',
    title: 'You are now a Company Administrator',
    body: `${fullName(ceo)} gave you ${permissions.length} permissions for ${company?.name}.`,
    link: '/portal',
    critical: false,
  })
  audit('Administrator assigned', fullName(user), permissions.join(', '))
  commit()
  return out(user)
}

export async function updatePermissions(userId: string, permissions: CompanyPermission[]) {
  await delay(300)
  const ceo = requireCapability('company.delegate')
  const user = findOr404(
    db.users,
    (u) => u.id === userId && u.companyId === ceo.companyId,
    'Colleague',
  )
  user.permissions = permissions
  if (permissions.length === 0 && user.role === 'company_admin') user.role = 'employee'
  audit('Permissions updated', fullName(user), permissions.join(', ') || 'none')
  commit()
  return out(user)
}

/** Removing access keeps historical reporting evidence. */
export async function removeAccess(userId: string) {
  await delay(300)
  requireCapability('company.manage_team')
  const user = findOr404(db.users, (u) => u.id === userId, 'User')
  if (user.role === 'ceo')
    throw new ApiError('The CEO’s access can only be changed by UN Women.', 'forbidden')
  user.suspended = true
  user.invitationStatus = 'revoked'
  audit('Company access removed', fullName(user))
  commit()
  return out(user)
}

export async function getCompanyActivity(companyId: string) {
  await delay()
  const names = new Set(db.users.filter((u) => u.companyId === companyId).map((u) => u.id))
  const company = db.companies.find((c) => c.id === companyId)
  return out(
    db.audit
      .filter((a) => names.has(a.actorId) || (company && a.target.includes(company.name)))
      .slice(0, 40),
  )
}
