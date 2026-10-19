// Reference data. Principles and journey stages are official WEPs content (source:
// https://www.weps.org/about, accessed 19 October 2026). Everything else is a proposed
// portal configuration for the mockup.

import type { CompanyPermission, DepartmentId, PrincipleId, Role } from './types'

export interface Principle {
  id: PrincipleId
  title: string
  short: string
  description: string
  url: string
  icon: string
}

export const PRINCIPLES: Principle[] = [
  {
    id: 1,
    title: 'High-Level Corporate Leadership',
    short: 'Leadership',
    description:
      'Corporate leadership is a key and integral part of making gender equality and women’s empowerment a top strategic priority.',
    url: 'https://www.weps.org/principle/high-level-corporate-leadership',
    icon: '/brand/principle-1.png',
  },
  {
    id: 2,
    title: 'Treat all Women and Men Fairly at Work without Discrimination',
    short: 'Fair treatment',
    description:
      'Fair treatment at work respects human rights and strengthens hiring, retention and productivity.',
    url: 'https://www.weps.org/principle/treat-all-women-and-men-fairly-work-without-discrimination',
    icon: '/brand/principle-2.png',
  },
  {
    id: 3,
    title: 'Employee Health, Well-Being and Safety',
    short: 'Health and safety',
    description:
      'Employers protect the health, safety and well-being of all workers, including against sexual harassment and violence.',
    url: 'https://www.weps.org/principle/employee-health-well-being-and-safety',
    icon: '/brand/principle-3.png',
  },
  {
    id: 4,
    title: 'Education and Training for Career Advancement',
    short: 'Education and advancement',
    description:
      'Investing in education, training and professional development opens career paths for women at every level.',
    url: 'https://www.weps.org/principle/education-and-training-career-advancement',
    icon: '/brand/principle-4.png',
  },
  {
    id: 5,
    title: 'Enterprise Development, Supply Chain and Marketing Practices',
    short: 'Enterprise and supply chains',
    description:
      'Gender-responsive procurement, supplier development and marketing practices extend opportunity across the value chain.',
    url: 'https://www.weps.org/principle/enterprise-development-supply-chain-and-marketing-practices',
    icon: '/brand/principle-5.png',
  },
  {
    id: 6,
    title: 'Community Initiatives and Advocacy',
    short: 'Community advocacy',
    description:
      'Companies lead by example in their communities and advocate for gender equality beyond the workplace.',
    url: 'https://www.weps.org/principle/community-initiatives-and-advocacy',
    icon: '/brand/principle-6.png',
  },
  {
    id: 7,
    title: 'Measurement and Reporting',
    short: 'Measurement and reporting',
    description:
      'Transparency and accountability are required: companies measure and publicly report progress on gender equality.',
    url: 'https://www.weps.org/principle/measurement-and-reporting',
    icon: '/brand/principle-7.png',
  },
]

export const principleById = (id: PrincipleId): Principle =>
  PRINCIPLES.find((p) => p.id === id) ?? (PRINCIPLES[0] as Principle)

export interface JourneyStage {
  id: string
  title: string
  description: string
}

/** The six official WEPs journey stages. Not the same as portal navigation. */
export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'consider',
    title: 'Consider',
    description: 'Build internal support for committing to the WEPs.',
  },
  {
    id: 'sign',
    title: 'Sign',
    description: 'Gather the information needed and sign the CEO Statement of Support.',
  },
  {
    id: 'activate',
    title: 'Activate',
    description: 'Share your commitment and bring internal stakeholders on board.',
  },
  {
    id: 'engage',
    title: 'Engage',
    description: 'Engage external stakeholders across your value chain.',
  },
  {
    id: 'sustain',
    title: 'Sustain',
    description: 'Gather data against the WEPs Transparency and Accountability Framework.',
  },
  {
    id: 'report',
    title: 'Report',
    description: 'Report progress publicly on the key performance indicators.',
  },
]

