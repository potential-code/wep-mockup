import { ROLE_SHORT } from '@shared/reference'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Building2, FileText } from 'lucide-react'
import { CompanyLogo } from '@/components/shared/UserAvatar'
import { useCurrentUser } from '@/hooks/use-session'
import type { ChatEntry } from '../hooks/useConciergeChat'

const DEFAULT_ACTIONS: Record<string, { label: string; to: string }[]> = {
  mentor: [
    { label: 'Open calendar', to: '/expert/calendar' },
    { label: 'Manage availability', to: '/expert/availability' },
  ],
  global_admin: [
    { label: 'Annual reports', to: '/admin/reporting/annual-reports' },
    { label: 'Learning report', to: '/admin/reporting/learning' },
  ],
  default: [
    { label: 'Continue learning', to: '/portal/learn' },
    { label: 'Browse resources', to: '/portal/resources' },
  ],
}

export function ContextPanel({
  messages,
  contextLabel,
}: {
  messages: ChatEntry[]
  contextLabel?: string
}) {
  const { user, company } = useCurrentUser()
  const lastAi = [...messages].reverse().find((m) => m.from === 'ai' && !m.unavailable)
  const sources = lastAi?.sources ?? []
  const actions =
    lastAi?.actions ??
    (user ? (DEFAULT_ACTIONS[user.role] ?? DEFAULT_ACTIONS.default) : DEFAULT_ACTIONS.default) ??
    []
  return (
    <aside aria-label="Conversation context" className="grid content-start gap-5 text-sm">
      <section className="grid gap-2">
        <h2 className="font-heading font-semibold text-navy">Context</h2>
        <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
          {company ? (
            <CompanyLogo name={company.name} src={company.logo} className="size-10" />
          ) : (
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-navy">
              <Building2 className="size-5" aria-hidden />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-navy">{company?.name ?? 'UN Women'}</p>
            <p className="text-muted-foreground text-xs">{user ? ROLE_SHORT[user.role] : ''}</p>
          </div>
        </div>
        {contextLabel ? (
          <p className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-blue-600">
            <FileText className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              Using <strong>{contextLabel}</strong> as context
            </span>
          </p>
        ) : null}
      </section>
      <section className="grid gap-2">
        <h2 className="font-heading font-semibold text-navy">Relevant sources</h2>
        {sources.length === 0 ? (
          <p className="text-muted-foreground">Sources for each answer appear here.</p>
        ) : (
          <ul className="grid gap-1.5">
            {sources.map((s) => (
              <li key={s.to}>
                <Link to={s.to} className="flex items-center gap-2 text-blue hover:underline">
                  <FileText className="size-4 shrink-0" aria-hidden /> {s.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="grid gap-2">
        <h2 className="font-heading font-semibold text-navy">Suggested next actions</h2>
        <ul className="grid gap-1.5">
          {actions.map((a) => (
            <li key={a.to}>
              <Link
                to={a.to}
                className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-navy hover:border-blue"
              >
                {a.label} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
