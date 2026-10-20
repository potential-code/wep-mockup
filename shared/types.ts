// Shared domain model for the WEPs portal mockup. Imported by the mock API (services) today
// and intended to be reused by a real backend later. Dates are ISO strings.

export type ID = string
export type ISODate = string

/* ------------------------------------------------------------------ roles & access -- */

export type Role = 'global_admin' | 'ceo' | 'company_admin' | 'employee' | 'mentor'

export type CompanyPermission =
  | 'edit_profile'
  | 'manage_team'
  | 'manage_assessment'
  | 'prepare_reports'
  | 'submit_reports'
  | 'manage_listings'
  | 'purchase_certifications'

export type DepartmentId =
  | 'hr'
  | 'procurement'
  | 'marketing'
  | 'sustainability'
  | 'operations'
  | 'leadership'

export type PrincipleId = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

export type MentorFormat = 'one_to_one' | 'group'

export interface User {
  id: ID
  firstName: string
  lastName: string
  email: string
  title: string
  avatar?: string
  role: Role
  companyId?: ID
  department?: DepartmentId
  /** Company permissions. CEOs implicitly hold all of them. */
  permissions: CompanyPermission[]
  invitationStatus: InvitationStatus
  invitedAt?: ISODate
  invitedById?: ID
  activatedAt?: ISODate
  lastActiveAt?: ISODate
  suspended?: boolean
  profileComplete: boolean
  /** Mentor / trainer only. */
  mentorFormats?: MentorFormat[]
  timezone: string
  /** Fictional demo people are flagged so screens can label them. */
  demoPersona?: boolean
}

export interface Session {
  userId: ID
  startedAt: ISODate
}

/* ------------------------------------------------------------------ companies -- */

export type SignatoryStatus =
  | 'applicant'
  | 'information_requested'
  | 'under_review'
  | 'approved'
  | 'not_approved'
  | 'suspended'

export type CompanySize = '1-49' | '50-249' | '250-999' | '1000-4999' | '5000+'

export interface CompanyPriority {
  id: ID
  title: string
  principle: PrincipleId
  ownerId: ID
  dueDate: ISODate
  progress: number // 0-100
}

export interface Company {
  id: ID
  name: string
  logo?: string
  country: string
  region: string
  sector: string
  size: CompanySize
  employeeCount: number
  ownership: 'private' | 'public' | 'state_owned' | 'cooperative'
  ownerGender?: 'women_owned' | 'men_owned' | 'mixed'
  website: string
  ungcMember: boolean
  signatoryStatus: SignatoryStatus
  memberSince?: ISODate
  ceoId?: ID
  focalPointId?: ID
  summary: string
  ceoCommitment?: string
  priorities: CompanyPriority[]
  priorityPrinciples: PrincipleId[]
  publicProfileApproved: boolean
  /** Pending identity/public info change awaiting UN Women review. */
  pendingProfileRevision?: { field: string; value: string; requestedAt: ISODate }
  lastActivityAt?: ISODate
  /** Women representation, as reported at application time (percent). */
  genderBalance?: { employees: number; management: number; board: number }
}

/* ------------------------------------------------------------------ applications -- */

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'information_requested'
  | 'resubmitted'
  | 'approved'
  | 'not_approved'

export type UploadState = 'valid' | 'wrong_type' | 'too_large' | 'missing'

export interface ApplicationDocument {
  id: ID
  kind: 'ceo_statement' | 'registration' | 'ceo_portrait'
  fileName: string
  sizeKb: number
  uploadedAt: ISODate
  version: number
  /** Earlier versions are kept when a document is replaced. */
  previous?: { fileName: string; uploadedAt: ISODate; version: number }[]
}

export interface ContactPerson {
  firstName: string
  lastName: string
  gender: 'woman' | 'man' | 'non_binary' | 'prefer_not'
  email: string
  title: string
  phone?: string
}

