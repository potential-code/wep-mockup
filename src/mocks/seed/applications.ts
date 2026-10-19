import type { Application, ApplicationData } from '@shared/types'

// Join applications. Cedar Works is waiting on a registration document (brief §26); Kestrel
// Energy is under review; Blue Dune Trading was not approved; the rest are historical approvals.

export const emptyApplicationData = (): ApplicationData => ({
  company: {
    name: '',
    ownership: '',
    ownerGender: '',
    sector: '',
    region: '',
    country: '',
    website: '',
    employeeCount: '',
    ungcMember: '',
    isAssetOwner: '',
  },
  presence: { otherCountries: [], legallyRegistered: '' },
  executive: { firstName: '', lastName: '', gender: 'prefer_not', email: '', title: '', quote: '' },
  contacts: {
    primary: { firstName: '', lastName: '', gender: 'prefer_not', email: '', title: '', phone: '' },
    secondary: {
      firstName: '',
      lastName: '',
      gender: 'prefer_not',
      email: '',
      title: '',
      phone: '',
    },
  },
  genderBalance: { employees: '', management: '', board: '' },
  plans: { hasGenderActionPlan: '' },
  referral: { source: '', contributionInterest: '' },
})

/** Prefilled sample used by the "Fill with sample company" demo action on the Join wizard. */
export const sampleApplicationData = (): ApplicationData => ({
  company: {
    name: 'Saffron Hospitality',
    ownership: 'private',
    ownerGender: 'mixed',
    sector: 'Retail and consumer goods',
    region: 'Arab States',
    country: 'Jordan',
    website: 'https://example.org/saffron-hospitality',
    employeeCount: '420',
    ungcMember: 'no',
    isAssetOwner: 'no',
  },
  presence: { otherCountries: ['Saudi Arabia', 'United Arab Emirates'], legallyRegistered: 'yes' },
  executive: {
    firstName: 'Rana',
    lastName: 'Khoury',
    gender: 'woman',
    email: 'rana.khoury@saffron-demo.com',
    title: 'Chief Executive Officer',
    quote: 'We want every guest and every colleague to see that opportunity at Saffron is equal.',
  },
  contacts: {
    primary: {
      firstName: 'Ziad',
      lastName: 'Hamdan',
      gender: 'man',
      email: 'ziad.hamdan@saffron-demo.com',
      title: 'HR Director',
      phone: '+962 6 555 0142',
    },
    secondary: {
      firstName: 'Dana',
      lastName: 'Sabbagh',
      gender: 'woman',
      email: 'dana.sabbagh@saffron-demo.com',
      title: 'Sustainability Manager',
      phone: '+962 6 555 0178',
    },
  },
  genderBalance: { employees: '38', management: '27', board: '29' },
  plans: { hasGenderActionPlan: 'in_progress' },
  referral: {
    source: 'UN Women country office',
    details: 'Introduced at the Amman WEPs business forum',
    contributionInterest: 'maybe',
  },
})

const cedarData: ApplicationData = {
  company: {
    name: 'Cedar Works',
    ownership: 'private',
    ownerGender: 'women_owned',
    sector: 'Professional services',
    region: 'Arab States',
    country: 'Egypt',
    website: 'https://example.org/cedar-works',
    employeeCount: '180',
    ungcMember: 'no',
    isAssetOwner: 'no',
  },
  presence: { otherCountries: ['Saudi Arabia'], legallyRegistered: 'yes' },
  executive: {
    firstName: 'Mona',
    lastName: 'Fahmy',
    gender: 'woman',
    email: 'mona.fahmy@cedarworks-demo.com',
    title: 'Managing Partner',
    quote:
      'Engineering is better when the teams who design our cities reflect the people who live in them.',
  },
  contacts: {
    primary: {
      firstName: 'Karim',
      lastName: 'Saad',
      gender: 'man',
      email: 'karim.saad@cedarworks-demo.com',
      title: 'Operations Director',
      phone: '+20 2 555 0190',
    },
    secondary: {
      firstName: 'Yasmin',
      lastName: 'Adel',
      gender: 'woman',
      email: 'yasmin.adel@cedarworks-demo.com',
      title: 'HR Manager',
      phone: '+20 2 555 0133',
    },
  },
  genderBalance: { employees: '48', management: '40', board: '50' },
  plans: { hasGenderActionPlan: 'no' },
  referral: {
    source: 'Peer company',
    details: 'Recommended by Asteria Group',
    contributionInterest: 'no',
  },
}

