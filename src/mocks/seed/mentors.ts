import type { MentorBooking, MentorProfile, MentorSlot } from '@shared/types'

// Fictional experts. Sessions are 30 minutes and cost 500 redeemable points (proposed demo rule).

export const mentorProfiles: MentorProfile[] = [
  {
    userId: 'u-sofia',
    headline: 'Gender-responsive procurement and inclusive recruitment',
    bio: 'Sofia has spent 18 years helping retailers and manufacturers open their supply chains to women-owned businesses. She previously led supplier diversity for a European retail group and now advises companies across the Gulf, East Africa and Europe on tender design, supplier verification and inclusive hiring.',
    expertise: ['Supplier diversity', 'Tender design', 'Inclusive recruitment', 'Baseline data'],
    sectors: ['Retail and consumer goods', 'Manufacturing', 'Logistics and transport'],
    languages: ['English', 'French', 'Arabic (conversational)'],
    principles: [5, 2],
    departments: ['procurement', 'hr'],
    formats: ['one_to_one', 'group'],
    sessionMinutes: 30,
    pointsCost: 500,
    published: true,
    rating: 4.9,
    sessionsDelivered: 126,
    location: 'London, United Kingdom',
  },
  {
    userId: 'u-amara',
    headline: 'Fair progression, pay equity and workplace wellbeing',
    bio: 'Amara is an HR director turned advisor who has run pay equity reviews for banks and hospital networks. She focuses on promotion processes, flexible work and anti-harassment systems that employees trust.',
    expertise: ['Pay equity', 'Promotion processes', 'Flexible work', 'Harassment prevention'],
    sectors: ['Financial services', 'Healthcare'],
    languages: ['English', 'Yoruba'],
    principles: [2, 3, 4],
    departments: ['hr', 'leadership'],
    formats: ['one_to_one'],
    sessionMinutes: 30,
    pointsCost: 500,
    published: true,
    rating: 4.8,
    sessionsDelivered: 88,
    location: 'Lagos, Nigeria',
  },
  {
    userId: 'u-james',
    headline: 'Supplier development and verification',
    bio: 'James builds supplier development programmes for logistics and manufacturing companies in Asia, with a focus on practical ownership verification and capacity building for small suppliers.',
    expertise: ['Supplier development', 'Ownership verification', 'Category strategy'],
    sectors: ['Logistics and transport', 'Manufacturing'],
    languages: ['English', 'Mandarin'],
    principles: [5],
    departments: ['procurement', 'operations'],
    formats: ['one_to_one', 'group'],
    sessionMinutes: 30,
    pointsCost: 500,
    published: true,
    rating: 4.7,
    sessionsDelivered: 64,
    location: 'Singapore',
  },
  {
    userId: 'u-priya',
    headline: 'Inclusive communications and responsible marketing',
    bio: 'Priya helps brand and communications teams review campaigns for stereotypes and build representation checklists into the creative process.',
    expertise: ['Campaign review', 'Representation', 'Internal communications'],
    sectors: ['Retail and consumer goods', 'Technology and telecommunications'],
    languages: ['English', 'Hindi', 'Tamil'],
    principles: [5, 6],
    departments: ['marketing'],
    formats: ['one_to_one'],
    sessionMinutes: 30,
    pointsCost: 500,
    published: true,
    rating: 4.9,
    sessionsDelivered: 71,
    location: 'Bengaluru, India',
  },
  {
    userId: 'u-carlos',
    headline: 'Executive sponsorship and accountability',
    bio: 'Carlos coaches executive teams on owning gender equality targets: governance, sponsorship of women leaders and linking commitments to performance reviews.',
    expertise: ['Executive sponsorship', 'Governance', 'Target setting'],
    sectors: ['Financial services', 'Energy and utilities', 'Textiles and apparel'],
    languages: ['English', 'Portuguese', 'Spanish'],
    principles: [1, 7],
    departments: ['leadership'],
    formats: ['one_to_one'],
    sessionMinutes: 30,
    pointsCost: 500,
    published: true,
    rating: 4.6,
    sessionsDelivered: 52,
    location: 'São Paulo, Brazil',
  },
  {
    userId: 'u-hannah',
    headline: 'Sustainability reporting and indicator design',
    bio: 'Hannah trains reporting teams on indicator definitions, data coverage and evidence. She runs the WEPs reporting clinics in this demo.',
    expertise: ['Indicators', 'ESG reporting', 'Evidence'],
    sectors: ['All sectors'],
    languages: ['English', 'German'],
    principles: [7],
    departments: ['sustainability', 'leadership'],
    formats: ['group'],
    sessionMinutes: 30,
    pointsCost: 500,
    published: true,
    rating: 4.8,
    sessionsDelivered: 40,
    location: 'Berlin, Germany',
  },
  {
    userId: 'u-rania-pending',
    headline: 'Women’s leadership programmes',
    bio: 'Profile awaiting UN Women approval.',
    expertise: ['Leadership development'],
    sectors: ['Professional services'],
    languages: ['English', 'Arabic'],
    principles: [4],
    departments: ['leadership'],
    formats: ['one_to_one'],
    sessionMinutes: 30,
    pointsCost: 500,
    published: false,
    pendingApproval: true,
    rating: 0,
    sessionsDelivered: 0,
    location: 'Amman, Jordan',
  },
]

