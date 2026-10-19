// Annual progress reports. Companies and figures are fictional demo data.

import type {
  AnnualReport,
  Evidence,
  ID,
  PrincipleId,
  ReportIndicator,
  ReportSectionKey,
  ReportStatus,
} from '@shared/types'

type Sections = Record<ReportSectionKey, string>

const SECTION_KEYS: ReportSectionKey[] = [
  'snapshot',
  'narrative',
  'actions',
  'support',
  'principles',
  'indicators',
  'challenges',
  'declaration',
]

const allComplete = (): Record<ReportSectionKey, boolean> =>
  Object.fromEntries(SECTION_KEYS.map((k) => [k, true])) as Record<ReportSectionKey, boolean>

const dueFor = (year: number): string => `${year}-11-30T23:59:00.000Z`

/** Indicator helper: ind('asteria', 2026, 1, ...) -> id 'ind-asteria-2026-1'. */
const ind = (
  company: string,
  year: number,
  n: number,
  label: string,
  principle: PrincipleId,
  value: number | null,
  unit: string,
  coverage: string,
  previousValue?: number | null,
  evidence?: string,
): ReportIndicator => ({
  id: `ind-${company}-${year}-${n}`,
  label,
  principle,
  value,
  unit,
  coverage,
  period: `FY${year - 1}`,
  previousValue,
  evidence,
})

interface SubmittedInput {
  slug: string
  companyId: ID
  year: number
  status: ReportStatus
  approverId: ID
  preparerId?: ID
  submittedAt: string
  reviewedAt?: string
  updatedAt?: string
  sections: Sections
  indicators: ReportIndicator[]
  evidence?: Evidence[]
  changeRequests?: AnnualReport['changeRequests']
  publicSummaryApproved?: boolean
}

/** A report that has been submitted once (accepted, under review or returned). */
const submitted = (r: SubmittedInput): AnnualReport => ({
  id: `rep-${r.slug}-${r.year}`,
  companyId: r.companyId,
  year: r.year,
  status: r.status,
  dueDate: dueFor(r.year),
  preparerId: r.preparerId,
  approverId: r.approverId,
  sections: r.sections,
  sectionComplete: allComplete(),
  indicators: r.indicators,
  evidence: r.evidence ?? [],
  versions: [
    {
      version: 1,
      submittedAt: r.submittedAt,
      submittedById: r.approverId,
      sections: r.sections,
      indicators: r.indicators,
    },
  ],
  changeRequests: r.changeRequests ?? [],
  reviewedAt: r.reviewedAt,
  publicSummaryApproved: r.publicSummaryApproved ?? r.status === 'accepted',
  updatedAt: r.updatedAt ?? r.reviewedAt ?? r.submittedAt,
})

const declaration = (ceo: string, company: string, year: number): string =>
  `I confirm, as Chief Executive Officer of ${company}, that this ${year} progress report has been reviewed by the leadership team and fairly represents our progress against the Women’s Empowerment Principles. Figures are drawn from company systems and supporting evidence is held on file. Signed: ${ceo}.`

/* ------------------------------------------------------------------ Asteria Group -- */

const asteria2024: AnnualReport = submitted({
  slug: 'asteria',
  companyId: 'c-asteria',
  year: 2024,
  status: 'accepted',
  preparerId: 'u-nora',
  approverId: 'u-leila',
  submittedAt: '2024-11-21T10:30:00.000Z',
  reviewedAt: '2024-12-16T09:00:00.000Z',
  sections: {
    snapshot:
      'Asteria Group is a UAE-headquartered retailer of home, beauty and consumer goods with 1,720 employees across 64 stores and two distribution centres. This is our first progress report as a WEPs signatory.',
    narrative:
      'Our first year focused on building the foundations: a board-approved equal opportunity policy, a first sex-disaggregated workforce baseline and an internal WEPs working group chaired by the CEO. We are candid that most of our work is still at the planning stage.',
    actions:
      'We published a group equal opportunity policy, consolidated workforce data from the head office HR system and launched a women in retail leadership mentoring circle with 22 participants.',
    support:
      'We joined two WEPs regional webinars and used the WEPs Gender Action Plan Template to structure our draft plan.',
    principles:
      'Our priority principles for the first year were Principle 1 (leadership) and Principle 2 (fair treatment). Principle 7 work started with a workforce data baseline.',
    indicators:
      'Indicators cover UAE head office and stores. Data for franchise operations in Saudi Arabia and Oman was not available for FY2023. A gender pay gap figure was not calculated for this period.',
    challenges:
      'Workforce data is held in three separate HR systems following an acquisition, which limits consistency. Regional manager roles involve frequent travel and attract few women applicants.',
    declaration: declaration('Leila Mansour', 'Asteria Group', 2024),
  },
  indicators: [
    ind('asteria', 2024, 1, 'Women in workforce', 2, 41.0, '%', 'UAE head office and stores'),
    ind(
      'asteria',
      2024,
      2,
      'Women in senior management',
      1,
      22.0,
      '%',
      'UAE head office and stores',
    ),
    ind('asteria', 2024, 3, 'Women on board', 1, 20.0, '%', 'Group board'),
    ind(
      'asteria',
      2024,
      4,
      'Employees completing gender-equality training',
      4,
      35.0,
      '%',
      'UAE head office and stores',
    ),
    ind('asteria', 2024, 5, 'Parental leave return rate', 3, 82.0, '%', 'UAE head office'),
    ind(
      'asteria',
      2024,
      6,
      'Spend with women-owned suppliers',
      5,
      3.1,
      '%',
      'UAE direct procurement (estimate)',
    ),
  ],
  evidence: [
    {
      id: 'ev-asteria-2024-1',
      fileName: 'Asteria-Workforce-Baseline-FY2023.xlsx',
      uploadedById: 'u-nora',
      uploadedAt: '2024-11-18T08:40:00.000Z',
      note: 'Head office HR system extract, 31 December 2023.',
    },
  ],
})