const kestrelData: ApplicationData = {
  company: {
    name: 'Kestrel Energy',
    ownership: 'private',
    ownerGender: 'mixed',
    sector: 'Energy and utilities',
    region: 'Africa',
    country: 'South Africa',
    website: 'https://example.org/kestrel-energy',
    employeeCount: '2900',
    ungcMember: 'yes',
    isAssetOwner: 'no',
  },
  presence: { otherCountries: ['Kenya', 'Morocco'], legallyRegistered: 'yes' },
  executive: {
    firstName: 'Thandi',
    lastName: 'Nkosi',
    gender: 'woman',
    email: 'thandi.nkosi@kestrel-demo.com',
    title: 'Chief Executive Officer',
    quote:
      'A just energy transition must include women at every level, from field engineers to the board.',
  },
  contacts: {
    primary: {
      firstName: 'Pieter',
      lastName: 'van Wyk',
      gender: 'man',
      email: 'pieter.vanwyk@kestrel-demo.com',
      title: 'Head of People',
      phone: '+27 11 555 0101',
    },
    secondary: {
      firstName: 'Lerato',
      lastName: 'Mokoena',
      gender: 'woman',
      email: 'lerato.mokoena@kestrel-demo.com',
      title: 'ESG Lead',
      phone: '+27 11 555 0122',
    },
  },
  genderBalance: { employees: '29', management: '22', board: '30' },
  plans: { hasGenderActionPlan: 'yes' },
  referral: { source: 'UN Global Compact network', contributionInterest: 'yes' },
}

const docs = (prefix: string, at: string) => [
  {
    id: `${prefix}-doc-1`,
    kind: 'ceo_statement' as const,
    fileName: 'WEPs_CEO_Statement_signed.pdf',
    sizeKb: 412,
    uploadedAt: at,
    version: 1,
  },
  {
    id: `${prefix}-doc-2`,
    kind: 'registration' as const,
    fileName: 'Commercial_Registration.pdf',
    sizeKb: 860,
    uploadedAt: at,
    version: 1,
  },
  {
    id: `${prefix}-doc-3`,
    kind: 'ceo_portrait' as const,
    fileName: 'CEO_portrait.jpg',
    sizeKb: 2300,
    uploadedAt: at,
    version: 1,
  },
]