export const DEPARTMENTS: { id: DepartmentId; label: string; short: string }[] = [
  { id: 'hr', label: 'Human Resources', short: 'HR' },
  { id: 'procurement', label: 'Procurement', short: 'Procurement' },
  { id: 'marketing', label: 'Marketing and Communications', short: 'Marketing' },
  { id: 'sustainability', label: 'Sustainability and Reporting', short: 'Sustainability' },
  { id: 'operations', label: 'Operations', short: 'Operations' },
  { id: 'leadership', label: 'Leadership', short: 'Leadership' },
]

export const departmentLabel = (id?: DepartmentId) =>
  DEPARTMENTS.find((d) => d.id === id)?.label ?? 'No department'

export const ROLE_LABELS: Record<Role, string> = {
  global_admin: 'UN Women / WEPs Global Administrator',
  ceo: 'Company CEO / Executive Sponsor',
  company_admin: 'Company Administrator / WEPs Focal Point',
  employee: 'Company Employee',
  mentor: 'Mentor / Trainer',
}

export const ROLE_SHORT: Record<Role, string> = {
  global_admin: 'UN Women Admin',
  ceo: 'CEO',
  company_admin: 'Focal Point',
  employee: 'Employee',
  mentor: 'Mentor / Trainer',
}

export const PERMISSIONS: {
  id: CompanyPermission
  label: string
  description: string
  sensitive?: boolean
}[] = [
  {
    id: 'edit_profile',
    label: 'Edit company profile',
    description: 'Update company details and contacts.',
  },
  {
    id: 'manage_team',
    label: 'Invite and manage employees',
    description: 'Invite colleagues, set departments, resend or remove access.',
  },
  {
    id: 'manage_assessment',
    label: 'Manage assessment and action plan',
    description: 'Complete the baseline assessment and maintain the action plan.',
  },
  {
    id: 'prepare_reports',
    label: 'Prepare annual reports',
    description: 'Draft report sections, indicators and evidence.',
  },
  {
    id: 'submit_reports',
    label: 'Submit annual reports',
    description: 'Final submission to UN Women on behalf of the company.',
    sensitive: true,
  },
  {
    id: 'manage_listings',
    label: 'Manage marketplace listings',
    description: 'Submit and edit company products and services.',
  },
  {
    id: 'purchase_certifications',
    label: 'Purchase certifications',
    description: 'Buy company certifications and sit company exams.',
    sensitive: true,
  },
]

/** New company administrators default to operational responsibilities only. */
export const DEFAULT_ADMIN_PERMISSIONS: CompanyPermission[] = [
  'edit_profile',
  'manage_team',
  'manage_assessment',
  'prepare_reports',
  'manage_listings',
]

export const ALL_PERMISSIONS: CompanyPermission[] = PERMISSIONS.map((p) => p.id)

export const SECTORS = [
  'Financial services',
  'Manufacturing',
  'Retail and consumer goods',
  'Technology and telecommunications',
  'Energy and utilities',
  'Healthcare',
  'Food and agriculture',
  'Logistics and transport',
  'Professional services',
  'Textiles and apparel',
]

export const REGIONS = [
  'Africa',
  'Arab States',
  'Asia and the Pacific',
  'Europe and Central Asia',
  'Latin America and the Caribbean',
  'North America',
]

export const COUNTRIES = [
  'Brazil',
  'Egypt',
  'France',
  'Germany',
  'India',
  'Jordan',
  'Kenya',
  'Mexico',
  'Morocco',
  'Nigeria',
  'Philippines',
  'Saudi Arabia',
  'Singapore',
  'South Africa',
  'Türkiye',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
]

export const OFFICIAL_LINKS = {
  about: 'https://www.weps.org/about',
  join: 'https://www.weps.org/join',
  resources: 'https://www.weps.org/resources',
  home: 'https://www.weps.org/',
  learn2026: 'https://www.weps.org/event/weps-learn-2026-commitment-action',
  ceoStatement: 'https://www.weps.org/join',
  contact: 'mailto:weps@unwomen.org',
}