const asteria2025: AnnualReport = submitted({
  slug: 'asteria',
  companyId: 'c-asteria',
  year: 2025,
  status: 'accepted',
  preparerId: 'u-nora',
  approverId: 'u-leila',
  submittedAt: '2025-11-19T13:05:00.000Z',
  reviewedAt: '2025-12-10T11:15:00.000Z',
  sections: {
    snapshot:
      'Asteria Group employs 1,790 people across 68 stores, two distribution centres and a Dubai head office. Women make up 42.5% of the workforce and 24% of senior management.',
    narrative:
      'In our second year we moved from policy to practice. We approved a three-year gender action plan, introduced a respect-at-work policy with a confidential Speak Up channel, and ran our first gender pay analysis for comparable roles in the UAE.',
    actions:
      'Key actions included the Speak Up channel launch, manager training on harassment prevention for 310 people managers, and a pilot of flexible scheduling for store managers in six locations.',
    support:
      'Our focal point attended the WEPs reporting clinic, and our HR team used the inclusive recruitment learning materials in the portal.',
    principles:
      'Progress was strongest on Principle 3 (health, wellbeing and safety) and Principle 2. Principle 5 remains at an early stage because supplier ownership is not yet recorded.',
    indicators:
      'Coverage now includes all UAE operations. The pay gap figure is a median of base pay for comparable roles. The supplier spend figure is an estimate based on a manual review of the top 200 suppliers.',
    challenges:
      'The median pay gap of 14.2% is largely explained by under-representation of women in regional and category management roles. Supplier ownership data remains the biggest reporting gap.',
    declaration: declaration('Leila Mansour', 'Asteria Group', 2025),
  },
  indicators: [
    ind('asteria', 2025, 1, 'Women in workforce', 2, 42.5, '%', 'All UAE operations', 41.0),
    ind('asteria', 2025, 2, 'Women in senior management', 1, 24.0, '%', 'All UAE operations', 22.0),
    ind('asteria', 2025, 3, 'Women on board', 1, 20.0, '%', 'Group board', 20.0),
    ind(
      'asteria',
      2025,
      4,
      'Gender pay gap (median)',
      2,
      14.2,
      '%',
      'All UAE operations, comparable roles',
      null,
    ),
    ind(
      'asteria',
      2025,
      5,
      'Spend with women-owned suppliers',
      5,
      4.0,
      '%',
      'Top 200 suppliers (estimate)',
      3.1,
    ),
    ind(
      'asteria',
      2025,
      6,
      'Employees completing gender-equality training',
      4,
      48.0,
      '%',
      'All UAE operations',
      35.0,
    ),
    ind('asteria', 2025, 7, 'Parental leave return rate', 3, 86.0, '%', 'All UAE operations', 82.0),
  ],
  evidence: [
    {
      id: 'ev-asteria-2025-1',
      fileName: 'Asteria-Pay-Analysis-FY2024.pdf',
      uploadedById: 'u-nora',
      uploadedAt: '2025-11-14T09:10:00.000Z',
      note: 'Summary of the comparable-roles pay review prepared by HR.',
    },
    {
      id: 'ev-asteria-2025-2',
      fileName: 'Asteria-Speak-Up-Annual-Summary-2024.pdf',
      uploadedById: 'u-nora',
      uploadedAt: '2025-11-14T09:12:00.000Z',
    },
  ],
})

