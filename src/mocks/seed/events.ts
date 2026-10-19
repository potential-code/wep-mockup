import type { ClinicEvent, Registration } from '@shared/types'
import { images } from '@/config/images'
import { users } from './users'

// Clinics and webinars. Upcoming designated clinics require the department path course and
// 200 qualifying learning points (brief §14). All sessions are illustrative.

export const events: ClinicEvent[] = [
  {
    id: 'evt-inclusive-recruitment-clinic',
    slug: 'inclusive-recruitment-clinic',
    title: 'Inclusive Recruitment Clinic: Fixing the Shortlist',
    type: 'clinic',
    format: 'online',
    facilitatorId: 'u-sofia',
    startsAt: '2026-11-04T12:00:00.000Z',
    durationMin: 90,
    timezone: 'UTC',
    language: 'English',
    principle: 2,
    topic: 'Recruitment',
    capacity: 30,
    image: images.clinics.inclusiveHiringWebinar.src,
    summary:
      'A hands-on clinic for HR teams who have completed the Inclusive Recruitment path. Bring one live vacancy and leave with a structured, bias-aware shortlisting rubric.',
    objectives: [
      'Audit a real job advert and selection criteria for gendered language and unnecessary requirements',
      'Build a structured scoring rubric for shortlisting and interviews',
      'Plan how to track applicant and shortlist gender balance each quarter',
    ],
    agenda: [
      { time: '0:00', item: 'Welcome and what we heard from the pathway reflections' },
      { time: '0:15', item: 'Live audit: three anonymised job adverts' },
      { time: '0:40', item: 'Small groups: draft your shortlisting rubric' },
      { time: '1:10', item: 'Peer review and expert feedback' },
      { time: '1:25', item: 'Commitments and next steps' },
    ],
    preparation:
      'Complete the Inclusive Recruitment path and pass the path quiz. Bring one current or recent vacancy.',
    prerequisiteCourseId: 'crs-inclusive-recruitment',
    minQualifyingPoints: 200,
    attendancePoints: 75,
    status: 'scheduled',
    materials: [{ label: 'Shortlisting rubric template', resourceId: 'res-gender-action-plan' }],
  },
  {
    id: 'evt-procurement-clinic',
    slug: 'procurement-clinic',
    title: 'Gender-responsive Procurement Clinic',
    type: 'clinic',
    format: 'online',
    facilitatorId: 'u-sofia',
    startsAt: '2026-11-12T13:00:00.000Z',
    durationMin: 90,
    timezone: 'UTC',
    language: 'English',
    principle: 5,
    topic: 'Procurement',
    capacity: 25,
    image: images.clinics.procurementClinic.src,
    summary:
      'Turn your supplier data into a practical plan: set a baseline for spend with women-owned businesses and redesign one tender to widen access.',
    objectives: [
      'Calculate a credible baseline for spend with women-owned suppliers',
      'Identify barriers in one existing tender process',
      'Draft supplier engagement steps for the next quarter',
    ],
    agenda: [
      { time: '0:00', item: 'Why baselines matter and common data gaps' },
      { time: '0:20', item: 'Working session: your supplier data' },
      { time: '0:55', item: 'Tender redesign in pairs' },
      { time: '1:20', item: 'Questions and follow-up' },
    ],
    preparation:
      'Complete the Gender-responsive Procurement path. Bring an export of last year’s supplier spend if you can.',
    prerequisiteCourseId: 'crs-gender-responsive-procurement',
    minQualifyingPoints: 200,
    attendancePoints: 75,
    status: 'scheduled',
    materials: [
      { label: 'Gender-responsive Procurement Toolbox', resourceId: 'res-procurement-toolbox' },
    ],
  },
  {
    id: 'evt-inclusive-comms-webinar',
    slug: 'inclusive-comms-webinar',
    title: 'Responsible Representation in Campaigns',
    type: 'webinar',
    format: 'online',
    facilitatorId: 'u-priya',
    startsAt: '2026-11-19T10:00:00.000Z',
    durationMin: 60,
    timezone: 'UTC',
    language: 'English',
    principle: 5,
    topic: 'Communications',
    capacity: 100,
    image: images.sections.community.src,
    summary:
      'A practical webinar on avoiding stereotypes in advertising, imagery and product messaging, with real before-and-after examples.',
    objectives: [
      'Spot common stereotypes in campaign briefs',
      'Apply a representation checklist before launch',
    ],
    agenda: [
      { time: '0:00', item: 'Introduction' },
      { time: '0:10', item: 'Before and after: six campaigns' },
      { time: '0:40', item: 'Checklist walkthrough and Q&A' },
    ],
    preparation: 'Complete the Inclusive Communications path.',
    prerequisiteCourseId: 'crs-inclusive-communications',
    minQualifyingPoints: 200,
    attendancePoints: 75,
    status: 'scheduled',
    materials: [],
  },
  {
    id: 'evt-reporting-clinic',
    slug: 'reporting-clinic',
    title: 'Annual Reporting Clinic: Evidence that Holds Up',
    type: 'clinic',
    format: 'hybrid',
    facilitatorId: 'u-hannah',
    startsAt: '2026-11-26T09:00:00.000Z',
    durationMin: 120,
    timezone: 'UTC',
    language: 'English',
    principle: 7,
    topic: 'Reporting',
    capacity: 40,
    image: images.clinics.reportingClinic.src,
    summary:
      'For leaders and focal points preparing the 2026 report: indicators, coverage, evidence and a clear progress narrative.',
    objectives: [
      'Define indicator units, coverage and period consistently',
      'Choose evidence that supports each claim',
      'Write a balanced progress narrative',
    ],
    agenda: [
      { time: '0:00', item: 'What reviewers look for' },
      { time: '0:30', item: 'Indicator clinic: bring your numbers' },
      { time: '1:15', item: 'Narrative writing workshop' },
      { time: '1:50', item: 'Wrap-up' },
    ],
    preparation: 'Complete the Leadership and Accountability path.',
    prerequisiteCourseId: 'crs-leadership-accountability',
    minQualifyingPoints: 200,
    attendancePoints: 75,
    status: 'scheduled',
    location: 'UN Women Regional Office, Amman, and online',
    materials: [
      {
        label: 'WEPs Transparency and Accountability Roadmap',
        resourceId: 'res-transparency-roadmap',
      },
    ],
  },
  {
    id: 'evt-pay-equity-clinic',
    slug: 'pay-equity-clinic',
    title: 'Pay Equity Review: First Steps',
    type: 'clinic',
    format: 'online',
    facilitatorId: 'u-amara',
    startsAt: '2026-10-29T11:00:00.000Z',
    durationMin: 75,
    timezone: 'UTC',
    language: 'English',
    principle: 2,
    topic: 'Pay and progression',
    capacity: 20,
    image: images.sections.clinicLive.src,
    summary:
      'An open clinic on scoping a first pay equity review: data you need, comparisons that are fair and how to communicate results.',
    objectives: ['Scope the data for a pay equity review', 'Choose fair comparison groups'],
    agenda: [
      { time: '0:00', item: 'Scoping your review' },
      { time: '0:30', item: 'Worked example' },
      { time: '1:00', item: 'Questions' },
    ],
    preparation: 'No prerequisite. Places are limited.',
    attendancePoints: 75,
    status: 'scheduled',
    materials: [],
  },
  {
    id: 'evt-supplier-diversity-clinic',
    slug: 'supplier-diversity-clinic',
    title: 'Supplier Diversity Clinic',
    type: 'clinic',
    format: 'online',
    facilitatorId: 'u-james',
    startsAt: '2026-09-17T13:00:00.000Z',
    durationMin: 90,
    timezone: 'UTC',
    language: 'English',
    principle: 5,
    topic: 'Procurement',
    capacity: 25,
    image: images.sections.supplyChain.src,
    summary:
      'Mapping women-owned suppliers in your categories and building a simple certification check.',
    objectives: ['Map supplier ownership data', 'Agree a verification approach'],
    agenda: [
      { time: '0:00', item: 'Data sources' },
      { time: '0:40', item: 'Working session' },
    ],
    preparation: 'Complete the Gender-responsive Procurement path.',
    prerequisiteCourseId: 'crs-gender-responsive-procurement',
    minQualifyingPoints: 200,
    attendancePoints: 75,
    status: 'completed',
    recordingAvailable: true,
    materials: [
      { label: 'Gender-responsive Procurement Toolbox', resourceId: 'res-procurement-toolbox' },
    ],
  },
  {
    id: 'evt-gap-analysis-webinar',
    slug: 'gap-analysis-webinar',
    title: 'From Baseline to Action Plan',
    type: 'webinar',
    format: 'online',
    facilitatorId: 'u-hannah',
    startsAt: '2026-08-20T10:00:00.000Z',
    durationMin: 60,
    timezone: 'UTC',
    language: 'English',
    principle: 7,
    topic: 'Action planning',
    capacity: 150,
    image: images.sections.plansIntoAction.src,
    summary:
      'How to turn assessment results into a short list of priority actions with owners, targets and evidence.',
    objectives: ['Prioritise gaps', 'Write SMART actions'],
    agenda: [{ time: '0:00', item: 'Webinar and Q&A' }],
    preparation: 'Open to all company users.',
    attendancePoints: 75,
    status: 'completed',
    recordingAvailable: true,
    materials: [
      { label: 'WEPs Gender Action Plan Template', resourceId: 'res-gender-action-plan' },
    ],
  },
  {
    id: 'evt-wellbeing-webinar',
    slug: 'wellbeing-webinar',
    title: 'Safe and Healthy Workplaces for All',
    type: 'webinar',
    format: 'online',
    facilitatorId: 'u-amara',
    startsAt: '2026-07-15T09:00:00.000Z',
    durationMin: 60,
    timezone: 'UTC',
    language: 'English',
    principle: 3,
    topic: 'Wellbeing',
    capacity: 150,
    image: images.courses.workplaceWellbeing.src,
    summary: 'Preventing harassment, supporting caregivers and designing safer shift patterns.',
    objectives: ['Review prevention policies', 'Plan caregiver support'],
    agenda: [{ time: '0:00', item: 'Webinar and Q&A' }],
    preparation: 'Open to all company users.',
    attendancePoints: 75,
    status: 'completed',
    recordingAvailable: false,
    materials: [],
  },
]

