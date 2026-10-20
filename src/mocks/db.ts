// In-memory demo database, seeded from ./seed and persisted to localStorage so state survives
// role switches and reloads. Only services/ may import this module. resetDemo() restores the
// seed. This is the single place to swap for a real API later.

import type {
  ActionItem,
  AnnualReport,
  Application,
  ApplicationData,
  Assessment,
  AuditEntry,
  CertificationOffering,
  CertificationPurchase,
  ClinicEvent,
  CommsTemplate,
  Company,
  Conversation,
  Course,
  CourseProgress,
  Invitation,
  Listing,
  MentorBooking,
  MentorProfile,
  MentorSlot,
  Notification,
  PlatformSettings,
  PointsEvent,
  QuizQuestion,
  Registration,
  Resource,
  Session,
  Thread,
  User,
} from '@shared/types'
import { actions } from './seed/actions'
import { applications } from './seed/applications'
import { asteriaAssessment, asteriaAssessmentArchive } from './seed/assessment'
import {
  certificationExams,
  certificationOfferings,
  certificationPurchases,
} from './seed/certifications'
import { threads } from './seed/community'
import { companies } from './seed/companies'
import { courses } from './seed/courses'
import { events, registrations } from './seed/events'
import { listings } from './seed/listings'
import { mentorBookings, mentorProfiles, mentorSlots } from './seed/mentors'
import { auditLog, commsTemplates, notifications, platformSettings } from './seed/notifications'
import { portfolioActions, portfolioAssessments } from './seed/portfolio'
import { courseProgress, pointsEvents } from './seed/progress'
import { reports } from './seed/reports'
import { resources } from './seed/resources'
import { invitations, users } from './seed/users'

export interface DemoDb {
  version: number
  session: Session | null
  /** A visitor's in-progress Join application (saved and resumed). */
  joinDraft: {
    data: ApplicationData
    step: number
    documents: Application['documents']
    savedAt: string
  } | null
  users: User[]
  companies: Company[]
  invitations: Invitation[]
  applications: Application[]
  assessments: Assessment[]
  actions: ActionItem[]
  courses: Course[]
  progress: CourseProgress[]
  points: PointsEvent[]
  events: ClinicEvent[]
  registrations: Registration[]
  mentorProfiles: MentorProfile[]
  slots: MentorSlot[]
  bookings: MentorBooking[]
  resources: Resource[]
  savedResources: { userId: string; resourceId: string; at: string }[]
  recentResources: { userId: string; resourceId: string; at: string }[]
  conversations: Conversation[]
  offerings: CertificationOffering[]
  /** Exam questions by offering id, kept apart so answers never reach company pages. */
  certExams: Record<string, QuizQuestion[]>
  purchases: CertificationPurchase[]
  threads: Thread[]
  listings: Listing[]
  reports: AnnualReport[]
  notifications: Notification[]
  audit: AuditEntry[]
  comms: CommsTemplate[]
  settings: PlatformSettings
  notificationPrefs: Record<string, Record<string, boolean>>
}

const STORAGE_KEY = 'weps-demo-db'
const VERSION = 7

const clone = <T>(value: T): T => structuredClone(value)

function seed(): DemoDb {
  return clone({
    version: VERSION,
    session: null,
    joinDraft: null,
    users,
    companies,
    invitations,
    applications,
    assessments: [asteriaAssessment, asteriaAssessmentArchive, ...portfolioAssessments],
    actions: [...actions, ...portfolioActions],
    courses,
    progress: courseProgress,
    points: pointsEvents,
    events,
    registrations,
    mentorProfiles,
    slots: mentorSlots,
    bookings: mentorBookings,
    resources,
    savedResources: [
      { userId: 'u-maya', resourceId: 'res-gender-action-plan', at: '2026-10-01T09:00:00.000Z' },
      { userId: 'u-omar', resourceId: 'res-procurement-toolbox', at: '2026-06-01T09:00:00.000Z' },
    ],
    recentResources: [],
    conversations: [],
    offerings: certificationOfferings,
    certExams: certificationExams,
    purchases: certificationPurchases,
    threads,
    listings,
    reports,
    notifications,
    audit: auditLog,
    comms: commsTemplates,
    settings: platformSettings,
    notificationPrefs: {},
  })
}

function load(): DemoDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DemoDb
      if (parsed.version === VERSION) return parsed
    }
  } catch {
    // Private mode or corrupt data: fall back to the seed.
  }
  return seed()
}

export const db: DemoDb = load()

let pending: ReturnType<typeof setTimeout> | undefined

/** Persist after a write. Debounced so bursts of updates write once. */
export function commit() {
  clearTimeout(pending)
  pending = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
    } catch {
      // Storage full or unavailable: the demo keeps working in memory.
    }
  }, 50)
}

/** Restore the starting data. Keeps the current session so the presenter stays signed in. */
export function resetDemo() {
  const session = db.session
  Object.assign(db, seed(), { session })
  clearTimeout(pending)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // ignore
  }
}

let idSeq = 0
export const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${(++idSeq).toString(36)}`