const asteria2026: AnnualReport = {
  id: 'rep-asteria-2026',
  companyId: 'c-asteria',
  year: 2026,
  status: 'draft',
  dueDate: dueFor(2026),
  preparerId: 'u-nora',
  approverId: 'u-leila',
  sections: {
    snapshot:
      'Asteria Group employs 1,850 people across 71 stores, two distribution centres and a Dubai head office. Women make up 43.8% of the workforce and 26.5% of senior management, and the board appointed a second woman director in March 2026.',
    narrative:
      'This year we focused on recruitment fairness, supplier inclusion and data quality. Our 2026 baseline assessment identified six priority needs, which now drive an eight-action plan owned by department leads.',
    actions:
      'Structured interviews were introduced for all manager-level hiring in head office. HR, Procurement and Marketing leads are completing their designated learning paths, and 18 of 24 invited colleagues have activated their portal accounts.',
    support:
      'Our teams are using the WEPs Transparency and Accountability Roadmap and the Gender-responsive Procurement Toolbox. HR and Procurement leads are preparing for the inclusive recruitment and procurement clinics.',
    principles: '',
    indicators: '',
    challenges: '',
    declaration: '',
  },
  sectionComplete: {
    snapshot: true,
    narrative: true,
    actions: true,
    support: true,
    principles: false,
    indicators: false,
    challenges: false,
    declaration: false,
  },
  indicators: [
    ind(
      'asteria',
      2026,
      1,
      'Women in workforce',
      2,
      43.8,
      '%',
      'All UAE operations',
      42.5,
      'Asteria-Workforce-Extract-FY2025.xlsx',
    ),
    ind(
      'asteria',
      2026,
      2,
      'Women in senior management',
      1,
      26.5,
      '%',
      'All UAE operations',
      24.0,
      'Asteria-Workforce-Extract-FY2025.xlsx',
    ),
    ind('asteria', 2026, 3, 'Women on board', 1, 30.0, '%', 'Group board', 20.0),
    ind(
      'asteria',
      2026,
      4,
      'Gender pay gap (median)',
      2,
      null,
      '%',
      'All UAE operations, comparable roles',
      14.2,
    ),
    ind(
      'asteria',
      2026,
      5,
      'Spend with women-owned suppliers',
      5,
      null,
      '%',
      'UAE direct and indirect procurement',
      4.0,
    ),
    ind(
      'asteria',
      2026,
      6,
      'Employees completing gender-equality training',
      4,
      61.0,
      '%',
      'All UAE operations',
      48.0,
    ),
    ind('asteria', 2026, 7, 'Parental leave return rate', 3, 88.0, '%', 'All UAE operations', 86.0),
  ],
  evidence: [
    {
      id: 'ev-asteria-2026-1',
      fileName: 'Asteria-Workforce-Extract-FY2025.xlsx',
      uploadedById: 'u-nora',
      uploadedAt: '2026-10-06T07:45:00.000Z',
      note: 'Group HR system extract as at 31 December 2025, headcount by level and sex.',
    },
    {
      id: 'ev-asteria-2026-2',
      fileName: 'Board-Appointment-Announcement-March-2026.pdf',
      uploadedById: 'u-nora',
      uploadedAt: '2026-10-06T07:52:00.000Z',
    },
  ],
  versions: [],
  changeRequests: [],
  publicSummaryApproved: false,
  updatedAt: '2026-10-16T15:30:00.000Z',
}

/* ------------------------------------------------------------------ Harbour Services -- */

const harbour2025 = submitted({
  slug: 'harbour',
  companyId: 'c-harbour',
  year: 2025,
  status: 'accepted',
  approverId: 'u-ceo-harbour',
  submittedAt: '2025-11-26T08:00:00.000Z',
  reviewedAt: '2025-12-18T10:00:00.000Z',
  sections: {
    snapshot:
      'Harbour Services provides port handling, warehousing and freight forwarding from Mombasa and Nairobi, with 640 employees. Women make up 23% of the workforce, concentrated in administration and customer service.',
    narrative:
      'Our priority has been opening operational roles to women. We launched a women in port operations traineeship with a local technical college and reviewed shift patterns to improve safety for night workers.',
    actions:
      'Twelve women joined the first equipment operator traineeship. We installed lighting and secure changing facilities at two yards and introduced a shuttle for night shifts.',
    support:
      'We used WEPs webinar materials on workplace safety and connected with other logistics signatories through the community.',
    principles:
      'Principle 3 (health and safety) and Principle 4 (training and advancement) were our focus areas this year.',
    indicators:
      'Indicators cover Kenyan operations only. Board composition reflects the holding company board.',
    challenges:
      'Recruiting women into operator roles depends on overcoming community perceptions of port work. Retention after the traineeship will be our key test.',
    declaration: declaration('Daniel Okoye', 'Harbour Services', 2025),
  },
  indicators: [
    ind('harbour', 2025, 1, 'Women in workforce', 2, 23.0, '%', 'Kenyan operations', 21.0),
    ind('harbour', 2025, 2, 'Women in senior management', 1, 18.0, '%', 'Kenyan operations', 17.0),
    ind('harbour', 2025, 3, 'Women on board', 1, 22.0, '%', 'Holding company board', 22.0),
    ind(
      'harbour',
      2025,
      4,
      'Women in operational roles',
      4,
      6.5,
      '%',
      'Port and warehouse operations',
      4.0,
    ),
    ind(
      'harbour',
      2025,
      5,
      'Employees completing gender-equality training',
      4,
      40.0,
      '%',
      'Kenyan operations',
      null,
    ),
    ind('harbour', 2025, 6, 'Parental leave return rate', 3, 79.0, '%', 'Kenyan operations', 75.0),
  ],
})