const activeEmployees = users.filter(
  (u) => u.role === 'employee' && u.invitationStatus === 'accepted' && !u.demoPersona,
)

let rseq = 0
const reg = (
  eventId: string,
  userId: string,
  status: Registration['status'],
  createdAt: string,
): Registration => ({
  id: `reg-${++rseq}`,
  eventId,
  userId,
  status,
  createdAt,
})

const take = (dept: string[], n: number, offset = 0) =>
  activeEmployees.filter((u) => dept.includes(u.department ?? '')).slice(offset, offset + n)

export const registrations: Registration[] = [
  ...take(['hr', 'operations'], 14).map((u) =>
    reg('evt-inclusive-recruitment-clinic', u.id, 'registered', '2026-10-08T10:00:00.000Z'),
  ),
  ...take(['procurement'], 11).map((u) =>
    reg('evt-procurement-clinic', u.id, 'registered', '2026-10-09T10:00:00.000Z'),
  ),
  ...take(['marketing'], 9).map((u) =>
    reg('evt-inclusive-comms-webinar', u.id, 'registered', '2026-10-10T10:00:00.000Z'),
  ),
  ...take(['leadership', 'sustainability'], 12).map((u) =>
    reg('evt-reporting-clinic', u.id, 'registered', '2026-10-11T10:00:00.000Z'),
  ),
  // Full clinic: capacity 20, demonstrates the waitlist.
  ...activeEmployees
    .slice(0, 20)
    .map((u) => reg('evt-pay-equity-clinic', u.id, 'registered', '2026-10-05T10:00:00.000Z')),
  reg('evt-supplier-diversity-clinic', 'u-omar', 'attended', '2026-09-01T10:00:00.000Z'),
  reg('evt-gap-analysis-webinar', 'u-nora', 'attended', '2026-08-10T10:00:00.000Z'),
  ...take(['procurement'], 12).map((u, i) =>
    reg(
      'evt-supplier-diversity-clinic',
      u.id,
      i % 5 === 4 ? 'no_show' : 'attended',
      '2026-09-02T10:00:00.000Z',
    ),
  ),
  ...activeEmployees
    .slice(20, 66)
    .map((u, i) =>
      reg(
        'evt-gap-analysis-webinar',
        u.id,
        i % 6 === 5 ? 'no_show' : 'attended',
        '2026-08-10T10:00:00.000Z',
      ),
    ),
  ...activeEmployees
    .slice(30, 64)
    .map((u, i) =>
      reg(
        'evt-wellbeing-webinar',
        u.id,
        i % 7 === 6 ? 'cancelled' : 'attended',
        '2026-07-01T10:00:00.000Z',
      ),
    ),
]

// Omar's feedback on his attended clinic.
const omarReg = registrations.find((r) => r.userId === 'u-omar')
if (omarReg)
  omarReg.feedback = {
    rating: 5,
    comment: 'Practical and specific. The verification checklist saved us weeks.',
  }
