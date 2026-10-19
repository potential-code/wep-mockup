// Human mentorship (brief §15). Booking reserves the slot and deducts points together, once.
// Proposed rules: 30-minute session = 500 redeemable points; cancellation 24h+ before restores
// points, later cancellation goes to administrator review.

import { fullName } from '@shared/permissions'
import { DEMO_RULES } from '@shared/rules'
import type { MentorBooking, MentorProfile } from '@shared/types'
import {
  ApiError,
  audit,
  commit,
  db,
  delay,
  findOr404,
  newId,
  notify,
  now,
  out,
  requireCapability,
  requireUser,
} from './api'
import { evaluateClinicEligibility } from './clinics.service'
import { award, pointsBalance } from './points.service'

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')

const decorateMentor = (p: MentorProfile) => {
  const u = db.users.find((x) => x.id === p.userId)
  const next = db.slots
    .filter((s) => s.mentorId === p.userId && s.status === 'open' && s.startsAt > now())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0]
  return {
    profile: p,
    name: u ? fullName(u) : 'Expert',
    title: u?.title ?? '',
    avatar: u?.avatar,
    timezone: u?.timezone ?? 'UTC',
    nextSlot: next?.startsAt,
  }
}

export async function listMentors() {
  await delay()
  const user = requireUser()
  const published = db.mentorProfiles.filter(
    (p) => p.published && db.users.some((u) => u.id === p.userId),
  )
  const priorities = db.companies.find((c) => c.id === user.companyId)?.priorityPrinciples ?? []
  return out(
    published
      .map((p) => {
        const reasons: string[] = []
        if (user.department && p.departments.includes(user.department))
          reasons.push('Matches your department')
        if (p.principles.some((pr) => priorities.includes(pr)))
          reasons.push('Supports a company priority')
        return { ...decorateMentor(p), reasons, score: reasons.length }
      })
      .sort((a, b) => b.score - a.score || b.profile.rating - a.profile.rating),
  )
}

export async function getMentor(mentorId: string) {
  await delay()
  const p = findOr404(db.mentorProfiles, (m) => m.userId === mentorId, 'Expert')
  return out({
    ...decorateMentor(p),
    slots: db.slots
      .filter((s) => s.mentorId === mentorId && s.startsAt > now())
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  })
}

export async function getBookingContext() {
  await delay()
  const user = requireUser()
  const balance = pointsBalance(user.id)
  return out({
    balance,
    cost: DEMO_RULES.mentorSessionCost,
    shortfall: Math.max(0, DEMO_RULES.mentorSessionCost - balance.redeemable),
    actions: db.actions.filter(
      (a) =>
        a.companyId === user.companyId &&
        (a.ownerId === user.id || a.contributorIds.includes(user.id)),
    ),
  })
}

export async function bookSession(input: {
  slotId: string
  purpose: string
  actionId?: string
  shareContext: boolean
  /** What the expert may see. Defaults to everything when `shareContext` is true. */
  share?: { role: boolean; company: boolean; department: boolean; action: boolean }
  requestKey: string
}) {
  await delay(500)
  const user = requireCapability('mentorship.book')
  // Idempotent on the client request key: a double-click returns the same booking.
  const prior = db.bookings.find((b) => b.id === `bk-${input.requestKey}`)
  if (prior) return out(prior)
  const slot = findOr404(db.slots, (s) => s.id === input.slotId, 'Time slot')
  if (slot.status !== 'open' || slot.startsAt <= now())
    throw new ApiError('That time was just taken. Please choose another slot.', 'conflict')
  const profile = findOr404(db.mentorProfiles, (p) => p.userId === slot.mentorId, 'Expert')
  const balance = pointsBalance(user.id)
  if (balance.redeemable < profile.pointsCost) {
    throw new ApiError(
      `You need ${profile.pointsCost - balance.redeemable} more points to book this session.`,
      'forbidden',
    )
  }
  const company = db.companies.find((c) => c.id === user.companyId)
  const share = input.shareContext
    ? (input.share ?? { role: true, company: true, department: true, action: true })
    : { role: false, company: false, department: false, action: false }
  const action =
    input.actionId && share.action ? db.actions.find((a) => a.id === input.actionId) : undefined
  const sharedParts = [
    share.role || share.company
      ? [fullName(user), share.role ? user.title : '', share.company ? company?.name : '']
          .filter(Boolean)
          .join(', ')
      : '',
    share.department && user.department ? `Department: ${sentence(user.department)}` : '',
    action ? `Linked action: ${action.title}` : '',
  ].filter(Boolean)
  const booking: MentorBooking = {
    id: `bk-${input.requestKey}`,
    slotId: slot.id,
    mentorId: slot.mentorId,
    userId: user.id,
    companyId: user.companyId,
    purpose: input.purpose,
    actionId: action?.id,
    sharedContext: sharedParts.length ? sharedParts.join('. ') : 'No additional context shared.',
    status: 'booked',
    pointsCost: profile.pointsCost,
    createdAt: now(),
  }
  slot.status = 'booked'
  db.bookings.push(booking)
  award(
    user.id,
    'mentor_redeem',
    `booking:${booking.id}`,
    `Mentoring session with ${decorateMentor(profile).name}`,
    {
      amount: -profile.pointsCost,
      sourceLink: '/portal/mentorship/bookings',
    },
  )
  notify({
    userId: user.id,
    category: 'mentorship',
    title: 'Mentoring session booked',
    body: `${profile.pointsCost} points deducted. See your booking for joining details.`,
    link: '/portal/mentorship/bookings',
    critical: false,
    emailPreview: {
      subject: 'Your mentoring session is confirmed',
      to: user.email,
      body: [
        `Hi ${user.firstName},`,
        `Your session with ${decorateMentor(profile).name} is booked.`,
        `Cancel at least ${DEMO_RULES.cancellationWindowHours} hours before to restore your points.`,
      ],
    },
  })
  notify({
    userId: slot.mentorId,
    category: 'mentorship',
    title: 'New booking',
    body: `${fullName(user)} booked a session: ${input.purpose}`,
    link: '/expert/calendar',
    critical: false,
  })
  commit()
  return out(booking)
}