const harbour2026 = submitted({
  slug: 'harbour',
  companyId: 'c-harbour',
  year: 2026,
  status: 'changes_requested',
  approverId: 'u-ceo-harbour',
  submittedAt: '2026-09-29T07:30:00.000Z',
  reviewedAt: '2026-10-09T12:00:00.000Z',
  updatedAt: '2026-10-09T12:00:00.000Z',
  publicSummaryApproved: false,
  sections: {
    snapshot:
      'Harbour Services employs 690 people across Mombasa, Nairobi and a new inland depot in Naivasha. Women now make up 25% of the workforce and 9% of operational roles.',
    narrative:
      'Our second traineeship cohort doubled to 24 women, and 10 of the first 12 trainees are now employed as certified equipment operators. We also adopted a supplier code of conduct with gender equality expectations.',
    actions:
      'We completed the second traineeship cohort, rolled out harassment prevention training to all supervisors and began recording supplier ownership for new vendors. Evidence for the supervisor training completion is still being compiled.',
    support:
      'Our HR lead attended the WEPs inclusive recruitment clinic, and our procurement team joined the supplier diversity clinic.',
    principles:
      'Principles 3, 4 and 5 were our priorities. Principle 5 work is new this year and focuses on our transport subcontractors.',
    indicators:
      'Indicators cover all Kenyan operations including the Naivasha depot from July 2025. Supplier spend covers new vendors onboarded since January 2025.',
    challenges:
      'Data for the Naivasha depot was collected manually for the first half-year. Training records were held by an external provider and are being reconciled.',
    declaration: declaration('Daniel Okoye', 'Harbour Services', 2026),
  },
  indicators: [
    ind('harbour', 2026, 1, 'Women in workforce', 2, 25.0, '%', 'All Kenyan operations', 23.0),
    ind(
      'harbour',
      2026,
      2,
      'Women in senior management',
      1,
      20.0,
      '%',
      'All Kenyan operations',
      18.0,
    ),
    ind('harbour', 2026, 3, 'Women on board', 1, 22.0, '%', 'Holding company board', 22.0),
    ind(
      'harbour',
      2026,
      4,
      'Women in operational roles',
      4,
      9.0,
      '%',
      'Port and warehouse operations',
      6.5,
    ),
    ind(
      'harbour',
      2026,
      5,
      'Employees completing gender-equality training',
      4,
      72.0,
      '%',
      'All Kenyan operations',
      40.0,
    ),
    ind(
      'harbour',
      2026,
      6,
      'Spend with women-owned suppliers',
      5,
      5.5,
      '%',
      'Vendors onboarded since January 2025',
      null,
    ),
    ind(
      'harbour',
      2026,
      7,
      'Parental leave return rate',
      3,
      81.0,
      '%',
      'All Kenyan operations',
      79.0,
    ),
  ],
  evidence: [
    {
      id: 'ev-harbour-2026-1',
      fileName: 'Harbour-Traineeship-Cohort-2-Report.pdf',
      uploadedById: 'u-ceo-harbour',
      uploadedAt: '2026-09-27T10:00:00.000Z',
    },
  ],
  changeRequests: [
    {
      at: '2026-10-09T12:00:00.000Z',
      section: 'indicators',
      note: 'The training completion figure rose from 40% to 72%. Please upload the supporting training records or provider extract; the evidence requested on 1 October is now overdue.',
      resolved: false,
    },
    {
      at: '2026-10-09T12:00:00.000Z',
      section: 'actions',
      note: 'Please attach evidence for the supervisor harassment prevention training and the supplier code of conduct, for example the approved code and an attendance summary.',
      resolved: false,
    },
  ],
})

/* ------------------------------------------------------------------ Nova Supply -- */

const nova2025 = submitted({
  slug: 'nova',
  companyId: 'c-nova',
  year: 2025,
  status: 'accepted',
  approverId: 'u-ceo-nova',
  submittedAt: '2025-11-28T14:00:00.000Z',
  reviewedAt: '2025-12-19T09:30:00.000Z',
  sections: {
    snapshot:
      'Nova Supply manufactures industrial fasteners, packaging and maintenance supplies in Bursa and Izmir, with 1,140 employees. Women make up 31% of the workforce.',
    narrative:
      'We focused on women’s progression in manufacturing. A technical leadership programme for women supervisors started in April, and we introduced on-site childcare support at our Bursa plant.',
    actions:
      'Eighteen women completed the first technical leadership cohort. The Bursa childcare partnership supports 46 families, and we updated our anti-harassment policy with an external hotline.',
    support:
      'We used WEPs resources on care support and joined a WEPs regional peer exchange for manufacturers.',
    principles:
      'Principles 3 and 4 were our focus. We began scoping Principle 5 work with our raw material suppliers.',
    indicators:
      'Indicators cover both Turkish plants and head office. The pay gap figure covers production and supervisory grades.',
    challenges:
      'Shift patterns in production remain a barrier for caregivers. Retention of women engineers in their first two years is lower than for men.',
    declaration: declaration('Ingrid Halvorsen', 'Nova Supply', 2025),
  },
  indicators: [
    ind(
      'nova',
      2025,
      1,
      'Women in workforce',
      2,
      31.0,
      '%',
      'Bursa and Izmir plants, head office',
      30.0,
    ),
    ind(
      'nova',
      2025,
      2,
      'Women in senior management',
      1,
      21.0,
      '%',
      'Bursa and Izmir plants, head office',
      19.0,
    ),
    ind('nova', 2025, 3, 'Women on board', 1, 29.0, '%', 'Company board', 29.0),
    ind(
      'nova',
      2025,
      4,
      'Gender pay gap (median)',
      2,
      11.8,
      '%',
      'Production and supervisory grades',
      12.6,
    ),
    ind('nova', 2025, 5, 'Parental leave return rate', 3, 84.0, '%', 'All operations', 80.0),
    ind(
      'nova',
      2025,
      6,
      'Employees completing gender-equality training',
      4,
      52.0,
      '%',
      'All operations',
      38.0,
    ),
  ],
})