export interface ApplicationData {
  company: {
    name: string
    ownership: Company['ownership'] | ''
    ownerGender: Company['ownerGender'] | ''
    sector: string
    region: string
    country: string
    website: string
    employeeCount: string
    ungcMember: 'yes' | 'no' | ''
    isAssetOwner: 'yes' | 'no' | ''
    fundName?: string
  }
  presence: {
    otherCountries: string[]
    legallyRegistered: 'yes' | 'no' | ''
  }
  executive: ContactPerson & { quote: string }
  contacts: { primary: ContactPerson; secondary: ContactPerson }
  genderBalance: {
    employees: string
    management: string
    board: string
    investmentCommittee?: string
  }
  plans: { hasGenderActionPlan: 'yes' | 'no' | 'in_progress' | '' }
  referral: {
    source: string
    details?: string
    contributionInterest: 'yes' | 'no' | 'maybe' | ''
  }
}

export interface TimelineEvent {
  id: ID
  at: ISODate
  actor: string
  label: string
  note?: string
}

export interface InformationRequest {
  item: string
  message: string
  dueDate?: ISODate
  requestedAt: ISODate
  requestedById: ID
  resolvedAt?: ISODate
}

export interface Application {
  id: ID
  reference: string
  status: ApplicationStatus
  /** Company record created at submission (pending until approved). */
  companyId?: ID
  applicantEmail: string
  data: ApplicationData
  documents: ApplicationDocument[]
  currentStep: number
  createdAt: ISODate
  submittedAt?: ISODate
  decidedAt?: ISODate
  decisionReason?: string
  infoRequests: InformationRequest[]
  timeline: TimelineEvent[]
  reviewNotes: { at: ISODate; by: string; note: string }[]
  /** Possible duplicate of an existing company. */
  duplicateOfCompanyId?: ID
  invitedByAdmin?: boolean
}

/* ------------------------------------------------------------------ invitations -- */

export interface Invitation {
  id: ID
  token: string
  email: string
  firstName: string
  lastName: string
  role: Role
  companyId?: ID
  department?: DepartmentId
  permissions: CompanyPermission[]
  invitedById: ID
  createdAt: ISODate
  expiresAt: ISODate
  status: InvitationStatus
  userId?: ID
}

/* ------------------------------------------------------------------ assessment & actions -- */

export type AssessmentStatus = 'not_started' | 'in_progress' | 'submitted' | 'archived'

export interface AssessmentQuestion {
  id: ID
  text: string
  help?: string
  type: 'single' | 'scale' | 'text'
  options?: string[]
  principle: PrincipleId
  department?: DepartmentId
}

export interface AssessmentSection {
  id: ID
  title: string
  description: string
  questions: AssessmentQuestion[]
}

export interface AssessmentNeed {
  id: ID
  title: string
  description: string
  principle: PrincipleId
  department: DepartmentId
  resourceId?: ID
  courseId?: ID
  eventId?: ID
  mentorId?: ID
}

export interface Assessment {
  id: ID
  companyId: ID
  name: string
  period: string
  ownerId: ID
  status: AssessmentStatus
  answers: Record<ID, string>
  evidence: Record<ID, string[]>
  updatedAt: ISODate
  submittedAt?: ISODate
  strengths: string[]
  needs: AssessmentNeed[]
}

export type ActionStatus =
  | 'draft'
  | 'ceo_review'
  | 'in_progress'
  | 'evidence_submitted'
  | 'complete'
  | 'needs_revision'

export interface Evidence {
  id: ID
  fileName: string
  uploadedById: ID
  uploadedAt: ISODate
  note?: string
}

export interface ActionItem {
  id: ID
  companyId: ID
  title: string
  purpose: string
  principle: PrincipleId
  ownerId: ID
  department: DepartmentId
  baseline: string
  target: string
  dueDate: ISODate
  status: ActionStatus
  evidenceRequired: string
  evidence: Evidence[]
  contributorIds: ID[]
  linkedCourseIds: ID[]
  linkedResourceIds: ID[]
  needId?: ID
  history: { at: ISODate; byId: ID; label: string }[]
}

/* ------------------------------------------------------------------ learning -- */

export type LessonType = 'video' | 'reading' | 'quiz' | 'reflection'