export async function cancelBooking(bookingId: string) {
  await delay(350)
  const user = requireUser()
  const booking = findOr404(
    db.bookings,
    (b) => b.id === bookingId && (b.userId === user.id || b.mentorId === user.id),
    'Booking',
  )
  if (booking.status !== 'booked') throw new ApiError('Only upcoming bookings can be cancelled.')
  const slot = db.slots.find((s) => s.id === booking.slotId)
  const hoursBefore = slot
    ? (new Date(slot.startsAt).getTime() - new Date(now()).getTime()) / 36e5
    : 0
  const restore = hoursBefore >= DEMO_RULES.cancellationWindowHours || user.id === booking.mentorId
  booking.status = restore ? 'cancelled' : 'cancellation_review'
  booking.cancelledAt = now()
  if (slot) slot.status = 'open'
  if (restore && booking.pointsCost > 0) {
    award(
      booking.userId,
      'mentor_refund',
      `refund:${booking.id}`,
      'Points restored after cancellation',
      { amount: booking.pointsCost },
    )
  }
  notify({
    userId: booking.userId === user.id ? booking.mentorId : booking.userId,
    category: 'mentorship',
    title: 'Mentoring session cancelled',
    body: restore ? 'The slot is free again.' : 'Late cancellation sent for administrator review.',
    link: booking.userId === user.id ? '/expert/calendar' : '/portal/mentorship/bookings',
    critical: false,
  })
  commit()
  return out({ booking, pointsRestored: restore ? booking.pointsCost : 0 })
}

export async function listMyBookings() {
  await delay()
  const user = requireUser()
  const rows = db.bookings.filter((b) =>
    user.role === 'mentor' ? b.mentorId === user.id : b.userId === user.id,
  )
  return out(
    rows
      .map((b) => {
        const slot = db.slots.find((s) => s.id === b.slotId)
        const mentor = db.users.find((u) => u.id === b.mentorId)
        const mentee = db.users.find((u) => u.id === b.userId)
        const company = db.companies.find((c) => c.id === b.companyId)
        return {
          booking: user.role === 'mentor' ? b : { ...b, privateNote: undefined },
          startsAt: slot?.startsAt ?? b.createdAt,
          mentorName: mentor ? fullName(mentor) : '',
          mentorAvatar: mentor?.avatar,
          menteeName: mentee ? fullName(mentee) : '',
          menteeAvatar: mentee?.avatar,
          companyName: company?.name,
        }
      })
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt)),
  )
}

/* ---------------------------------------------------------------- expert workspace -- */

export async function getExpertDashboard() {
  await delay()
  const user = requireCapability('expert.workspace')
  const profile = db.mentorProfiles.find((p) => p.userId === user.id)
  const bookings = db.bookings.filter((b) => b.mentorId === user.id)
  const sessions = db.events.filter((e) => e.facilitatorId === user.id)
  const upcomingBookings = bookings.filter((b) => b.status === 'booked')
  const upcomingEvents = sessions.filter((e) => e.status === 'scheduled')
  return out({
    profile,
    formats: user.mentorFormats ?? [],
    upcomingBookings: upcomingBookings.length,
    upcomingEvents: upcomingEvents.length,
    companies: new Set(bookings.map((b) => b.companyId).filter(Boolean)).size,
    participants:
      db.registrations.filter(
        (r) => sessions.some((s) => s.id === r.eventId) && r.status !== 'cancelled',
      ).length + bookings.length,
    followUps:
      bookings.filter((b) => b.status === 'completed' && !b.followUp).length +
      sessions.filter((e) => e.status === 'completed').length,
    events: upcomingEvents.map((e) => ({
      event: e,
      registered: db.registrations.filter((r) => r.eventId === e.id && r.status === 'registered')
        .length,
    })),
  })
}