const nova2026 = submitted({
  slug: 'nova',
  companyId: 'c-nova',
  year: 2026,
  status: 'under_review',
  approverId: 'u-ceo-nova',
  submittedAt: '2026-10-14T11:20:00.000Z',
  publicSummaryApproved: false,
  sections: {
    snapshot:
      'Nova Supply employs 1,180 people across two plants and its Istanbul head office. Women make up 32.5% of the workforce and 23% of senior management.',
    narrative:
      'This year we extended our progression work to engineering and began gender-responsive procurement. A second technical leadership cohort started, and we set our first target for spend with women-owned suppliers.',
    actions:
      'We ran the second technical leadership cohort with 21 participants, extended childcare support to Izmir and registered 14 women-owned suppliers through a national women entrepreneurs’ association.',
    support:
      'Our procurement team completed the gender-responsive procurement learning path and used the Gender-responsive Procurement Toolbox to adapt tender documents.',
    principles:
      'We reported progress on Principles 2, 3, 4 and 5, with Principle 5 a new area this year.',
    indicators:
      'Indicators cover all operations. Supplier spend is reported for the first time and covers indirect procurement only.',
    challenges:
      'Women-owned suppliers in our raw material categories are scarce, so early progress is in indirect spend such as catering, cleaning and printing.',
    declaration: declaration('Ingrid Halvorsen', 'Nova Supply', 2026),
  },
  indicators: [
    ind('nova', 2026, 1, 'Women in workforce', 2, 32.5, '%', 'All operations', 31.0),
    ind('nova', 2026, 2, 'Women in senior management', 1, 23.0, '%', 'All operations', 21.0),
    ind('nova', 2026, 3, 'Women on board', 1, 29.0, '%', 'Company board', 29.0),
    ind(
      'nova',
      2026,
      4,
      'Gender pay gap (median)',
      2,
      10.9,
      '%',
      'Production and supervisory grades',
      11.8,
    ),
    ind(
      'nova',
      2026,
      5,
      'Spend with women-owned suppliers',
      5,
      2.4,
      '%',
      'Indirect procurement',
      null,
    ),
    ind(
      'nova',
      2026,
      6,
      'Employees completing gender-equality training',
      4,
      64.0,
      '%',
      'All operations',
      52.0,
    ),
    ind('nova', 2026, 7, 'Parental leave return rate', 3, 87.0, '%', 'All operations', 84.0),
  ],
  evidence: [
    {
      id: 'ev-nova-2026-1',
      fileName: 'Nova-Supplier-Register-Women-Owned-2025.xlsx',
      uploadedById: 'u-ceo-nova',
      uploadedAt: '2026-10-13T16:00:00.000Z',
    },
  ],
})

/* ------------------------------------------------------------------ Lumen Health -- */

const lumen2025 = submitted({
  slug: 'lumen',
  companyId: 'c-lumen',
  year: 2025,
  status: 'accepted',
  approverId: 'u-ceo-lumen',
  submittedAt: '2025-11-12T06:30:00.000Z',
  reviewedAt: '2025-12-05T08:00:00.000Z',
  sections: {
    snapshot:
      'Lumen Health operates nine hospitals and 40 diagnostic centres across Karnataka, Tamil Nadu and Maharashtra, with 6,200 employees. Women make up 64% of the workforce but 34% of senior management.',
    narrative:
      'Our focus is moving women clinicians and nurses into leadership. We launched a clinical leadership fellowship and introduced safe transport for night-shift nursing staff.',
    actions:
      'Forty nurses and doctors joined the clinical leadership fellowship. Night-shift transport now covers all nine hospitals, and our internal complaints committees were retrained.',
    support:
      'We drew on WEPs guidance on workplace safety and participated in a WEPs India peer learning session.',
    principles:
      'Principles 3 and 4 were priorities, alongside Principle 1 through board-level oversight of the fellowship.',
    indicators:
      'Indicators cover all hospitals and diagnostic centres. Pay gap figures are calculated for non-clinical and nursing grades.',
    challenges:
      'Senior clinical roles are filled from a small pool of specialists, so change in senior representation is gradual.',
    declaration: declaration('Dr Ayesha Karim', 'Lumen Health', 2025),
  },
  indicators: [
    ind(
      'lumen',
      2025,
      1,
      'Women in workforce',
      2,
      64.0,
      '%',
      'All hospitals and diagnostic centres',
      63.0,
    ),
    ind(
      'lumen',
      2025,
      2,
      'Women in senior management',
      1,
      34.0,
      '%',
      'All hospitals and diagnostic centres',
      31.0,
    ),
    ind('lumen', 2025, 3, 'Women on board', 1, 36.0, '%', 'Company board', 27.0),
    ind(
      'lumen',
      2025,
      4,
      'Gender pay gap (median)',
      2,
      8.4,
      '%',
      'Nursing and non-clinical grades',
      9.1,
    ),
    ind('lumen', 2025, 5, 'Parental leave return rate', 3, 89.0, '%', 'All operations', 86.0),
    ind(
      'lumen',
      2025,
      6,
      'Employees completing gender-equality training',
      4,
      58.0,
      '%',
      'All operations',
      44.0,
    ),
  ],
})