export interface QuizQuestion {
  id: ID
  text: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface Lesson {
  id: ID
  title: string
  type: LessonType
  minutes: number
  summary: string
  body: string[]
  keyPoints?: string[]
  transcript?: string
  quiz?: QuizQuestion[]
  reflectionPrompt?: string
}

export interface Course {
  id: ID
  slug: string
  title: string
  objective: string
  description: string
  outcomes: string[]
  image: string
  departments: DepartmentId[]
  principle: PrincipleId
  topic: string
  language: string
  lessons: Lesson[]
  /** Designated pathway course: completing it + passing its quiz unlocks a clinic. */
  designated?: boolean
  relatedEventId?: ID
  prerequisiteCourseId?: ID
  audience: 'employee' | 'leadership' | 'all'
  published: boolean
  /** Groups the non-quiz lessons for the course builder. The course's quiz lesson is its post-test. */
  modules?: CourseModule[]
  /** Ungraded check shown before the modules; it records a starting point and awards no points. */
  preTest?: CourseTest
  difficulty?: CourseDifficulty
  certificate?: boolean
  updatedAt?: ISODate
}

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface CourseModule {
  id: ID
  title: string
  lessonIds: ID[]
}

export interface CourseTest {
  title: string
  questions: QuizQuestion[]
}

export interface LearningPath {
  id: ID
  department: DepartmentId
  title: string
  description: string
  courseIds: ID[]
  /** The designated course whose completion unlocks the department clinic. */
  designatedCourseId: ID
  clinicId: ID
}

export interface CourseProgress {
  userId: ID
  courseId: ID
  completedLessonIds: ID[]
  quizScores: Record<ID, number>
  startedAt: ISODate
  lastLessonId?: ID
  completedAt?: ISODate
  reflections: Record<ID, string>
  /** Post-test attempts per quiz lesson. */
  quizAttempts?: Record<ID, number>
  /** Pre-test scores in attempt order. The pre-test is ungraded and awards no points. */
  preTestScores?: number[]
}

/* ------------------------------------------------------------------ points -- */

export type PointsAction =
  | 'profile_complete'
  | 'lesson_complete'
  | 'quiz_pass'
  | 'clinic_attend'
  | 'feedback'
  | 'community_contribution'
  | 'action_contribution'
  | 'mentor_redeem'
  | 'mentor_refund'
  | 'adjustment'

export interface PointsEvent {
  id: ID
  userId: ID
  action: PointsAction
  amount: number
  /** Idempotency key: one award per unique source event. */
  sourceKey: string
  sourceLabel: string
  sourceLink?: string
  qualifying: boolean
  createdAt: ISODate
  reason?: string
}

export interface PointsBalance {
  lifetime: number
  redeemable: number
  qualifying: number
}

/* ------------------------------------------------------------------ clinics & events -- */

export type EventType = 'webinar' | 'clinic'
export type EventFormat = 'online' | 'hybrid' | 'in_person'

export interface ClinicEvent {
  id: ID
  slug: string
  title: string
  type: EventType
  format: EventFormat
  facilitatorId: ID
  startsAt: ISODate
  durationMin: number
  timezone: string
  language: string
  principle: PrincipleId
  topic: string
  capacity: number
  image: string
  summary: string
  objectives: string[]
  agenda: { time: string; item: string }[]
  preparation: string
  /** Eligibility: designated course completed and qualifying points reached. */
  prerequisiteCourseId?: ID
  minQualifyingPoints?: number
  attendancePoints: number
  status: 'scheduled' | 'completed' | 'cancelled'
  recordingAvailable?: boolean
  materials: { label: string; resourceId?: ID }[]
  location?: string
}

export type RegistrationStatus = 'registered' | 'waitlisted' | 'cancelled' | 'attended' | 'no_show'

export interface Registration {
  id: ID
  eventId: ID
  userId: ID
  status: RegistrationStatus
  createdAt: ISODate
  feedback?: { rating: number; comment: string }
}

/* ------------------------------------------------------------------ mentorship -- */

export interface MentorProfile {
  userId: ID
  headline: string
  bio: string
  expertise: string[]
  sectors: string[]
  languages: string[]
  principles: PrincipleId[]
  departments: DepartmentId[]
  formats: MentorFormat[]
  sessionMinutes: number
  pointsCost: number
  published: boolean
  pendingApproval?: boolean
  rating: number
  sessionsDelivered: number
  location: string
}

export type SlotStatus = 'open' | 'booked' | 'blocked'

export interface MentorSlot {
  id: ID
  mentorId: ID
  startsAt: ISODate
  durationMin: number
  status: SlotStatus
}

export type BookingStatus = 'booked' | 'completed' | 'cancelled' | 'no_show' | 'cancellation_review'

export interface MentorBooking {
  id: ID
  slotId: ID
  mentorId: ID
  userId: ID
  companyId?: ID
  purpose: string
  actionId?: ID
  sharedContext: string
  status: BookingStatus
  pointsCost: number
  createdAt: ISODate
  cancelledAt?: ID
  followUp?: { nextActions: string[]; resourceIds: ID[]; sharedNote: string }
  privateNote?: string
  feedback?: { rating: number; comment: string }
}

/* ------------------------------------------------------------------ resources -- */

export type ResourceFormat = 'pdf' | 'pptx' | 'docx' | 'xlsx' | 'link' | 'video'
export type ResourceAccess = 'public' | 'member'

export interface Resource {
  id: ID
  slug: string
  title: string
  description: string
  summary: string[]
  publisher: string
  format: ResourceFormat
  language: string
  principle: PrincipleId
  topic: string
  departments: DepartmentId[]
  access: ResourceAccess
  /** Official WEPs material links to its source page; proposed items are labelled. */
  official: boolean
  sourceUrl?: string
  image: string
  version: string
  publishedAt: ISODate
  pages?: number
  featured?: boolean
  relatedCourseIds: ID[]
  relatedEventIds: ID[]
  status: 'published' | 'scheduled' | 'archived' | 'draft'
}

/* ------------------------------------------------------------------ AI concierge -- */

export interface AiSource {
  label: string
  to: string
}

export interface AiAction {
  label: string
  to: string
}

export interface AiScript {
  id: ID
  roles: Role[]
  prompt: string
  /** Paragraphs; generated narrative text is marked as a draft. */
  answer: string[]
  sources: AiSource[]
  actions: AiAction[]
  isDraft?: boolean
  /** Demonstrates an unavailable-data response. */
  unavailable?: boolean
}

export interface ChatMessage {
  id: ID
  from: 'user' | 'ai'
  text: string[]
  sources?: AiSource[]
  actions?: AiAction[]
  isDraft?: boolean
  at: ISODate
}

export interface Conversation {
  id: ID
  userId: ID
  title: string
  messages: ChatMessage[]
  updatedAt: ISODate
  context?: { kind: 'resource' | 'course' | 'report'; id: ID; label: string }
}

/* ------------------------------------------------------------------ certification -- */

/** Draft offerings are hidden from companies; archived ones stop new purchases. */
export type OfferingStatus = 'draft' | 'published' | 'archived'

export interface CertificationOffering {
  id: ID
  slug: string
  title: string
  status: OfferingStatus
  price: number
  currency: 'USD'
  focus: string
  scope: string[]
  /** Kept equal to the number of exam questions. */
  examQuestions: number
  passMark: number
  image?: string
  updatedAt?: ISODate
}

export type PurchaseStatus =
  | 'unpaid'
  | 'checkout_cancelled'
  | 'payment_failed'
  | 'paid'
  | 'exam_in_progress'
  | 'retry_required'
  | 'passed'
  | 'certificate_issued'
  | 'refunded'

export interface CertificationPurchase {
  id: ID
  companyId: ID
  offeringId: ID
  status: PurchaseStatus
  purchasedById?: ID
  paymentRef?: string
  amount: number
  paidAt?: ISODate
  attempts: { at: ISODate; score: number; byId: ID }[]
  examAnswers?: Record<ID, number>
  credentialRef?: string
  issuedAt?: ISODate
  history: { at: ISODate; label: string }[]
}

/* ------------------------------------------------------------------ community -- */

export type CommunitySpace = 'discussions' | 'signatory_circle'
export type ModerationStatus = 'visible' | 'flagged' | 'hidden'

export interface ThreadReply {
  id: ID
  authorId: ID | 'ai'
  body: string
  createdAt: ISODate
  sources?: AiSource[]
  reactions: number
  status: ModerationStatus
}

export interface Thread {
  id: ID
  space: CommunitySpace
  channel: string
  title: string
  body: string
  authorId: ID
  createdAt: ISODate
  replies: ThreadReply[]
  reactions: number
  bookmarkedBy: ID[]
  followedBy: ID[]
  pinned: boolean
  isAnnouncement: boolean
  status: ModerationStatus
  attachment?: string
  tags: string[]
}

export type ListingStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'resubmitted'
  | 'published'
  | 'rejected'
  | 'withdrawn'
  | 'archived'

export interface Listing {
  id: ID
  companyId: ID
  title: string
  type: 'product' | 'service'
  category: string
  description: string
  value: string
  image: string
  region: string
  price?: number
  currency?: string
  quoteNote?: string
  purchaseUrl: string
  documents: string[]
  status: ListingStatus
  submittedById: ID
  reviewerNote?: string
  publicVisible: boolean
  views: number
  outboundClicks: number
  createdAt: ISODate
  publishedAt?: ISODate
  history: { at: ISODate; label: string; note?: string }[]
  /** Material edit to a published listing, pending review. */
  pendingRevision?: Partial<Pick<Listing, 'title' | 'description' | 'price' | 'quoteNote'>>
}

/* ------------------------------------------------------------------ annual reports -- */

export type ReportStatus =
  | 'not_started'
  | 'draft'
  | 'ready_for_approval'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'resubmitted'
  | 'accepted'

export type ReportSectionKey =
  | 'snapshot'
  | 'narrative'
  | 'actions'
  | 'support'
  | 'principles'
  | 'indicators'
  | 'challenges'
  | 'declaration'

export interface ReportIndicator {
  id: ID
  label: string
  principle: PrincipleId
  value: number | null
  unit: string
  coverage: string
  period: string
  evidence?: string
  previousValue?: number | null
}

export interface ReportVersion {
  version: number
  submittedAt: ISODate
  submittedById: ID
  sections: Record<ReportSectionKey, string>
  indicators: ReportIndicator[]
}

export interface AnnualReport {
  id: ID
  companyId: ID
  year: number
  status: ReportStatus
  dueDate: ISODate
  preparerId?: ID
  approverId?: ID
  sections: Record<ReportSectionKey, string>
  sectionComplete: Record<ReportSectionKey, boolean>
  indicators: ReportIndicator[]
  evidence: Evidence[]
  versions: ReportVersion[]
  changeRequests: { at: ISODate; section: ReportSectionKey; note: string; resolved: boolean }[]
  reviewedAt?: ISODate
  publicSummaryApproved: boolean
  updatedAt: ISODate
}

/* ------------------------------------------------------------------ notifications & tasks -- */

export interface Notification {
  id: ID
  userId: ID
  title: string
  body: string
  link?: string
  createdAt: ISODate
  read: boolean
  critical: boolean
  category:
    | 'application'
    | 'team'
    | 'learning'
    | 'clinic'
    | 'mentorship'
    | 'report'
    | 'certification'
    | 'community'
    | 'system'
  /** Simulated email preview for the same event. */
  emailPreview?: { subject: string; to: string; body: string[] }
}

export interface AuditEntry {
  id: ID
  at: ISODate
  actorId: ID
  action: string
  target: string
  detail?: string
}

export interface CommsTemplate {
  id: ID
  name: string
  trigger: string
  audience: string
  channel: 'email' | 'in_app' | 'both'
  subject: string
  active: boolean
  lastSentAt?: ISODate
  sentCount: number
}

export interface PlatformSettings {
  reportingYear: number
  reportingDueDate: ISODate
  qualifyingPointsForClinic: number
  mentorSessionCost: number
  quizPassMark: number
  certificationPassMark: number
  communityDailyCap: number
  actionMonthlyCap: number
  cancellationWindowHours: number
  languages: string[]
  integrations: { name: string; purpose: string; status: 'simulated' | 'not_configured' }[]
  aiSources: { label: string; version: string; active: boolean }[]
}