export async function getMyAvailability() {
  await delay()
  const user = requireCapability('expert.workspace')
  return out(
    db.slots
      .filter((s) => s.mentorId === user.id && s.startsAt > now())
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  )
}

export async function toggleSlot(startsAt: string) {
  await delay(150)
  const user = requireCapability('expert.workspace')
  const slot = db.slots.find((s) => s.mentorId === user.id && s.startsAt === startsAt)
  if (slot?.status === 'booked')
    throw new ApiError('This slot is booked. Cancel the booking first.', 'conflict')
  if (slot) slot.status = slot.status === 'open' ? 'blocked' : 'open'
  else
    db.slots.push({
      id: newId('slot'),
      mentorId: user.id,
      startsAt,
      durationMin: 30,
      status: 'open',
    })
  commit()
}

export async function updateExpertProfile(patch: Partial<MentorProfile>) {
  await delay(300)
  const user = requireCapability('expert.workspace')
  const p = findOr404(db.mentorProfiles, (m) => m.userId === user.id, 'Profile')
  Object.assign(p, patch, { pendingApproval: true })
  if (patch.formats) user.mentorFormats = patch.formats
  notify({
    userId: 'u-admin',
    category: 'mentorship',
    title: 'Expert profile change to approve',
    body: `${fullName(user)} updated their profile.`,
    link: '/admin/manage/mentorship',
    critical: false,
  })
  commit()
  return out(p)
}

export async function completeSession(
  bookingId: string,
  input: {
    attended: boolean
    nextActions: string[]
    sharedNote: string
    privateNote: string
    resourceIds: string[]
  },
) {
  await delay(300)
  const user = requireCapability('expert.workspace')
  const b = findOr404(db.bookings, (x) => x.id === bookingId && x.mentorId === user.id, 'Booking')
  b.status = input.attended ? 'completed' : 'no_show'
  b.followUp = {
    nextActions: input.nextActions,
    sharedNote: input.sharedNote,
    resourceIds: input.resourceIds,
  }
  b.privateNote = input.privateNote
  notify({
    userId: b.userId,
    category: 'mentorship',
    title: 'Follow-up from your mentor',
    body: input.sharedNote.slice(0, 120),
    link: '/portal/mentorship/bookings',
    critical: false,
  })
  commit()
  return out(b)
}

/* ---------------------------------------------------------------- admin -- */

export async function approveExpertProfile(userId: string, approve: boolean) {
  await delay(250)
  requireCapability('admin.manage')
  const p = findOr404(db.mentorProfiles, (m) => m.userId === userId, 'Profile')
  p.pendingApproval = false
  p.published = approve
  audit(approve ? 'Expert profile approved' : 'Expert profile declined', userId)
  commit()
}

export async function listAllMentorData() {
  await delay()
  requireCapability('admin.reporting')
  return out({
    profiles: db.mentorProfiles.map(decorateMentor),
    slots: db.slots,
    bookings: db.bookings,
  })
}

/* ---------------------------------------------------------------- mentee feedback -- */

export async function submitBookingFeedback(bookingId: string, rating: number, comment: string) {
  await delay(250)
  const user = requireUser()
  const b = findOr404(
    db.bookings,
    (x) => x.id === bookingId && x.userId === user.id && x.status === 'completed',
    'Completed booking',
  )
  b.feedback = { rating, comment }
  commit()
  return out(b)
}

/* ---------------------------------------------------------------- expert schedule -- */

export interface ExpertScheduleItem {
  id: string
  kind: 'booking' | 'clinic'
  startsAt: string
  durationMin: number
  title: string
  /** Company (one-to-one) or cohort description (clinic). */
  who: string
  format: string
  status: string
  preparation: string
  preparationOk: boolean
  attendees: number
  prepared: number
  timezone: string
}