const lumen2026 = submitted({
  slug: 'lumen',
  companyId: 'c-lumen',
  year: 2026,
  status: 'accepted',
  approverId: 'u-ceo-lumen',
  submittedAt: '2026-08-28T05:45:00.000Z',
  reviewedAt: '2026-09-18T10:20:00.000Z',
  sections: {
    snapshot:
      'Lumen Health employs 6,450 people across nine hospitals and 44 diagnostic centres. Women make up 65% of the workforce and 37% of senior management.',
    narrative:
      'The second clinical leadership fellowship cohort included 55 participants, and six fellows from the first cohort were promoted to department head or matron roles. We also began reporting supplier diversity for medical consumables.',
    actions:
      'We expanded the fellowship, opened creches at four hospitals and introduced a women-owned supplier category in our procurement system.',
    support:
      'Our sustainability team used the WEPs Transparency and Accountability Roadmap to align indicators, and attended the WEPs reporting clinic.',
    principles:
      'We report on all seven principles for the first time, with deeper progress on Principles 1, 3 and 4.',
    indicators:
      'All indicators cover full operations. Supplier spend covers medical consumables and facilities services.',
    challenges:
      'Creche capacity does not yet meet demand at our largest hospitals. Supplier ownership verification relies on self-declaration.',
    declaration: declaration('Dr Ayesha Karim', 'Lumen Health', 2026),
  },
  indicators: [
    ind('lumen', 2026, 1, 'Women in workforce', 2, 65.0, '%', 'All operations', 64.0),
    ind('lumen', 2026, 2, 'Women in senior management', 1, 37.0, '%', 'All operations', 34.0),
    ind('lumen', 2026, 3, 'Women on board', 1, 36.0, '%', 'Company board', 36.0),
    ind(
      'lumen',
      2026,
      4,
      'Gender pay gap (median)',
      2,
      7.6,
      '%',
      'Nursing and non-clinical grades',
      8.4,
    ),
    ind(
      'lumen',
      2026,
      5,
      'Spend with women-owned suppliers',
      5,
      6.8,
      '%',
      'Medical consumables and facilities',
      null,
    ),
    ind(
      'lumen',
      2026,
      6,
      'Employees completing gender-equality training',
      4,
      71.0,
      '%',
      'All operations',
      58.0,
    ),
    ind('lumen', 2026, 7, 'Parental leave return rate', 3, 91.0, '%', 'All operations', 89.0),
  ],
  evidence: [
    {
      id: 'ev-lumen-2026-1',
      fileName: 'Lumen-HR-Indicators-FY2025.xlsx',
      uploadedById: 'u-ceo-lumen',
      uploadedAt: '2026-08-26T07:00:00.000Z',
    },
  ],
})

/* ------------------------------------------------------------------ Meridian Bank -- */

const meridian2025 = submitted({
  slug: 'meridian',
  companyId: 'c-meridian',
  year: 2025,
  status: 'accepted',
  approverId: 'u-ceo-meridian',
  submittedAt: '2025-11-20T09:00:00.000Z',
  reviewedAt: '2025-12-12T13:00:00.000Z',
  sections: {
    snapshot:
      'Meridian Bank is a Jordanian commercial bank with 2,300 employees and 58 branches. Women make up 39% of the workforce and 25% of senior management.',
    narrative:
      'We focused on women’s financial inclusion and internal progression. A women-led SME lending programme launched in partnership with a business association, and we introduced a returnship for women re-entering banking.',
    actions:
      'The SME programme disbursed loans to 410 women-led businesses. Eleven returners joined branch and credit roles.',
    support:
      'We used WEPs materials on enterprise development and joined a WEPs Arab States regional event.',
    principles:
      'Principles 4 and 5 were our main focus, with Principle 6 through financial literacy workshops.',
    indicators: 'Indicators cover all Jordanian operations.',
    challenges:
      'Branch manager roles require late hours that conflict with care responsibilities. We are piloting staggered hours.',
    declaration: declaration('Rafael Costa', 'Meridian Bank', 2025),
  },
  indicators: [
    ind('meridian', 2025, 1, 'Women in workforce', 2, 39.0, '%', 'All Jordanian operations', 38.0),
    ind(
      'meridian',
      2025,
      2,
      'Women in senior management',
      1,
      25.0,
      '%',
      'All Jordanian operations',
      23.0,
    ),
    ind('meridian', 2025, 3, 'Women on board', 1, 18.0, '%', 'Board of directors', 18.0),
    ind(
      'meridian',
      2025,
      4,
      'Gender pay gap (median)',
      2,
      16.5,
      '%',
      'All Jordanian operations',
      17.8,
    ),
    ind(
      'meridian',
      2025,
      5,
      'Share of SME lending to women-led businesses',
      5,
      14.0,
      '%',
      'SME loan book',
      11.0,
    ),
    ind(
      'meridian',
      2025,
      6,
      'Parental leave return rate',
      3,
      85.0,
      '%',
      'All Jordanian operations',
      83.0,
    ),
  ],
})

