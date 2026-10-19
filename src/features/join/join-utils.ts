import type { ApplicationData, ApplicationDocument } from '@shared/types'
import { checkApplication } from '@/queries/applications.queries'

export interface StepMeta {
  n: number
  key: string
  label: string
  blurb: string
}

/** The eight official field groups of the Join form (brief §6). */
export const JOIN_STEPS: StepMeta[] = [
  { n: 1, key: 'company', label: 'Company', blurb: 'Who you are and what you do' },
  { n: 2, key: 'presence', label: 'Geographic presence', blurb: 'Where you operate and register' },
  { n: 3, key: 'executive', label: 'Executive', blurb: 'The CEO who signs the commitment' },
  { n: 4, key: 'contacts', label: 'Contacts', blurb: 'Who we speak to day to day' },
  { n: 5, key: 'gender', label: 'Gender balance', blurb: 'Where women are represented today' },
  { n: 6, key: 'plans', label: 'Existing plans', blurb: 'Gender action plans already in place' },
  { n: 7, key: 'referral', label: 'Referral and support', blurb: 'How you found us' },
  { n: 8, key: 'review', label: 'Review', blurb: 'Check everything and submit' },
]

export interface JoinIssue {
  step: number
  field: string
  message: string
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Official required-field checks plus a few extra inline rules. */
export function joinIssues(data: ApplicationData, documents: ApplicationDocument[]): JoinIssue[] {
  const issues: JoinIssue[] = checkApplication(data, documents)
  const add = (step: number, field: string, message: string) => {
    if (!issues.some((i) => i.field === field)) issues.push({ step, field, message })
  }
  if (data.company.isAssetOwner === 'yes' && !data.company.fundName?.trim())
    add(1, 'company.fundName', 'Fund name is required for asset owners')
  if (!data.company.ungcMember) add(1, 'company.ungcMember', 'Please choose yes or no')
  if (!data.company.isAssetOwner) add(1, 'company.isAssetOwner', 'Please choose yes or no')
  const sec = data.contacts.secondary.email
  if (sec && !EMAIL.test(sec)) add(4, 'contacts.secondary.email', 'Email address is not valid')
  if (!data.contacts.primary.firstName.trim())
    add(4, 'contacts.primary.firstName', 'Primary contact first name is required')
  if (!data.contacts.primary.lastName.trim())
    add(4, 'contacts.primary.lastName', 'Primary contact last name is required')
  const pct: [string, string | undefined, string][] = [
    ['genderBalance.employees', data.genderBalance.employees, 'Women among employees'],
    ['genderBalance.management', data.genderBalance.management, 'Women in management'],
    ['genderBalance.board', data.genderBalance.board, 'Women on the board'],
    [
      'genderBalance.investmentCommittee',
      data.genderBalance.investmentCommittee,
      'Women on the investment committee',
    ],
  ]
  for (const [field, v, label] of pct) {
    if (v?.trim() && (Number.isNaN(Number(v)) || Number(v) < 0 || Number(v) > 100))
      add(5, field, `${label} must be a number from 0 to 100`)
  }
  if (!data.genderBalance.management.trim())
    add(5, 'genderBalance.management', 'Women in management is required')
  if (!data.genderBalance.board.trim())
    add(5, 'genderBalance.board', 'Women on the board is required')
  if (data.company.isAssetOwner === 'yes' && !data.genderBalance.investmentCommittee?.trim())
    add(
      5,
      'genderBalance.investmentCommittee',
      'Investment committee figure is required for asset owners',
    )
  if (!data.referral.source.trim())
    add(7, 'referral.source', 'Please tell us how you heard about WEPs')
  return issues
}

/** Immutable set by dot path. */
export function setAt(data: ApplicationData, path: string, value: unknown): ApplicationData {
  const next = structuredClone(data)
  const keys = path.split('.')
  let node = next as unknown as Record<string, unknown>
  for (const k of keys.slice(0, -1)) node = node[k] as Record<string, unknown>
  node[keys[keys.length - 1] as string] = value
  return next
}

export const DOC_LABEL: Record<ApplicationDocument['kind'], string> = {
  ceo_statement: 'Signed CEO statement',
  registration: 'Legal registration document',
  ceo_portrait: 'CEO portrait',
}

export const REFERRAL_SOURCES = [
  'UN Women country office',
  'UN Global Compact network',
  'Peer company',
  'WEPs event or webinar',
  'Industry association',
  'Online search',
  'Other',
]

export const OWNERSHIP_OPTIONS = [
  { value: 'private', label: 'Private' },
  { value: 'public', label: 'Publicly listed' },
  { value: 'state_owned', label: 'State-owned' },
  { value: 'cooperative', label: 'Cooperative' },
]

export const OWNER_GENDER_OPTIONS = [
  { value: 'women_owned', label: 'Majority women-owned' },
  { value: 'men_owned', label: 'Majority men-owned' },
  { value: 'mixed', label: 'Mixed ownership' },
]

export const GENDER_OPTIONS = [
  { value: 'woman', label: 'Woman' },
  { value: 'man', label: 'Man' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not', label: 'Prefer not to say' },
]
