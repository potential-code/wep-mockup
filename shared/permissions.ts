// Permission model (brief §2). Used by services to enforce access and by the UI to show
// permission-aware navigation and actions. Company access, signatory status, certification
// status and points are separate attributes; none confers another.

import type { Company, CompanyPermission, Role, User } from './types'

export type Capability =
  | 'company.view_profile'
  | 'company.edit_profile'
  | 'company.manage_team'
  | 'company.delegate'
  | 'assessment.view'
  | 'assessment.manage'
  | 'actions.manage'
  | 'actions.view_assigned'
  | 'learn.use'
  | 'resources.use'
  | 'clinics.use'
  | 'mentorship.book'
  | 'concierge.use'
  | 'certification.view'
  | 'certification.purchase'
  | 'certification.exam'
  | 'community.discussions'
  | 'community.signatory_circle'
  | 'marketplace.browse'
  | 'marketplace.manage'
  | 'reports.view'
  | 'reports.prepare'
  | 'reports.submit'
  | 'points.view'
  | 'expert.workspace'
  | 'admin.reporting'
  | 'admin.manage'

const has = (user: User, p: CompanyPermission) =>
  user.role === 'ceo' || user.permissions.includes(p)

const isCompanyRole = (role: Role) =>
  role === 'ceo' || role === 'company_admin' || role === 'employee'

/** Pending applicants keep a locked portal: only application status is available. */
export const isActiveCompanyMember = (user: User, company?: Company) =>
  isCompanyRole(user.role) && company?.signatoryStatus === 'approved' && !user.suspended

export function can(
  user: User | null | undefined,
  capability: Capability,
  company?: Company,
): boolean {
  if (!user) return false
  if (user.role === 'global_admin') {
    return (
      capability.startsWith('admin.') ||
      capability === 'community.discussions' ||
      capability === 'community.signatory_circle' ||
      capability === 'marketplace.browse' ||
      capability === 'resources.use' ||
      capability === 'concierge.use'
    )
  }
  if (user.role === 'mentor') {
    return [
      'expert.workspace',
      'community.discussions',
      'resources.use',
      'concierge.use',
      'marketplace.browse',
    ].includes(capability)
  }
  if (!isActiveCompanyMember(user, company)) return false

  switch (capability) {
    case 'company.view_profile':
    case 'learn.use':
    case 'resources.use':
    case 'clinics.use':
    case 'mentorship.book':
    case 'concierge.use':
    case 'certification.view':
    case 'community.discussions':
    case 'community.signatory_circle':
    case 'marketplace.browse':
    case 'points.view':
    case 'actions.view_assigned':
      return true
    case 'company.edit_profile':
      return has(user, 'edit_profile')
    case 'company.manage_team':
      return has(user, 'manage_team')
    case 'company.delegate':
      return user.role === 'ceo'
    case 'assessment.view':
    case 'assessment.manage':
    case 'actions.manage':
      return has(user, 'manage_assessment')
    case 'certification.purchase':
    case 'certification.exam':
      return has(user, 'purchase_certifications')
    case 'marketplace.manage':
      return has(user, 'manage_listings')
    case 'reports.view':
    case 'reports.prepare':
      return has(user, 'prepare_reports') || has(user, 'submit_reports')
    case 'reports.submit':
      return has(user, 'submit_reports')
    default:
      return false
  }
}

export const fullName = (u: Pick<User, 'firstName' | 'lastName'>) => `${u.firstName} ${u.lastName}`
export const initials = (u: Pick<User, 'firstName' | 'lastName'>) =>
  `${u.firstName.replace(/^Dr\s+/, '')[0] ?? ''}${u.lastName[0] ?? ''}`