const meridian2026 = submitted({
  slug: 'meridian',
  companyId: 'c-meridian',
  year: 2026,
  status: 'accepted',
  approverId: 'u-ceo-meridian',
  submittedAt: '2026-09-10T08:15:00.000Z',
  reviewedAt: '2026-10-02T09:40:00.000Z',
  sections: {
    snapshot:
      'Meridian Bank employs 2,350 people across 60 branches. Women make up 40% of the workforce, 27% of senior management and, following the 2026 AGM, 27% of the board.',
    narrative:
      'Women-led SME lending grew to 17% of the SME book, and the staggered hours pilot was extended to 20 branches. We published our first gender pay gap figure in our annual report.',
    actions:
      'We extended staggered branch hours, launched a credit officer academy with 50% women participants and added a women-owned supplier criterion to facilities tenders.',
    support:
      'Our HR team attended the WEPs pay equity clinic and used the gender action plan template to update our targets.',
    principles:
      'Progress is reported against Principles 1, 2, 4 and 5. Two new women non-executive directors strengthened Principle 1.',
    indicators:
      'Indicators cover all Jordanian operations. Pay gap is median total pay across all employees.',
    challenges:
      'The pay gap remains driven by the concentration of men in treasury and corporate banking. We have set a target for women in those teams.',
    declaration: declaration('Rafael Costa', 'Meridian Bank', 2026),
  },
  indicators: [
    ind('meridian', 2026, 1, 'Women in workforce', 2, 40.0, '%', 'All Jordanian operations', 39.0),
    ind(
      'meridian',
      2026,
      2,
      'Women in senior management',
      1,
      27.0,
      '%',
      'All Jordanian operations',
      25.0,
    ),
    ind('meridian', 2026, 3, 'Women on board', 1, 27.0, '%', 'Board of directors', 18.0),
    ind(
      'meridian',
      2026,
      4,
      'Gender pay gap (median)',
      2,
      15.1,
      '%',
      'All Jordanian operations',
      16.5,
    ),
    ind(
      'meridian',
      2026,
      5,
      'Share of SME lending to women-led businesses',
      5,
      17.0,
      '%',
      'SME loan book',
      14.0,
    ),
    ind(
      'meridian',
      2026,
      6,
      'Employees completing gender-equality training',
      4,
      66.0,
      '%',
      'All Jordanian operations',
      51.0,
    ),
    ind(
      'meridian',
      2026,
      7,
      'Parental leave return rate',
      3,
      88.0,
      '%',
      'All Jordanian operations',
      85.0,
    ),
  ],
})

/* ------------------------------------------------------------------ Solace Foods -- */

const solace2026 = submitted({
  slug: 'solace',
  companyId: 'c-solace',
  year: 2026,
  status: 'accepted',
  approverId: 'u-ceo-solace',
  submittedAt: '2026-08-21T10:00:00.000Z',
  reviewedAt: '2026-09-11T14:30:00.000Z',
  sections: {
    snapshot:
      'Solace Foods processes and exports olive oil, argan products and dried fruit from Meknes and Agadir, with 820 employees and a network of 1,900 contracted smallholders. Women make up 58% of the workforce.',
    narrative:
      'Our work centres on women in the agricultural value chain. We expanded direct sourcing from women’s argan cooperatives and introduced fair price agreements with transparent premiums.',
    actions:
      'We signed multi-year agreements with 12 women’s cooperatives, funded literacy and bookkeeping training for 260 cooperative members, and opened a lactation room at both processing sites.',
    support: 'We used WEPs supply chain resources and joined the supplier diversity clinic.',
    principles:
      'Principles 5 and 6 are our strongest areas. Principle 2 work focused on equal pay for seasonal processing staff.',
    indicators:
      'Indicators cover both processing sites. Supplier spend includes payments to women’s cooperatives and women smallholders.',
    challenges:
      'Seasonal workers are hard to reach with training. Climate-related harvest variation affects cooperative incomes year to year.',
    declaration: declaration('Fatima Benali', 'Solace Foods', 2026),
  },
  indicators: [
    ind('solace', 2026, 1, 'Women in workforce', 2, 58.0, '%', 'Meknes and Agadir sites', 57.0),
    ind(
      'solace',
      2026,
      2,
      'Women in senior management',
      1,
      38.0,
      '%',
      'Meknes and Agadir sites',
      35.0,
    ),
    ind('solace', 2026, 3, 'Women on board', 1, 40.0, '%', 'Company board', 40.0),
    ind(
      'solace',
      2026,
      4,
      'Gender pay gap (median)',
      2,
      6.2,
      '%',
      'Permanent and seasonal staff',
      7.4,
    ),
    ind(
      'solace',
      2026,
      5,
      'Spend with women-owned suppliers',
      5,
      31.0,
      '%',
      'Raw material sourcing',
      26.0,
    ),
    ind(
      'solace',
      2026,
      6,
      'Employees completing gender-equality training',
      4,
      47.0,
      '%',
      'Permanent staff',
      39.0,
    ),
  ],
})

