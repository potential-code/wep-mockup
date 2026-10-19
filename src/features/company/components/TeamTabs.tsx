import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useCurrentUser } from '@/hooks/use-session'
import { cn } from '@/lib/utils'

/** Segmented switch between the Team list and the CEO-only Permissions panel. */
export function TeamTabs({ active }: { active: 'team' | 'permissions' }) {
  const { can } = useCurrentUser()
  const items = [
    { id: 'team', label: 'Team', to: '/portal/company/team', show: can('company.manage_team') },
    {
      id: 'permissions',
      label: 'Permissions',
      to: '/portal/company/permissions',
      show: can('company.delegate'),
    },
  ] as const
  const visible = items.filter((i) => i.show)
  if (visible.length < 2) return null
  return (
    <nav aria-label="Team and permissions" className="mb-5 inline-flex rounded-xl bg-secondary p-1">
      {visible.map((i) => (
        <Link
          key={i.id}
          to={i.to}
          aria-current={active === i.id ? 'page' : undefined}
          className={cn(
            'relative rounded-lg px-4 py-1.5 font-medium text-sm transition-colors',
            active === i.id ? 'text-navy' : 'text-muted-foreground hover:text-navy',
          )}
        >
          {active === i.id ? (
            <motion.span
              layoutId="team-seg"
              className="absolute inset-0 rounded-lg bg-card shadow-card"
              transition={{ duration: 0.2 }}
            />
          ) : null}
          <span className="relative">{i.label}</span>
        </Link>
      ))}
    </nav>
  )
}
