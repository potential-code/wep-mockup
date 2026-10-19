import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { Lock } from 'lucide-react'
import { LayoutGroup, motion } from 'motion/react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoLabel } from '@/components/shared/Cards'
import { useCurrentUser } from '@/hooks/use-session'
import { cn } from '@/lib/utils'

export function CommunityLayout() {
  const { pathname } = useLocation()
  const { can } = useCurrentUser()
  const circleOk = can('community.signatory_circle')
  const tabs = [
    {
      to: '/portal/community',
      label: 'Discussions',
      active: pathname.replace(/\/$/, '') === '/portal/community',
      locked: false,
    },
    {
      to: '/portal/community/circle',
      label: 'Signatory Circle',
      active: pathname.startsWith('/portal/community/circle'),
      locked: !circleOk,
    },
    {
      to: '/portal/community/marketplace',
      label: 'Products and Services',
      active: pathname.replace(/\/$/, '') === '/portal/community/marketplace',
      locked: false,
    },
  ] as const
  const isSection = tabs.some((t) => t.active)
  return (
    <div className="grid gap-6">
      {isSection ? (
        <>
          <PageHeader
            eyebrow={<DemoLabel>Proposed feature</DemoLabel>}
            title="Community"
            description="Group conversations, a closed circle for signatories and a marketplace of member products and services. There are no private messages."
          />
          <LayoutGroup id="community-tabs">
            <nav
              aria-label="Community sections"
              className="-mt-2 flex gap-1 overflow-x-auto border-b"
            >
              {tabs.map((t) => (
                <Link
                  key={t.to}
                  to={t.to}
                  aria-current={t.active ? 'page' : undefined}
                  className={cn(
                    'relative flex shrink-0 items-center gap-1.5 px-4 py-3 font-medium text-sm transition-colors',
                    t.active ? 'text-navy' : 'text-muted-foreground hover:text-navy',
                  )}
                >
                  {t.locked ? <Lock className="size-3.5" aria-label="Restricted" /> : null}
                  {t.label}
                  {t.active ? (
                    <motion.span
                      layoutId="community-tab"
                      className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-blue"
                    />
                  ) : null}
                </Link>
              ))}
            </nav>
          </LayoutGroup>
        </>
      ) : null}
      <Outlet />
    </div>
  )
}
