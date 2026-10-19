import type { Capability } from '@shared/permissions'
import { isActiveCompanyMember } from '@shared/permissions'
import { ROLE_SHORT } from '@shared/reference'
import { Link, Outlet, useLocation, useMatches, useNavigate } from '@tanstack/react-router'
import { Hourglass } from 'lucide-react'
import { AppTopBar } from '@/components/layout/AppTopBar'
import { DemoControls } from '@/components/layout/DemoControls'
import { PageTransition } from '@/components/motion/PageTransition'
import { WepsLogo } from '@/components/shared/Logo'
import { AccessNotice, PageSkeleton } from '@/components/shared/States'
import { CompanyLogo } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar'
import { buildNav, homeFor } from '@/config/nav'
import { ConciergeLauncher } from '@/features/concierge/components/ConciergeLauncher'
import { useCurrentUser } from '@/hooks/use-session'

export function AppShell() {
  const { user, company, isLoading } = useCurrentUser()
  if (isLoading || !user) {
    return (
      <div className="p-8">
        <PageSkeleton />
      </div>
    )
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 bg-surface">
        <AppTopBar />
        <main
          id="main"
          className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          <Guard>
            <Outlet />
          </Guard>
        </main>
        <footer className="mx-auto w-full max-w-[1400px] px-4 pb-6 text-muted-foreground text-xs sm:px-6 lg:px-8">
          WEPs portal mockup · {company?.name ?? ROLE_SHORT[user.role]} · Proposed features and
          illustrative demo data.
        </footer>
        <ConciergeLauncher />
      </SidebarInset>
    </SidebarProvider>
  )
}

/** Route guard: shows an access message for direct visits to unauthorised routes. */
function Guard({ children }: { children: React.ReactNode }) {
  const { user, company, can } = useCurrentUser()
  const matches = useMatches()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  if (!user) return null

  const isCompanyRole =
    user.role === 'ceo' || user.role === 'company_admin' || user.role === 'employee'
  if (
    isCompanyRole &&
    !isActiveCompanyMember(user, company) &&
    !pathname.startsWith('/portal/notifications')
  ) {
    return (
      <AccessNotice
        title="Your company portal opens after approval"
        message={`${company?.name ?? 'Your company'}’s application is ${company?.signatoryStatus?.replace(/_/g, ' ') ?? 'pending'}. You can follow its progress and respond to requests on the status page.`}
        action={
          <Button asChild>
            <Link to="/application-status">
              <Hourglass aria-hidden /> View application status
            </Link>
          </Button>
        }
      />
    )
  }

  const cap = [...matches]
    .reverse()
    .find((m) => (m.staticData as { capability?: Capability })?.capability)?.staticData.capability
  const area = pathname.split('/')[1]
  const wrongArea =
    (area === 'admin' && user.role !== 'global_admin') ||
    (area === 'expert' && user.role !== 'mentor') ||
    (area === 'portal' &&
      pathname === '/portal' &&
      (user.role === 'global_admin' || user.role === 'mentor'))
  if (wrongArea || (cap && !can(cap))) {
    return (
      <AccessNotice
        title="You don’t have access to this page"
        message="This area isn’t available for your role or permissions. If you think you need access, ask your company CEO or WEPs focal point."
        action={
          <Button onClick={() => navigate({ to: homeFor(user) })}>Back to my dashboard</Button>
        }
      />
    )
  }
  return <PageTransition id={pathname}>{children}</PageTransition>
}

function AppSidebar() {
  const { user, company } = useCurrentUser()
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()
  if (!user) return null
  const groups = buildNav(user, company)
  return (
    <Sidebar collapsible="offcanvas" className="border-none">
      <SidebarHeader className="px-4 pt-5 pb-3">
        <Link
          to={homeFor(user)}
          className="block rounded-md focus-visible:outline-gold"
          onClick={() => setOpenMobile(false)}
        >
          <WepsLogo className="h-auto w-full max-w-[200px]" />
        </Link>
        <p className="mt-2 font-medium text-[11px] text-white/50 uppercase tracking-[0.14em]">
          {user.role === 'global_admin'
            ? 'UN Women workspace'
            : user.role === 'mentor'
              ? 'Expert workspace'
              : 'Company portal'}
        </p>
      </SidebarHeader>
      <SidebarContent className="gap-0 px-1 [scrollbar-color:rgb(255_255_255/0.2)_transparent]">
        {groups.map((g, i) => (
          <SidebarGroup key={g.label ?? i}>
            {g.label ? (
              <SidebarGroupLabel className="text-[11px] text-gold uppercase tracking-[0.12em]">
                {g.label}
              </SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const active = item.exact
                    ? pathname === item.to || pathname === `${item.to}/`
                    : pathname === item.to || pathname.startsWith(`${item.to}/`)
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className="h-9 text-white/80 hover:bg-white/10 hover:text-white data-[active=true]:bg-white/12 data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:shadow-[inset_3px_0_0_var(--gold)]"
                      >
                        <Link to={item.to} onClick={() => setOpenMobile(false)}>
                          <item.icon aria-hidden />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="gap-3 p-3">
        {company ? (
          <Link
            to="/portal/company"
            onClick={() => setOpenMobile(false)}
            className="flex items-center gap-3 rounded-xl bg-white/8 p-2.5 transition-colors hover:bg-white/12"
          >
            <CompanyLogo name={company.name} src={company.logo} className="size-9 rounded-lg" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-sm text-white">{company.name}</p>
              <p className="truncate text-white/60 text-xs">
                {company.signatoryStatus === 'approved'
                  ? 'WEPs signatory'
                  : 'Application in progress'}
              </p>
            </div>
          </Link>
        ) : null}
        <DemoControls variant="sidebar" />
      </SidebarFooter>
    </Sidebar>
  )
}
