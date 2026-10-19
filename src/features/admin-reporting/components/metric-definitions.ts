export type Layer = 'activity' | 'evidence' | 'outcomes'

export interface MetricDef {
  name: string
  definition: string
  denominator: string
  layer: Layer
}

/** Prototype definitions from brief §23, plus supporting measures used on the other tabs. */
export const METRICS = {
  approved_signatories: {
    name: 'Approved signatories',
    definition:
      'Distinct companies currently approved as signatories. Employees and applications are not counted.',
    denominator: 'No denominator: a count of approved company records in scope.',
    layer: 'activity',
  },
  active_companies: {
    name: 'Active companies',
    definition:
      'Approved companies with at least one authenticated user activity in the selected period.',
    denominator: 'All approved companies in scope.',
    layer: 'activity',
  },
  activated_users: {
    name: 'Activated users',
    definition: 'Invited users who accepted the invitation and accessed their portal.',
    denominator: 'Users invited by approved companies in scope (revoked invitations excluded).',
    layer: 'activity',
  },
  path_completion: {
    name: 'Path completion rate',
    definition: 'Users who completed their assigned learning path within the stated cohort.',
    denominator: 'Activated users in scope, each assigned the path for their department.',
    layer: 'activity',
  },
  clinic_attendance: {
    name: 'Clinic attendance rate',
    definition: 'Confirmed attendees divided by registered participants.',
    denominator: 'Registered participants of completed events; cancelled registrations excluded.',
    layer: 'activity',
  },
  reporting_completion: {
    name: 'Reporting completion',
    definition: 'Companies with an accepted report for the selected year.',
    denominator: 'Companies required to report that year (all approved signatories in scope).',
    layer: 'outcomes',
  },
  action_completion: {
    name: 'Action completion',
    definition:
      'Completed actions divided by actions due in the selected period. Evidence and review status stay visible.',
    denominator: 'Actions with a due date on or before the demo date (19 Oct 2026).',
    layer: 'evidence',
  },
  reported_outcomes: {
    name: 'Company-reported outcomes',
    definition:
      'Submitted indicator values with unit, period, coverage and evidence status. Kept separate from platform activity.',
    denominator: 'Indicators submitted in accepted or under-review annual reports.',
    layer: 'outcomes',
  },
  enrolment: {
    name: 'Enrolment',
    definition: 'Learners who started a course (any lesson opened).',
    denominator: 'Activated users in scope.',
    layer: 'activity',
  },
  readiness: {
    name: 'Clinic readiness',
    definition:
      'Learners who completed the designated course and hold the qualifying points for their department clinic.',
    denominator: 'Activated users in scope.',
    layer: 'activity',
  },
  feedback_rating: {
    name: 'Feedback rating',
    definition: 'Mean of 1–5 ratings left after an event.',
    denominator: 'Registrations that include feedback (not all attendees).',
    layer: 'activity',
  },
  drop_off: {
    name: 'Pathway drop-off',
    definition:
      'Share of assigned learners who completed each lesson step of their designated course.',
    denominator: 'Activated users in scope assigned the department pathway.',
    layer: 'activity',
  },
  slot_utilisation: {
    name: 'Slot utilisation',
    definition: 'Booked slots divided by all open and booked slots.',
    denominator: 'Open plus booked slots published by experts (blocked slots excluded).',
    layer: 'activity',
  },
  no_show_rate: {
    name: 'No-show rate',
    definition: 'Mentoring sessions marked no-show.',
    denominator: 'Completed plus no-show sessions.',
    layer: 'activity',
  },
  evidence_coverage: {
    name: 'Evidence coverage',
    definition: 'Active actions with at least one evidence file attached.',
    denominator: 'Active (non-draft) actions in scope.',
    layer: 'evidence',
  },
  accepted_contributions: {
    name: 'Accepted contributions',
    definition: 'Actions marked complete with accepted evidence.',
    denominator: 'All actions in scope.',
    layer: 'evidence',
  },
  baseline_completion: {
    name: 'Baseline completion',
    definition: 'Approved companies with a submitted assessment.',
    denominator: 'Approved companies in scope.',
    layer: 'evidence',
  },
  confirmed_payments: {
    name: 'Confirmed payments',
    definition:
      'Certification purchases with a recorded payment that were not refunded. Each purchase is counted once.',
    denominator: 'No denominator. Demo payments only: no real transactions.',
    layer: 'activity',
  },
  confirmed_revenue: {
    name: 'Confirmed revenue (demo)',
    definition:
      'Sum of confirmed, non-refunded demo payments. Refunds, failed and cancelled checkouts are excluded.',
    denominator: 'Confirmed non-refunded purchases in scope.',
    layer: 'activity',
  },
  listing_engagement: {
    name: 'Listing views and outbound clicks',
    definition:
      'Views of a published listing and clicks on its provider purchase link. The portal does not process sales.',
    denominator: 'Published listings in scope.',
    layer: 'activity',
  },
  participation: {
    name: 'Discussion participation',
    definition: 'Distinct people who posted a thread or reply (AI replies excluded).',
    denominator: 'Users in scope.',
    layer: 'activity',
  },
  funnel: {
    name: 'Company progression funnel',
    definition:
      'Applications, approved, activated, assessed, with action plans and reporting. Stages after "Approved" use the approved cohort only.',
    denominator:
      'Each stage is a count of distinct companies; the first stage includes not-approved applications.',
    layer: 'activity',
  },
} satisfies Record<string, MetricDef>

export type MetricKey = keyof typeof METRICS

export const LAYERS: Record<Layer, { label: string; description: string }> = {
  activity: {
    label: 'Platform activity',
    description: 'What people did in the portal: logins, learning, bookings, attendance.',
  },
  evidence: {
    label: 'Implementation evidence',
    description: 'Actions, deadlines and evidence files that show what a company is doing.',
  },
  outcomes: {
    label: 'Company-reported outcomes',
    description:
      'Indicator values companies submit in annual reports. Self-reported, not verified.',
  },
}
