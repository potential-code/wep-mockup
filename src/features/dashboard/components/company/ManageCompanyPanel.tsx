import { Link } from '@tanstack/react-router'
import { Building2, ClipboardCheck, FileBarChart, ShieldCheck, Store, Users } from 'lucide-react'
import { SectionCard } from '@/components/shared/Cards'
import { useCurrentUser } from '@/hooks/use-session'

const TOOLS = [
  { label: 'Team', to: '/portal/company/team', icon: Users, show: 'company.manage_team' },
  {
    label: 'Permissions',
    to: '/portal/company/permissions',
    icon: ShieldCheck,
    show: 'company.delegate',
  },
  { label: 'Assessment', to: '/portal/assessment', icon: ClipboardCheck, show: 'assessment.view' },
  { label: 'Annual reports', to: '/portal/reports', icon: FileBarChart, show: 'reports.view' },
  {
    label: 'Marketplace listings',
    to: '/portal/community/marketplace/mine',
    icon: Store,
    show: 'marketplace.manage',
  },
  {
    label: 'Company details',
    to: '/portal/company/details',
    icon: Building2,
    show: 'company.view_profile',
  },
] as const

/** Operational shortcuts for a CEO who also administers. One account, one company record. */
export function ManageCompanyPanel() {
  const { can } = useCurrentUser()
  return (
    <SectionCard
      title="Manage company"
      description="You hold every administrator right on this single account, so day-to-day tools are here when you need them."
    >
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {TOOLS.filter((t) => can(t.show)).map((t) => (
          <li key={t.label}>
            <Link
              to={t.to}
              className="flex h-full items-center gap-2.5 rounded-xl border p-3 text-sm hover:border-blue hover:bg-blue-50/50"
            >
              <t.icon className="size-4 shrink-0 text-blue" aria-hidden />
              <span className="font-medium text-navy">{t.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