export const applications: Application[] = [
  {
    id: 'app-cedar',
    reference: 'WEPS-2026-0418',
    status: 'information_requested',
    companyId: 'c-cedar',
    applicantEmail: 'mona.fahmy@cedarworks-demo.com',
    data: cedarData,
    documents: [
      {
        id: 'app-cedar-doc-1',
        kind: 'ceo_statement',
        fileName: 'CedarWorks_CEO_Statement_signed.pdf',
        sizeKb: 388,
        uploadedAt: '2026-09-28T10:00:00.000Z',
        version: 1,
      },
      {
        id: 'app-cedar-doc-2',
        kind: 'registration',
        fileName: 'CedarWorks_registration_2019.pdf',
        sizeKb: 640,
        uploadedAt: '2026-09-28T10:00:00.000Z',
        version: 1,
      },
      {
        id: 'app-cedar-doc-3',
        kind: 'ceo_portrait',
        fileName: 'Mona_Fahmy.jpg',
        sizeKb: 1900,
        uploadedAt: '2026-09-28T10:00:00.000Z',
        version: 1,
      },
    ],
    currentStep: 8,
    createdAt: '2026-09-24T10:00:00.000Z',
    submittedAt: '2026-09-28T10:00:00.000Z',
    infoRequests: [
      {
        item: 'Current legal registration document',
        message:
          'Thank you for your application. The registration certificate you uploaded expired in 2024. Please upload the current commercial registration for Cedar Works so we can complete the review.',
        dueDate: '2026-10-31T23:59:00.000Z',
        requestedAt: '2026-10-07T14:00:00.000Z',
        requestedById: 'u-admin',
      },
    ],
    timeline: [
      { id: 't1', at: '2026-09-24T10:00:00.000Z', actor: 'Mona Fahmy', label: 'Draft started' },
      {
        id: 't2',
        at: '2026-09-28T10:00:00.000Z',
        actor: 'Mona Fahmy',
        label: 'Application submitted',
      },
      { id: 't3', at: '2026-10-02T09:00:00.000Z', actor: 'Amina Yusuf', label: 'Review started' },
      {
        id: 't4',
        at: '2026-10-07T14:00:00.000Z',
        actor: 'Amina Yusuf',
        label: 'Additional information requested',
        note: 'Current legal registration document',
      },
    ],
    reviewNotes: [
      {
        at: '2026-10-07T14:00:00.000Z',
        by: 'Amina Yusuf',
        note: 'All other fields complete. Registration certificate expired.',
      },
    ],
  },
  {
    id: 'app-kestrel',
    reference: 'WEPS-2026-0431',
    status: 'under_review',
    companyId: 'c-kestrel',
    applicantEmail: 'thandi.nkosi@kestrel-demo.com',
    data: kestrelData,
    documents: docs('app-kestrel', '2026-10-09T10:00:00.000Z'),
    currentStep: 8,
    createdAt: '2026-10-06T10:00:00.000Z',
    submittedAt: '2026-10-09T10:00:00.000Z',
    infoRequests: [],
    timeline: [
      { id: 't1', at: '2026-10-06T10:00:00.000Z', actor: 'Thandi Nkosi', label: 'Draft started' },
      {
        id: 't2',
        at: '2026-10-09T10:00:00.000Z',
        actor: 'Thandi Nkosi',
        label: 'Application submitted',
      },
      { id: 't3', at: '2026-10-13T09:00:00.000Z', actor: 'Amina Yusuf', label: 'Review started' },
    ],
    reviewNotes: [],
  },
  {
    id: 'app-bluedune',
    reference: 'WEPS-2026-0377',
    status: 'not_approved',
    applicantEmail: 'info@bluedune-demo.com',
    data: {
      ...cedarData,
      company: {
        ...cedarData.company,
        name: 'Blue Dune Trading',
        sector: 'Retail and consumer goods',
        country: 'United Arab Emirates',
        employeeCount: '35',
        ownerGender: 'men_owned',
      },
      executive: {
        ...cedarData.executive,
        firstName: 'Faris',
        lastName: 'Al Amiri',
        gender: 'man',
        email: 'faris@bluedune-demo.com',
        title: 'Owner',
      },
    },
    documents: [
      {
        id: 'app-bd-doc-1',
        kind: 'registration',
        fileName: 'BDT_registration.pdf',
        sizeKb: 300,
        uploadedAt: '2026-08-02T10:00:00.000Z',
        version: 1,
      },
    ],
    currentStep: 8,
    createdAt: '2026-08-01T10:00:00.000Z',
    submittedAt: '2026-08-02T10:00:00.000Z',
    decidedAt: '2026-08-20T10:00:00.000Z',
    decisionReason:
      'The CEO Statement of Support was not provided in the official, unmodified template after two requests. The company is welcome to reapply.',
    infoRequests: [],
    timeline: [
      {
        id: 't1',
        at: '2026-08-02T10:00:00.000Z',
        actor: 'Faris Al Amiri',
        label: 'Application submitted',
      },
      {
        id: 't2',
        at: '2026-08-20T10:00:00.000Z',
        actor: 'Amina Yusuf',
        label: 'Not approved',
        note: 'Missing signed CEO statement',
      },
    ],
    reviewNotes: [],
  },
  ...(
    [
      ['app-asteria', 'WEPS-2023-0112', 'c-asteria', 'Asteria Group', '2023-03-01', '2023-03-14'],
      ['app-nova', 'WEPS-2024-0021', 'c-nova', 'Nova Supply', '2024-01-08', '2024-01-22'],
      ['app-orbit', 'WEPS-2024-0154', 'c-orbit', 'Orbit Logistics', '2024-04-22', '2024-05-06'],
    ] as const
  ).map(
    ([id, reference, companyId, name, submitted, decided]): Application => ({
      id,
      reference,
      status: 'approved',
      companyId,
      applicantEmail: `ceo@${companyId.replace('c-', '')}-demo.com`,
      data: { ...kestrelData, company: { ...kestrelData.company, name } },
      documents: docs(id, `${submitted}T10:00:00.000Z`),
      currentStep: 8,
      createdAt: `${submitted}T09:00:00.000Z`,
      submittedAt: `${submitted}T10:00:00.000Z`,
      decidedAt: `${decided}T10:00:00.000Z`,
      infoRequests: [],
      timeline: [
        { id: 't1', at: `${submitted}T10:00:00.000Z`, actor: name, label: 'Application submitted' },
        {
          id: 't2',
          at: `${decided}T10:00:00.000Z`,
          actor: 'UN Women',
          label: 'Approved and workspace activated',
        },
      ],
      reviewNotes: [],
    }),
  ),
]