/* ------------------------------------------------------------------ Terra Textiles -- */

const terra2026 = submitted({
  slug: 'terra',
  companyId: 'c-terra',
  year: 2026,
  status: 'accepted',
  approverId: 'u-ceo-terra',
  submittedAt: '2026-09-04T13:10:00.000Z',
  reviewedAt: '2026-09-25T15:00:00.000Z',
  sections: {
    snapshot:
      'Terra Textiles produces cotton and recycled-fibre apparel in São Paulo and Ceará, with 2,900 employees. Women make up 71% of the workforce but 33% of supervisors.',
    narrative:
      'We focused on progression from machine operator to supervisor and on harassment prevention on the factory floor. A supervisor academy and an independent grievance hotline launched this year.',
    actions:
      'Eighty-four operators joined the supervisor academy, 61% of them women. The independent hotline received 37 reports, all investigated within 30 days.',
    support:
      'We used WEPs materials on harassment prevention and engaged a mentor through the portal for our grievance process review.',
    principles:
      'Principles 2, 3 and 4 were priorities. We also began a supplier audit programme covering gender criteria.',
    indicators:
      'Indicators cover both factories and head office. Supervisor representation is reported separately as a key internal measure.',
    challenges:
      'Overtime peaks in the export season make training attendance difficult. Some supplier sites resist gender-specific audit questions.',
    declaration: declaration('Ananya Iyer', 'Terra Textiles', 2026),
  },
  indicators: [
    ind(
      'terra',
      2026,
      1,
      'Women in workforce',
      2,
      71.0,
      '%',
      'Both factories and head office',
      70.0,
    ),
    ind('terra', 2026, 2, 'Women in supervisory roles', 4, 33.0, '%', 'Both factories', 29.0),
    ind(
      'terra',
      2026,
      3,
      'Women in senior management',
      1,
      30.0,
      '%',
      'Both factories and head office',
      28.0,
    ),
    ind('terra', 2026, 4, 'Women on board', 1, 33.0, '%', 'Company board', 33.0),
    ind(
      'terra',
      2026,
      5,
      'Gender pay gap (median)',
      2,
      9.3,
      '%',
      'Both factories and head office',
      10.5,
    ),
    ind(
      'terra',
      2026,
      6,
      'Employees completing gender-equality training',
      4,
      68.0,
      '%',
      'Both factories and head office',
      45.0,
    ),
    ind(
      'terra',
      2026,
      7,
      'Parental leave return rate',
      3,
      83.0,
      '%',
      'Both factories and head office',
      80.0,
    ),
  ],
})

/* ------------------------------------------------------------------ Orbit Logistics -- */

const orbit2026 = submitted({
  slug: 'orbit',
  companyId: 'c-orbit',
  year: 2026,
  status: 'accepted',
  approverId: 'u-ceo-orbit',
  submittedAt: '2026-09-17T02:30:00.000Z',
  reviewedAt: '2026-10-07T08:00:00.000Z',
  sections: {
    snapshot:
      'Orbit Logistics provides regional freight, customs brokerage and last-mile delivery from Singapore, with 1,480 employees across six ASEAN markets. Women make up 34% of the workforce.',
    narrative:
      'Our first full reporting year as a signatory focused on data and pay transparency. We completed a group-wide pay analysis and set targets for women in technology and operations leadership.',
    actions:
      'We completed a pay review across six markets, adjusted pay for 43 employees with unexplained gaps and launched a mentoring programme for women in dispatch and fleet management.',
    support:
      'Our team completed the evidence and reporting course and used the Transparency and Accountability Roadmap to select indicators.',
    principles:
      'Principles 2 and 7 were our priorities, with initial work on Principle 4 through mentoring.',
    indicators:
      'Indicators cover all six markets. Market-level data quality varies; Vietnam and the Philippines rely on payroll provider extracts.',
    challenges:
      'Last-mile delivery roles are largely contracted, so our workforce data does not yet cover gig drivers.',
    declaration: declaration('Marcus Feld', 'Orbit Logistics', 2026),
  },
  indicators: [
    ind('orbit', 2026, 1, 'Women in workforce', 2, 34.0, '%', 'All six markets', 33.0),
    ind('orbit', 2026, 2, 'Women in senior management', 1, 24.0, '%', 'All six markets', 22.0),
    ind('orbit', 2026, 3, 'Women on board', 1, 25.0, '%', 'Group board', 25.0),
    ind('orbit', 2026, 4, 'Gender pay gap (median)', 2, 12.7, '%', 'All six markets', null),
    ind(
      'orbit',
      2026,
      5,
      'Spend with women-owned suppliers',
      5,
      3.6,
      '%',
      'Singapore indirect procurement',
      2.9,
    ),
    ind(
      'orbit',
      2026,
      6,
      'Employees completing gender-equality training',
      4,
      55.0,
      '%',
      'All six markets',
      30.0,
    ),
  ],
})

export const reports: AnnualReport[] = [
  asteria2024,
  asteria2025,
  asteria2026,
  harbour2025,
  harbour2026,
  nova2025,
  nova2026,
  lumen2025,
  lumen2026,
  meridian2025,
  meridian2026,
  solace2026,
  terra2026,
  orbit2026,
]