/** Weekday slots for the next three weeks from the demo date (19 Oct 2026). */
const SLOT_HOURS: Record<string, number[]> = {
  'u-sofia': [9, 13, 15],
  'u-amara': [8, 11],
  'u-james': [6, 9],
  'u-priya': [5, 10],
  'u-carlos': [13, 17],
}

export const mentorSlots: MentorSlot[] = Object.entries(SLOT_HOURS).flatMap(([mentorId, hours]) => {
  const out: MentorSlot[] = []
  for (let d = 0; d < 21; d++) {
    const date = new Date(Date.UTC(2026, 9, 20 + d))
    const dow = date.getUTCDay()
    if (dow === 0 || dow === 6) continue
    if ((d + mentorId.length) % 3 === 0) continue // not available every day
    for (const h of hours) {
      date.setUTCHours(h, 0, 0, 0)
      out.push({
        id: `slot-${mentorId.replace('u-', '')}-${date.toISOString().slice(0, 13)}`,
        mentorId,
        startsAt: date.toISOString(),
        durationMin: 30,
        status: 'open',
      })
    }
  }
  return out
})

const bookSlot = (mentorId: string, startsAt: string) => {
  const slot = mentorSlots.find((s) => s.mentorId === mentorId && s.startsAt === startsAt)
  if (slot) slot.status = 'booked'
  return slot?.id ?? `slot-past-${mentorId}-${startsAt.slice(0, 13)}`
}

export const mentorBookings: MentorBooking[] = [
  {
    id: 'bk-1',
    slotId: bookSlot('u-carlos', '2026-10-22T13:00:00.000Z'),
    mentorId: 'u-carlos',
    userId: 'u-nora',
    companyId: 'c-asteria',
    purpose: 'Company session: preparing the executive committee for the 2026 report sign-off',
    actionId: 'act-6',
    sharedContext:
      'Programme-allocated executive session (no points used). Asteria Group 2026 report draft status and three company priorities.',
    status: 'booked',
    pointsCost: 0,
    createdAt: '2026-10-12T09:00:00.000Z',
  },
  {
    id: 'bk-2',
    slotId: 'slot-past-sofia-2026-09-24',
    mentorId: 'u-sofia',
    userId: 'u-ast-02',
    companyId: 'c-asteria',
    purpose: 'Reviewing our supplier ownership data before the procurement clinic',
    sharedContext: 'Procurement department, supplier spend baseline action.',
    status: 'completed',
    pointsCost: 500,
    createdAt: '2026-09-15T09:00:00.000Z',
    followUp: {
      nextActions: [
        'Add ownership field to supplier onboarding form',
        'Verify top 40 suppliers by spend',
      ],
      resourceIds: ['res-procurement-toolbox'],
      sharedNote:
        'Good progress. Start with the 40 largest suppliers and keep the self-declaration simple.',
    },
    privateNote: 'Team is motivated; data quality is the main blocker. Follow up after clinic.',
    feedback: { rating: 5, comment: 'Clear and practical.' },
  },
  {
    id: 'bk-3',
    slotId: bookSlot('u-sofia', '2026-10-21T13:00:00.000Z'),
    mentorId: 'u-sofia',
    userId: 'u-harbour-03',
    companyId: 'c-harbour',
    purpose: 'Redesigning a haulage tender to include women-owned transport SMEs',
    sharedContext: 'Harbour Services procurement team.',
    status: 'booked',
    pointsCost: 500,
    createdAt: '2026-10-14T09:00:00.000Z',
  },
  {
    id: 'bk-4',
    slotId: bookSlot('u-sofia', '2026-10-27T09:00:00.000Z'),
    mentorId: 'u-sofia',
    userId: 'u-nova-02',
    companyId: 'c-nova',
    purpose: 'Recruitment rubric for production supervisors',
    sharedContext: 'Nova Supply HR.',
    status: 'booked',
    pointsCost: 500,
    createdAt: '2026-10-16T09:00:00.000Z',
  },
  {
    id: 'bk-5',
    slotId: 'slot-past-amara-2026-09-10',
    mentorId: 'u-amara',
    userId: 'u-lumen-04',
    companyId: 'c-lumen',
    purpose: 'Scoping a pay equity review',
    sharedContext: 'Lumen Health HR.',
    status: 'no_show',
    pointsCost: 500,
    createdAt: '2026-09-01T09:00:00.000Z',
  },
]
