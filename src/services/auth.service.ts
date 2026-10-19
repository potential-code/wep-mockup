import { fullName } from '@shared/permissions'
import { ALL_PERMISSIONS } from '@shared/reference'
import type { CompanyPermission, DepartmentId, Role, User } from '@shared/types'
import { resetDemo } from '@/mocks/db'
import {
  ApiError,
  audit,
  commit,
  companyOf,
  currentUser,
  db,
  delay,
  findOr404,
  notify,
  now,
  out,
} from './api'

export interface SessionInfo {
  user: User
  company?: ReturnType<typeof companyOf>
}

export async function getSession(): Promise<SessionInfo | null> {
  const user = currentUser()
  if (!user) return null
  return out({ user, company: companyOf(user) })
}

export interface DemoPersona {
  key: string
  label: string
  description: string
  userId: string
  role: Role
  department?: DepartmentId
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    key: 'admin',
    label: 'UN Women Administrator',
    description: 'Executive dashboard with Reporting and Platform Management',
    userId: 'u-admin',
    role: 'global_admin',
  },
  {
    key: 'ceo',
    label: 'Company CEO',
    description: 'Asteria Group executive dashboard',
    userId: 'u-leila',
    role: 'ceo',
  },
  {
    key: 'company_admin',
    label: 'Company Administrator',
    description: 'Asteria Group operational dashboard',
    userId: 'u-nora',
    role: 'company_admin',
  },
  {
    key: 'employee-hr',
    label: 'Employee · HR',
    description: 'Maya Chen, one lesson from unlocking a clinic',
    userId: 'u-maya',
    role: 'employee',
    department: 'hr',
  },
  {
    key: 'employee-procurement',
    label: 'Employee · Procurement',
    description: 'Omar Reed, 620 points ready for mentoring',
    userId: 'u-omar',
    role: 'employee',
    department: 'procurement',
  },
  {
    key: 'employee-marketing',
    label: 'Employee · Marketing',
    description: 'Elena Martin, communications pathway',
    userId: 'u-elena',
    role: 'employee',
    department: 'marketing',
  },
  {
    key: 'mentor',
    label: 'Mentor or Trainer',
    description: 'Dr Sofia Bennett, one-to-one and clinics',
    userId: 'u-sofia',
    role: 'mentor',
  },
]

export async function signInAs(userId: string) {
  await delay(260)
  const user = findOr404(db.users, (u) => u.id === userId, 'User')
  db.session = { userId: user.id, startedAt: now() }
  user.lastActiveAt = now()
  commit()
  return out(user)
}

/** Simulated email sign-in: matches a known demo email, never checks a real password. */
export async function signInWithEmail(email: string) {
  await delay(400)
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  if (user?.invitationStatus !== 'accepted') {
    throw new ApiError(
      'We couldn’t find an active account for that email. Try a demo account below.',
      'not_found',
    )
  }
  return signInAs(user.id)
}

export async function signOut() {
  await delay(120)
  db.session = null
  commit()
}

export async function requestPasswordReset(email: string) {
  await delay(500)
  return { sentTo: email }
}

export async function resetDemoData() {
  await delay(400)
  resetDemo()
}

export async function getInvitation(token: string) {
  await delay()
  const inv = db.invitations.find((i) => i.token === token)
  if (!inv) throw new ApiError('This invitation link is not valid.', 'not_found')
  if (inv.status === 'pending' && new Date(inv.expiresAt) < new Date(now())) inv.status = 'expired'
  const inviter = db.users.find((u) => u.id === inv.invitedById)
  const company = inv.companyId ? db.companies.find((c) => c.id === inv.companyId) : undefined
  return out({ invitation: inv, inviterName: inviter ? fullName(inviter) : 'UN Women', company })
}

/** Accept an invitation: create or activate the user, then sign them in. */
export async function acceptInvitation(
  token: string,
  profile: { firstName: string; lastName: string; title: string },
) {
  await delay(500)
  const inv = findOr404(db.invitations, (i) => i.token === token, 'Invitation')
  if (inv.status === 'accepted')
    throw new ApiError('This invitation has already been accepted. Sign in instead.', 'conflict')
  if (inv.status !== 'pending')
    throw new ApiError(
      'This invitation has expired. Ask your administrator to resend it.',
      'conflict',
    )

  let user = inv.userId ? db.users.find((u) => u.id === inv.userId) : undefined
  if (!user) {
    user = {
      id: `u-${inv.id}`,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: inv.email,
      title: profile.title,
      role: inv.role,
      companyId: inv.companyId,
      department: inv.department,
      permissions: inv.role === 'ceo' ? ALL_PERMISSIONS : inv.permissions,
      invitationStatus: 'accepted',
      profileComplete: false,
      timezone: 'Asia/Dubai',
      mentorFormats: inv.role === 'mentor' ? ['one_to_one'] : undefined,
    }
    db.users.push(user)
    inv.userId = user.id
  }
  Object.assign(user, {
    firstName: profile.firstName,
    lastName: profile.lastName,
    title: profile.title,
    invitationStatus: 'accepted',
    activatedAt: now(),
    lastActiveAt: now(),
  })
  inv.status = 'accepted'
  db.session = { userId: user.id, startedAt: now() }

  if (inv.invitedById) {
    notify({
      userId: inv.invitedById,
      category: 'team',
      title: `${fullName(user)} accepted your invitation`,
      body: `${fullName(user)} has joined and can now start their learning path.`,
      link: '/portal/company/team',
      critical: false,
    })
  }
  audit('Invitation accepted', fullName(user))
  commit()
  return out(user)
}

export async function updateMyProfile(
  patch: Partial<Pick<User, 'firstName' | 'lastName' | 'title' | 'timezone'>>,
) {
  await delay()
  const user = currentUser()
  if (!user) throw new ApiError('Please sign in.', 'unauthorised')
  Object.assign(user, patch, { profileComplete: true })
  commit()
  return out(user)
}

export type { CompanyPermission }