export async function getExpertSchedule() {
  await delay()
  const user = requireCapability('expert.workspace')
  const items: ExpertScheduleItem[] = []
  for (const b of db.bookings.filter((x) => x.mentorId === user.id)) {
    const slot = db.slots.find((s) => s.id === b.slotId)
    const mentee = db.users.find((u) => u.id === b.userId)
    const company = db.companies.find((c) => c.id === b.companyId)
    const shared = b.sharedContext !== 'No additional context shared.'
    items.push({
      id: b.id,
      kind: 'booking',
      startsAt: slot?.startsAt ?? b.createdAt,
      durationMin: slot?.durationMin ?? 30,
      title: b.purpose,
      who: [mentee ? fullName(mentee) : '', company?.name].filter(Boolean).join(' · '),
      format: 'One-to-one',
      status: b.status,
      preparation: shared ? 'Context shared' : 'No context shared',
      preparationOk: shared,
      attendees: 1,
      prepared: shared ? 1 : 0,
      timezone: user.timezone,
    })
  }
  for (const e of db.events.filter((x) => x.facilitatorId === user.id)) {
    const regs = db.registrations.filter((r) => r.eventId === e.id && r.status !== 'cancelled')
    const prepared = regs.filter((r) => evaluateClinicEligibility(r.userId, e.id).courseComplete)
    const companies = new Set(
      regs.map((r) => db.users.find((u) => u.id === r.userId)?.companyId).filter(Boolean),
    )
    items.push({
      id: e.id,
      kind: 'clinic',
      startsAt: e.startsAt,
      durationMin: e.durationMin,
      title: e.title,
      who: `${regs.length} registered · ${companies.size} ${companies.size === 1 ? 'company' : 'companies'}`,
      format: e.type === 'clinic' ? 'Group clinic' : 'Webinar',
      status: e.status === 'completed' ? 'completed' : e.status,
      preparation: regs.length
        ? `${prepared.length} of ${regs.length} prepared`
        : 'No registrations',
      preparationOk: regs.length > 0 && prepared.length === regs.length,
      attendees: regs.length,
      prepared: prepared.length,
      timezone: e.timezone,
    })
  }
  return out({
    timezone: user.timezone,
    items: items.sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  })
}

/** One-to-one session detail. The expert only receives what the mentee chose to share. */
export async function getExpertBooking(bookingId: string) {
  await delay()
  const user = requireCapability('expert.workspace')
  const b = findOr404(db.bookings, (x) => x.id === bookingId && x.mentorId === user.id, 'Booking')
  const slot = db.slots.find((s) => s.id === b.slotId)
  const mentee = db.users.find((u) => u.id === b.userId)
  const company = db.companies.find((c) => c.id === b.companyId)
  const action = b.actionId ? db.actions.find((a) => a.id === b.actionId) : undefined
  return out({
    booking: b,
    startsAt: slot?.startsAt ?? b.createdAt,
    durationMin: slot?.durationMin ?? 30,
    timezone: user.timezone,
    menteeName: mentee ? fullName(mentee) : 'Participant',
    menteeAvatar: mentee?.avatar,
    companyName: company?.name,
    actionTitle: action?.title,
  })
}

/** Sends the agreed follow-up of a group session to everyone marked as attended. */
export async function sendClinicFollowUp(
  eventId: string,
  input: { note: string; resourceIds: string[] },
) {
  await delay(300)
  const user = requireCapability('expert.workspace')
  const event = findOr404(
    db.events,
    (e) => e.id === eventId && e.facilitatorId === user.id,
    'Session',
  )
  const attended = db.registrations.filter((r) => r.eventId === eventId && r.status === 'attended')
  for (const r of attended)
    notify({
      userId: r.userId,
      category: 'mentorship',
      title: `Follow-up from ${event.title}`,
      body: input.note.slice(0, 140),
      link: `/portal/clinics/${event.id}`,
      critical: false,
    })
  commit()
  return out({ sent: attended.length })
}

/* ---------------------------------------------------------------- availability prefs -- */

export interface UnavailablePeriod {
  id: string
  from: string
  to: string
  reason: string
}
export interface AvailabilityPrefs {
  maxPerDay: number
  maxPerWeek: number
  noticeHours: number
  unavailable: UnavailablePeriod[]
}

const PREFS_KEY = 'weps-mockup:expert-availability'
const DEFAULT_PREFS: AvailabilityPrefs = {
  maxPerDay: 4,
  maxPerWeek: 12,
  noticeHours: 24,
  unavailable: [{ id: 'un-1', from: '2026-11-23', to: '2026-11-27', reason: 'Conference travel' }],
}

export async function getAvailabilityPrefs() {
  await delay(120)
  requireCapability('expert.workspace')
  try {
    const raw = localStorage.getItem(`${PREFS_KEY}`)
    if (raw) return out(JSON.parse(raw) as AvailabilityPrefs)
  } catch {
    // fall back to defaults
  }
  return out(DEFAULT_PREFS)
}

export async function saveAvailabilityPrefs(prefs: AvailabilityPrefs) {
  await delay(250)
  requireCapability('expert.workspace')
  if (prefs.maxPerDay < 1 || prefs.maxPerWeek < prefs.maxPerDay)
    throw new ApiError('The weekly limit must be at least the daily limit.')
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // storage unavailable: keep going, the demo still confirms
  }
  return out(prefs)
}
