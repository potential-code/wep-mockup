import { ALL_PERMISSIONS, DEFAULT_ADMIN_PERMISSIONS } from '@shared/reference'
import type { DepartmentId, Invitation, User } from '@shared/types'
import { images } from '@/config/images'
import { COMPANY_USER_TOTALS } from './companies'

// Named demo personas (brief §26) plus generated colleagues so every company total reconciles:
// 120 invited users across eight approved companies, 96 activated, 60 completed paths.

const base = {
  permissions: [],
  invitationStatus: 'accepted' as const,
  profileComplete: true,
  timezone: 'Asia/Dubai',
  demoPersona: true,
}

export const personas: User[] = [
  {
    ...base,
    id: 'u-admin',
    firstName: 'Amina',
    lastName: 'Yusuf',
    email: 'amina.yusuf@weps-demo.org',
    title: 'WEPs Programme Manager, UN Women',
    avatar: images.people.adminUnwomen.src,
    role: 'global_admin',
    timezone: 'America/New_York',
    activatedAt: '2025-01-06T09:00:00.000Z',
    lastActiveAt: '2026-10-19T08:40:00.000Z',
  },
  {
    ...base,
    id: 'u-leila',
    firstName: 'Leila',
    lastName: 'Mansour',
    email: 'leila.mansour@asteria-demo.com',
    title: 'Chief Executive Officer',
    avatar: images.people.leilaMansour.src,
    role: 'ceo',
    companyId: 'c-asteria',
    department: 'leadership',
    permissions: ALL_PERMISSIONS,
    activatedAt: '2023-03-20T09:00:00.000Z',
    lastActiveAt: '2026-10-18T17:05:00.000Z',
  },
  {
    ...base,
    id: 'u-nora',
    firstName: 'Nora',
    lastName: 'Aziz',
    email: 'nora.aziz@asteria-demo.com',
    title: 'Head of Sustainability and WEPs Focal Point',
    avatar: images.people.noraAziz.src,
    role: 'company_admin',
    companyId: 'c-asteria',
    department: 'sustainability',
    permissions: [...DEFAULT_ADMIN_PERMISSIONS, 'submit_reports', 'purchase_certifications'],
    activatedAt: '2023-03-22T09:00:00.000Z',
    lastActiveAt: '2026-10-19T08:12:00.000Z',
  },
  {
    ...base,
    id: 'u-maya',
    firstName: 'Maya',
    lastName: 'Chen',
    email: 'maya.chen@asteria-demo.com',
    title: 'Talent Acquisition Lead',
    avatar: images.people.mayaChen.src,
    role: 'employee',
    companyId: 'c-asteria',
    department: 'hr',
    activatedAt: '2026-04-02T09:00:00.000Z',
    lastActiveAt: '2026-10-18T15:30:00.000Z',
  },
  {
    ...base,
    id: 'u-omar',
    firstName: 'Omar',
    lastName: 'Reed',
    email: 'omar.reed@asteria-demo.com',
    title: 'Senior Category Manager, Sourcing',
    avatar: images.people.omarReed.src,
    role: 'employee',
    companyId: 'c-asteria',
    department: 'procurement',
    activatedAt: '2026-02-11T09:00:00.000Z',
    lastActiveAt: '2026-10-17T11:20:00.000Z',
  },
  {
    ...base,
    id: 'u-elena',
    firstName: 'Elena',
    lastName: 'Martin',
    email: 'elena.martin@asteria-demo.com',
    title: 'Brand Communications Manager',
    avatar: images.people.elenaMartin.src,
    role: 'employee',
    companyId: 'c-asteria',
    department: 'marketing',
    activatedAt: '2026-05-19T09:00:00.000Z',
    lastActiveAt: '2026-10-16T10:05:00.000Z',
  },
  // Mentors and trainers (invited by UN Women)
  ...(
    [
      [
        'u-sofia',
        'Sofia',
        'Bennett',
        'Dr',
        'Gender-responsive procurement and inclusive recruitment specialist',
        images.people.sofiaBennett.src,
        ['one_to_one', 'group'],
        'Europe/London',
      ],
      [
        'u-amara',
        'Amara',
        'Okafor',
        '',
        'HR and workplace inclusion advisor',
        images.people.amaraOkafor.src,
        ['one_to_one'],
        'Africa/Lagos',
      ],
      [
        'u-james',
        'James',
        'Liu',
        '',
        'Supplier diversity and procurement advisor',
        images.people.jamesLiu.src,
        ['one_to_one', 'group'],
        'Asia/Singapore',
      ],
      [
        'u-priya',
        'Priya',
        'Raman',
        '',
        'Inclusive communications strategist',
        images.people.priyaRaman.src,
        ['one_to_one'],
        'Asia/Kolkata',
      ],
      [
        'u-carlos',
        'Carlos',
        'Mendes',
        '',
        'Executive leadership coach',
        images.people.carlosMendes.src,
        ['one_to_one'],
        'America/Sao_Paulo',
      ],
      [
        'u-hannah',
        'Hannah',
        'Weiss',
        '',
        'Sustainability reporting and ESG data trainer',
        images.people.hannahWeiss.src,
        ['group'],
        'Europe/Berlin',
      ],
    ] as const
  ).map(
    ([id, firstName, lastName, honorific, title, avatar, formats, timezone]): User => ({
      ...base,
      id,
      firstName: honorific ? `${honorific} ${firstName}` : firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@experts-demo.org`,
      title,
      avatar,
      role: 'mentor',
      mentorFormats: [...formats],
      timezone,
      activatedAt: '2025-06-01T09:00:00.000Z',
      lastActiveAt: '2026-10-18T09:00:00.000Z',
    }),
  ),
  // Applicants (portal locked until approval)
  {
    ...base,
    id: 'u-cedar-applicant',
    firstName: 'Mona',
    lastName: 'Fahmy',
    email: 'mona.fahmy@cedarworks-demo.com',
    title: 'Managing Partner',
    role: 'ceo',
    companyId: 'c-cedar',
    department: 'leadership',
    permissions: ALL_PERMISSIONS,
    timezone: 'Africa/Cairo',
    activatedAt: '2026-09-28T09:00:00.000Z',
    lastActiveAt: '2026-10-15T09:00:00.000Z',
  },
  {
    ...base,
    id: 'u-kestrel-applicant',
    firstName: 'Thandi',
    lastName: 'Nkosi',
    email: 'thandi.nkosi@kestrel-demo.com',
    title: 'Chief Executive Officer',
    role: 'ceo',
    companyId: 'c-kestrel',
    department: 'leadership',
    permissions: ALL_PERMISSIONS,
    timezone: 'Africa/Johannesburg',
    activatedAt: '2026-10-06T09:00:00.000Z',
    lastActiveAt: '2026-10-12T09:00:00.000Z',
  },
]

const CEO_NAMES: Record<string, [string, string, string]> = {
  'c-harbour': ['u-ceo-harbour', 'Daniel', 'Okoye'],
  'c-nova': ['u-ceo-nova', 'Ingrid', 'Halvorsen'],
  'c-lumen': ['u-ceo-lumen', 'Dr Ayesha', 'Karim'],
  'c-meridian': ['u-ceo-meridian', 'Rafael', 'Costa'],
  'c-solace': ['u-ceo-solace', 'Fatima', 'Benali'],
  'c-terra': ['u-ceo-terra', 'Ananya', 'Iyer'],
  'c-orbit': ['u-ceo-orbit', 'Marcus', 'Feld'],
}

const FIRST = [
  'Aisha',
  'Noah',
  'Sara',
  'Yusuf',
  'Lina',
  'Mateo',
  'Grace',
  'Hiro',
  'Zainab',
  'Lucas',
  'Mei',
  'Tariq',
  'Chloe',
  'Kwame',
  'Ines',
  'Ravi',
  'Hana',
  'Diego',
  'Amira',
  'Jonas',
  'Leah',
  'Samir',
  'Nadia',
  'Felix',
  'Rania',
  'Kofi',
  'Elif',
  'Arjun',
  'Sofia',
  'Tom',
  'Laila',
  'Bruno',
]
const LAST = [
  'Haddad',
  'Silva',
  'Kim',
  'Rahman',
  'Moreau',
  'Osei',
  'Novak',
  'Tanaka',
  'Farah',
  'Ibrahim',
  'Costa',
  'Patel',
  'Yilmaz',
  'Mensah',
  'Garcia',
  'Nasser',
  'Schmidt',
  'Ali',
  'Wong',
  'Adeyemi',
  'Lopez',
  'Khan',
  'Sato',
  'Dubois',
  'Mwangi',
  'Aziz',
  'Rossi',
  'Demir',
  'Reyes',
  'Sharma',
]
const DEPTS: DepartmentId[] = [
  'hr',
  'procurement',
  'marketing',
  'sustainability',
  'operations',
  'leadership',
]
const TITLES: Record<DepartmentId, string> = {
  hr: 'People Partner',
  procurement: 'Procurement Specialist',
  marketing: 'Marketing Executive',
  sustainability: 'Sustainability Analyst',
  operations: 'Operations Supervisor',
  leadership: 'Regional Director',
}

const pad = (n: number) => String(n).padStart(2, '0')
const domain = (companyId: string) => `${companyId.replace('c-', '')}-demo.com`

/** Generated colleague; index drives a deterministic name and department. */
function colleague(id: string, companyId: string, i: number, activated: boolean): User {
  const firstName = FIRST[(i * 7 + companyId.length) % FIRST.length] as string
  const lastName = LAST[(i * 5 + companyId.length * 3) % LAST.length] as string
  const department = DEPTS[i % DEPTS.length] as DepartmentId
  const day = 1 + ((i * 3) % 27)
  return {
    id,
    firstName,
    lastName,
    email: `${`${firstName}.${lastName}`.toLowerCase()}@${domain(companyId)}`,
    title: TITLES[department],
    role: 'employee',
    companyId,
    department,
    permissions: [],
    invitationStatus: activated ? 'accepted' : 'pending',
    invitedAt: `2026-0${1 + (i % 8)}-${pad(day)}T09:00:00.000Z`,
    invitedById: companyId === 'c-asteria' ? 'u-nora' : CEO_NAMES[companyId]?.[0],
    activatedAt: activated ? `2026-0${2 + (i % 8)}-${pad(day)}T10:00:00.000Z` : undefined,
    lastActiveAt: activated
      ? `2026-${i % 3 === 0 ? '09' : '10'}-${pad(1 + (i % 18))}T12:00:00.000Z`
      : undefined,
    profileComplete: activated,
    timezone: 'Asia/Dubai',
  }
}

/** Asteria colleagues: u-ast-01..19. 01–13 activated, 14–19 pending invitations. */
const asteriaColleagues: User[] = Array.from({ length: 19 }, (_, k) =>
  colleague(`u-ast-${pad(k + 1)}`, 'c-asteria', k + 1, k + 1 <= 13),
)

/** Other approved companies: CEO + colleagues to reach the invited/activated totals. */
const otherCompanyUsers: User[] = Object.entries(CEO_NAMES).flatMap(
  ([companyId, [ceoId, first, last]]) => {
    const totals = COMPANY_USER_TOTALS[companyId] ?? { invited: 1, activated: 1, completed: 0 }
    const ceo: User = {
      ...base,
      demoPersona: false,
      id: ceoId,
      firstName: first,
      lastName: last,
      email: `${first.replace('Dr ', '').toLowerCase()}.${last.toLowerCase()}@${domain(companyId)}`,
      title: 'Chief Executive Officer',
      role: 'ceo',
      companyId,
      department: 'leadership',
      permissions: ALL_PERMISSIONS,
      activatedAt: '2025-03-01T09:00:00.000Z',
      lastActiveAt: '2026-10-10T09:00:00.000Z',
    }
    const rest = Array.from({ length: totals.invited - 1 }, (_, k) =>
      colleague(
        `u-${companyId.replace('c-', '')}-${pad(k + 1)}`,
        companyId,
        k + 11,
        k + 1 <= totals.activated - 1,
      ),
    )
    return [ceo, ...rest]
  },
)

export const users: User[] = [...personas, ...asteriaColleagues, ...otherCompanyUsers]

/**
 * Users who completed their assigned path (designated course + quiz), per company.
 * Asteria: Omar + u-ast-01..11 = 12. Others: the first N activated colleagues.
 */
export const PATH_COMPLETER_IDS: string[] = [
  'u-omar',
  ...Array.from({ length: 11 }, (_, k) => `u-ast-${pad(k + 1)}`),
  ...Object.keys(CEO_NAMES).flatMap((companyId) => {
    const n = COMPANY_USER_TOTALS[companyId]?.completed ?? 0
    return Array.from({ length: n }, (_, k) => `u-${companyId.replace('c-', '')}-${pad(k + 1)}`)
  }),
]

export const invitations: Invitation[] = [
  ...asteriaColleagues
    .filter((u) => u.invitationStatus === 'pending')
    .map(
      (u, k): Invitation => ({
        id: `inv-${u.id}`,
        token: `ast-${pad(k + 14)}-${u.lastName.toLowerCase()}`,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: 'employee',
        companyId: 'c-asteria',
        department: u.department,
        permissions: [],
        invitedById: 'u-nora',
        createdAt: '2026-10-06T09:00:00.000Z',
        expiresAt: k === 5 ? '2026-10-13T09:00:00.000Z' : '2026-11-05T09:00:00.000Z',
        status: k === 5 ? 'expired' : 'pending',
        userId: u.id,
      }),
    ),
  {
    id: 'inv-mentor-new',
    token: 'expert-welcome-rania',
    email: 'rania.saleh@experts-demo.org',
    firstName: 'Rania',
    lastName: 'Saleh',
    role: 'mentor',
    permissions: [],
    invitedById: 'u-admin',
    createdAt: '2026-10-15T09:00:00.000Z',
    expiresAt: '2026-11-15T09:00:00.000Z',
    status: 'pending',
  },
]
