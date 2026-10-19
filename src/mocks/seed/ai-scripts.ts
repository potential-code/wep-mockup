import type { AiScript } from '@shared/types'

export const aiScripts: AiScript[] = [
  {
    id: 'ai-learn-next-procurement',
    roles: ['employee'],
    prompt: 'What should I learn next in Procurement?',
    answer: [
      'Your Procurement learning path has three courses: Gender-responsive Procurement (the designated course), Supplier Engagement and Action Planning. Gender-responsive Procurement comes first because completing it and passing its quiz is what unlocks the Procurement Clinic.',
      'If you have already finished the designated course, Supplier Engagement is the natural next step. It covers how to collect ownership data from suppliers in a proportionate way and how to support women-owned businesses through onboarding.',
      'The Gender-responsive Procurement Toolbox from WEPs / UN Women is a useful companion reading for both courses.',
    ],
    sources: [
      {
        label: 'Gender-responsive Procurement course',
        to: '/portal/learn/crs-gender-responsive-procurement',
      },
      { label: 'Supplier Engagement course', to: '/portal/learn/crs-supplier-engagement' },
      {
        label: 'Gender-responsive Procurement Toolbox',
        to: '/portal/resources/res-procurement-toolbox',
      },
    ],
    actions: [
      { label: 'Open course', to: '/portal/learn/crs-gender-responsive-procurement' },
      { label: 'View Procurement Clinic', to: '/portal/clinics/evt-procurement-clinic' },
    ],
  },
  {
    id: 'ai-clinic-locked',
    roles: ['employee'],
    prompt: 'Why is this clinic locked?',
    answer: [
      'The Inclusive Recruitment Clinic unlocks when two conditions are met: you complete the designated Inclusive Recruitment course and you hold at least 200 qualifying points.',
      'You have completed Lessons 1 to 3 and passed the course quiz, which gives you 175 qualifying points. One step remains: complete Lesson 4. That earns 25 qualifying points, bringing you to 200 and completing the course, so the clinic will unlock straight away.',
      'Points from attending clinics, feedback forms and community posts count towards your balance but are not qualifying points, so they do not affect this threshold.',
    ],
    sources: [
      {
        label: 'Inclusive Recruitment Clinic',
        to: '/portal/clinics/evt-inclusive-recruitment-clinic',
      },
      { label: 'Inclusive Recruitment course', to: '/portal/learn/crs-inclusive-recruitment' },
      { label: 'Your points', to: '/portal/points' },
    ],
    actions: [
      {
        label: 'Continue Lesson 4',
        to: '/portal/learn/crs-inclusive-recruitment/crs-inclusive-recruitment-l4',
      },
      { label: 'View points', to: '/portal/points' },
    ],
  },
  {
    id: 'ai-points-mentoring',
    roles: ['employee'],
    prompt: 'How many points do I need for mentoring?',
    answer: [
      'A 30-minute mentoring session costs 500 redeemable points. Points are deducted once, when the booking is confirmed, and refunded if the mentor cancels or you cancel more than 24 hours before the session.',
      'You currently have 620 redeemable points, so you can book one session now and would have 120 points left afterwards.',
      'Mentors in the directory include procurement specialists such as Dr Sofia Bennett and James Liu, who can help you work through supplier baselines and targets.',
    ],
    sources: [
      { label: 'Your points', to: '/portal/points' },
      { label: 'Mentor directory', to: '/portal/mentorship' },
    ],
    actions: [
      { label: 'Browse mentors', to: '/portal/mentorship' },
      { label: 'View points history', to: '/portal/points' },
    ],
  },
  {
    id: 'ai-actions-evidence',
    roles: ['company_admin'],
    prompt: 'Which actions need evidence?',
    answer: [
      'Several actions in the Asteria Group action plan are in progress and list an evidence requirement but have no file attached yet. These are the ones to chase before the 2026 report is prepared, because the indicators section draws on the same evidence.',
      'Actions already marked as evidence submitted are waiting for your review. Accepting them moves the action to complete and records the contribution for the owner.',
      'Open the action plan and filter by "Evidence missing" to see owners and due dates, then send a reminder from each action.',
    ],
    sources: [
      { label: 'Asteria Group action plan', to: '/portal/action-plan' },
      { label: '2026 annual report', to: '/portal/reports/2026' },
    ],
    actions: [{ label: 'Open action plan', to: '/portal/action-plan' }],
  },
  {
    id: 'ai-draft-narrative',
    roles: ['company_admin', 'ceo'],
    prompt: 'Help draft this year’s progress narrative',
    isDraft: true,
    answer: [
      'In 2026 Asteria Group moved from commitment to structured delivery. Following our baseline assessment, we adopted an action plan covering recruitment, procurement, marketing and leadership accountability, with a named owner for every action and quarterly review by the executive committee.',
      'We invited 24 colleagues to the WEPs portal; 18 have activated their accounts and 12 have completed their department learning path. Our HR team introduced structured interviews for store manager roles, and procurement began collecting ownership data from suppliers to establish a baseline for spend with women-owned businesses.',
      'We still have work to do. Group-wide pay gap data is not yet consolidated, and supplier data coverage is incomplete. In 2027 we will extend both and report on them transparently.',
      'This is a draft generated from your portal records. Check every figure against your evidence and edit it before adding it to the report.',
    ],
    sources: [
      { label: '2026 annual report', to: '/portal/reports/2026' },
      { label: 'Asteria Group action plan', to: '/portal/action-plan' },
      {
        label: 'WEPs Transparency and Accountability Roadmap',
        to: '/portal/resources/res-transparency-roadmap',
      },
    ],
    actions: [{ label: 'Insert into narrative section', to: '/portal/reports/2026' }],
  },
  {
    id: 'ai-department-followup',
    roles: ['company_admin', 'ceo'],
    prompt: 'Which departments need follow-up?',
    answer: [
      'Across Asteria Group, 24 colleagues have been invited, 18 have activated (75%) and 12 have completed their learning path (67% of activated users).',
      'The gap sits mainly with the six colleagues who have not activated their invitation and with those who started but have not finished their designated course. Procurement and Marketing have the most people still part-way through their paths, while HR is closest to completion: Maya Chen needs one more lesson to unlock the Inclusive Recruitment Clinic.',
      'A reminder from the Team page to pending invitees, plus a short note from department leads, is usually enough to close most of the gap before the clinics run.',
    ],
    sources: [
      { label: 'Team and invitations', to: '/portal/company/team' },
      { label: 'Learning progress', to: '/portal/company/team' },
    ],
    actions: [
      { label: 'Resend pending invitations', to: '/portal/company/team' },
      { label: 'View learning progress', to: '/portal/company/team' },
    ],
  },
  {
    id: 'ai-ceo-priorities',
    roles: ['ceo'],
    prompt: 'Summarise our current priorities and decisions',
    answer: [
      'Asteria Group’s action plan focuses on four areas drawn from the 2026 assessment: inclusive recruitment, gender-responsive procurement, inclusive marketing and leadership accountability for reporting.',
      'Decisions waiting for you: approving actions sent for CEO review, and approving the 2026 annual report once Nora Aziz marks it ready. The report is currently a draft, and it is due on 30 November 2026.',
      'Team engagement is steady: 18 of 24 invited colleagues are active and 12 have completed their learning path.',
    ],
    sources: [
      { label: 'Asteria Group action plan', to: '/portal/action-plan' },
      { label: '2026 annual report', to: '/portal/reports/2026' },
    ],
    actions: [
      { label: 'Review action plan', to: '/portal/action-plan' },
      { label: 'Open 2026 report', to: '/portal/reports/2026' },
    ],
  },
  {
    id: 'ai-ceo-report-progress',
    roles: ['ceo', 'company_admin'],
    prompt: 'Show the progress of our annual report',
    answer: [
      'The 2026 annual report is in draft, prepared by Nora Aziz with you as approver. It is due on 30 November 2026.',
      'Some sections are complete. The indicators section still has missing values, mainly where group-wide data is not yet consolidated, and the declaration can only be completed once the report is ready for your approval.',
      'Once Nora marks the report ready, you will receive a notification to review and submit it to UN Women.',
    ],
    sources: [
      { label: '2026 annual report', to: '/portal/reports/2026' },
      {
        label: 'Indicator Evidence Checklist',
        to: '/portal/resources/res-indicator-evidence-checklist',
      },
    ],
    actions: [{ label: 'Open report', to: '/portal/reports/2026' }],
  },
  {
    id: 'ai-admin-overdue-reports',
    roles: ['global_admin'],
    prompt: 'Which companies have overdue reports?',
    answer: [
      'For the 2026 reporting cycle, Harbour Services is the only company with an overdue item: its report was returned with changes requested, and the supporting evidence for its indicators and actions sections is past the date agreed with the reviewer.',
      'The other approved signatories are on track. Five reports are accepted, Nova Supply is under review, and Asteria Group is still in draft, but the deadline of 30 November 2026 has not passed.',
      'That puts the cycle at 5 of 8 accepted, or 62.5%.',
    ],
    sources: [
      { label: 'Annual reports', to: '/admin/reporting/annual-reports' },
      { label: 'Harbour Services record', to: '/admin/reporting/companies/c-harbour' },
    ],
    actions: [
      { label: 'Open Harbour Services', to: '/admin/reporting/companies/c-harbour' },
      { label: 'View all reports', to: '/admin/reporting/annual-reports' },
    ],
  },
  {
    id: 'ai-admin-clinic-readiness',
    roles: ['global_admin'],
    prompt: 'Compare clinic readiness by department',
    answer: [
      'Across all companies, 120 users have been invited, 96 have activated and 60 have completed their learning paths. Completing the designated course and reaching 200 qualifying points is what makes someone ready for their department clinic.',
      'HR learners are furthest ahead, supported by strong completion of the Inclusive Recruitment course. Procurement readiness is building ahead of the Procurement Clinic. Leadership and Sustainability have the fewest completions, so the Reporting Clinic may need targeted promotion to focal points and CEOs.',
      'The learning report breaks this down by company and department if you need exact counts.',
    ],
    sources: [{ label: 'Learning report', to: '/admin/reporting/learning' }],
    actions: [{ label: 'Open learning report', to: '/admin/reporting/learning' }],
  },
  {
    id: 'ai-admin-portfolio-summary',
    roles: ['global_admin'],
    prompt: 'Prepare a portfolio summary with source records',
    isDraft: true,
    answer: [
      'The portfolio holds 10 company records: 8 approved signatories, 1 application under review (Kestrel Energy) and 1 awaiting information (Cedar Works).',
      '2026 reporting: 5 reports accepted, 1 under review (Nova Supply), 1 with changes requested (Harbour Services, overdue evidence) and 1 in draft (Asteria Group). Acceptance stands at 5 of 8, or 62.5%.',
      'Engagement: 120 users invited, 96 activated (80%) and 60 learning paths completed (63% of activated users).',
      'This summary is a draft compiled from portal records. Follow the source links to verify each figure before sharing.',
    ],
    sources: [
      { label: 'Annual reports', to: '/admin/reporting/annual-reports' },
      { label: 'Learning report', to: '/admin/reporting/learning' },
      { label: 'Harbour Services record', to: '/admin/reporting/companies/c-harbour' },
    ],
    actions: [{ label: 'Open reporting', to: '/admin/reporting/annual-reports' }],
  },
  {
    id: 'ai-unavailable-pay-gap',
    roles: ['ceo', 'company_admin', 'global_admin'],
    prompt: 'What was our gender pay gap in 2023?',
    unavailable: true,
    answer: [
      'I cannot find that figure. Asteria Group did not report a gender pay gap indicator for 2023, and there are no portal records for that year to draw on.',
      'I will not estimate a value, because an unreported figure could be mistaken for a verified one. Pay gap data is available in reports from the years where it was submitted, with its stated coverage.',
      'If you have internal payroll analysis for 2023, you could reference it as context in the challenges section of this year’s report.',
    ],
    sources: [{ label: 'Annual reports', to: '/portal/reports/2026' }],
    actions: [{ label: 'Open reports', to: '/portal/reports/2026' }],
  },
  {
    id: 'ai-resource-context',
    roles: ['employee', 'company_admin', 'ceo'],
    prompt: 'Summarise this resource and suggest how my team could use it',
    answer: [
      'In short: this resource sets out practical steps your team can adopt without new systems. Start with the section closest to your department’s work, and treat the checklists as a conversation starter rather than a compliance test.',
      'A sensible way to use it is to pick one recommendation, link it to an action in your company action plan, and ask a colleague in the relevant department to review it with you. If you would like human advice, a 30-minute mentoring session can help you turn it into a plan.',
      'This summary is general guidance. Open the resource itself for the exact wording and version.',
    ],
    sources: [{ label: 'Resource library', to: '/portal/resources' }],
    actions: [
      { label: 'Open resource library', to: '/portal/resources' },
      { label: 'Open action plan', to: '/portal/action-plan' },
      { label: 'Browse mentors', to: '/portal/mentorship' },
    ],
  },
  {
    id: 'ai-mentor-week',
    roles: ['mentor'],
    prompt: 'What is on my calendar this week?',
    answer: [
      'You have one-to-one bookings from Harbour Services and Nova Supply this week and next, plus two group clinics coming up: the Inclusive Recruitment Clinic on 4 November and the Gender-responsive Procurement Clinic on 12 November.',
      'Each booking shows only the context the participant chose to share. Open a session to see their goal and any linked action before you join.',
    ],
    sources: [{ label: 'Your calendar', to: '/expert/calendar' }],
    actions: [
      { label: 'Open calendar', to: '/expert/calendar' },
      { label: 'Manage availability', to: '/expert/availability' },
    ],
  },
  {
    id: 'ai-mentor-followup-draft',
    roles: ['mentor'],
    prompt: 'Draft a follow-up note for my last session',
    isDraft: true,
    answer: [
      'Thank you for your time today. A short summary of what we agreed: start with your 40 largest suppliers by spend, keep the ownership self-declaration to a single question, and revisit the data after the next clinic.',
      'I have attached the Gender-responsive Procurement Toolbox as a companion reading. Please let me know if anything is unclear.',
      'This is a draft based on the shared context only. Edit it freely before adding it to the session record, and keep anything sensitive in your private note.',
    ],
    sources: [{ label: 'Your calendar', to: '/expert/calendar' }],
    actions: [{ label: 'Open sessions', to: '/expert/calendar' }],
  },
]
