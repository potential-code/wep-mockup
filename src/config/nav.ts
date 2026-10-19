// Role-based navigation (brief §4). Items are filtered by capability so menus only show what a
// role can open; route guards still protect direct URLs.

import { type Capability, can } from '@shared/permissions'
import type { Company, User } from '@shared/types'
import {
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  FileText,
  FolderOpen,
  Gauge,
  GraduationCap,
  HandCoins,
  History,
  LayoutDashboard,
  type LucideIcon,
  Mail,
  MessagesSquare,
  Presentation,
  Settings2,
  ShieldCheck,
  Sparkles,
  Store,
  Trophy,
  UserCog,
  Users,
  UsersRound,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  capability?: Capability
  /** Exact match for active state (dashboards). */
  exact?: boolean
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

const company: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', to: '/portal', icon: LayoutDashboard, exact: true },
      {
        label: 'Company Profile and Team',
        to: '/portal/company',
        icon: Building2,
        capability: 'company.view_profile',
      },
      {
        label: 'Assessment',
        to: '/portal/assessment',
        icon: ClipboardCheck,
        capability: 'assessment.view',
      },
      {
        label: 'Action Plan',
        to: '/portal/action-plan',
        icon: ClipboardList,
        capability: 'actions.view_assigned',
      },
    ],
  },
  {
    label: 'Learn and grow',
    items: [
      { label: 'Learn', to: '/portal/learn', icon: GraduationCap, capability: 'learn.use' },
      {
        label: 'Resources',
        to: '/portal/resources',
        icon: FolderOpen,
        capability: 'resources.use',
      },
      { label: 'Clinics', to: '/portal/clinics', icon: Presentation, capability: 'clinics.use' },
      {
        label: 'Mentorship',
        to: '/portal/mentorship',
        icon: UsersRound,
        capability: 'mentorship.book',
      },
      { label: 'AI Concierge', to: '/portal/concierge', icon: Bot, capability: 'concierge.use' },
    ],
  },
  {
    label: 'Engage and report',
    items: [
      {
        label: 'Certification',
        to: '/portal/certification',
        icon: Award,
        capability: 'certification.view',
      },
      {
        label: 'Community',
        to: '/portal/community',
        icon: MessagesSquare,
        capability: 'community.discussions',
      },
      {
        label: 'Annual Reports',
        to: '/portal/reports',
        icon: FileText,
        capability: 'reports.view',
      },
      {
        label: 'Points and Rewards',
        to: '/portal/points',
        icon: Trophy,
        capability: 'points.view',
      },
    ],
  },
]

const expert: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', to: '/expert', icon: LayoutDashboard, exact: true },
      { label: 'Calendar', to: '/expert/calendar', icon: CalendarDays },
      { label: 'Availability', to: '/expert/availability', icon: CalendarClock },
      { label: 'Expert profile', to: '/expert/profile', icon: UserCog },
    ],
  },
  {
    label: 'Shared',
    items: [
      { label: 'Community', to: '/portal/community', icon: MessagesSquare },
      { label: 'Resources', to: '/portal/resources', icon: FolderOpen },
      { label: 'AI Concierge', to: '/portal/concierge', icon: Bot },
    ],
  },
]

const admin: NavGroup[] = [
  {
    label: 'Reporting',
    items: [
      { label: 'Executive Dashboard', to: '/admin/reporting', icon: Gauge, exact: true },
      { label: 'Analytics', to: '/admin/reporting/analytics', icon: BarChart3 },
      { label: 'Companies', to: '/admin/reporting/companies', icon: Building2 },
      { label: 'Signatories', to: '/admin/reporting/signatories', icon: ShieldCheck },
      { label: 'All Users', to: '/admin/reporting/users', icon: Users },
      { label: 'Learning and Clinics', to: '/admin/reporting/learning', icon: GraduationCap },
      { label: 'Mentorship', to: '/admin/reporting/mentorship', icon: UsersRound },
      {
        label: 'Assessments and Actions',
        to: '/admin/reporting/assessments',
        icon: ClipboardCheck,
      },
      { label: 'Annual Reports', to: '/admin/reporting/annual-reports', icon: FileText },
      {
        label: 'Community and Marketplace',
        to: '/admin/reporting/community',
        icon: MessagesSquare,
      },
      {
        label: 'Certification and Payments',
        to: '/admin/reporting/certification',
        icon: HandCoins,
      },
      { label: 'Report Builder', to: '/admin/reporting/report-builder', icon: FileBarChart },
    ],
  },
  {
    label: 'Platform Management',
    items: [
      {
        label: 'Applications and Approvals',
        to: '/admin/manage/applications',
        icon: ClipboardList,
      },
      { label: 'Companies and Access', to: '/admin/manage/companies', icon: Building2 },
      { label: 'Users and Invitations', to: '/admin/manage/users', icon: Users },
      { label: 'Courses and Learning Paths', to: '/admin/manage/courses', icon: BookOpen },
      { label: 'Resources', to: '/admin/manage/resources', icon: FolderOpen },
      { label: 'Clinics and Events', to: '/admin/manage/events', icon: Presentation },
      { label: 'Mentorship', to: '/admin/manage/mentorship', icon: UsersRound },
      {
        label: 'Assessments and Action Plans',
        to: '/admin/manage/assessments',
        icon: ClipboardCheck,
      },
      { label: 'Annual Reporting', to: '/admin/manage/reporting', icon: FileText },
      { label: 'Certifications and Payments', to: '/admin/manage/certifications', icon: Award },
      { label: 'Community and Marketplace', to: '/admin/manage/community', icon: Store },
      { label: 'Gamification', to: '/admin/manage/gamification', icon: Trophy },
      { label: 'Communications', to: '/admin/manage/communications', icon: Mail },
      { label: 'AI Knowledge and Settings', to: '/admin/manage/ai', icon: Sparkles },
      { label: 'Brand and General Settings', to: '/admin/manage/settings', icon: Settings2 },
      { label: 'Activity and Audit', to: '/admin/manage/audit', icon: History },
    ],
  },
]

export function buildNav(user: User, co?: Company): NavGroup[] {
  const groups = user.role === 'global_admin' ? admin : user.role === 'mentor' ? expert : company
  return groups
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => !i.capability || can(user, i.capability, co)),
    }))
    .filter((g) => g.items.length > 0)
}

export const homeFor = (user: User) =>
  user.role === 'global_admin' ? '/admin/reporting' : user.role === 'mentor' ? '/expert' : '/portal'
