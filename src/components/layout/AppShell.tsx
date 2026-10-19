import type { Capability } from '@shared/permissions'
import { isActiveCompanyMember } from '@shared/permissions'
import { ROLE_SHORT } from '@shared/reference'
import { Link, Outlet, useLocation, useMatches, useNavigate } from '@tanstack/react-router'
import { ChevronDown, Hourglass } from 'lucide-react'
import { motion } from 'motion/react'
import { AppTopBar } from '@/components/layout/AppTopBar'
import { DemoControls } from '@/components/layout/DemoControls'
import { PageTransition } from '@/components/motion/PageTransition'
import { CornerArcs, DotGrid, ForAllBars } from '@/components/shared/BrandMotif'
import { WepsLogo } from '@/components/shared/Logo'
import { AccessNotice, PageSkeleton } from '@/components/shared/States'
import { CompanyLogo } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
import { buildNav, homeFor, type NavItem } from '@/config/nav'
import { ConciergeLauncher } from '@/features/concierge/components/ConciergeLauncher'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
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
  const { pathname, search } = useLocation()
  const keptSearch = (keys?: readonly string[]) =>
    keys
      ? Object.fromEntries(
          Object.entries(search as Record<string, unknown>).filter(([k]) => keys.includes(k)),
        )
      : undefined
  const { setOpenMobile } = useSidebar()
  const reduced = usePrefersReducedMotion()
  if (!user) return null
  const groups = buildNav(user, company)
  return (
    <Sidebar collapsible="offcanvas" className="border-none">
      <SidebarMotifs />
      <SidebarHeader className="relative px-4 pt-5 pb-3">
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
      <SidebarContent className="relative gap-0 px-1 [scrollbar-color:rgb(255_255_255/0.2)_transparent]">
        {groups.map((g, i) => {
          const isActive = (item: NavItem) =>
            item.exact
              ? pathname === item.to || pathname === `${item.to}/`
              : pathname === item.to || pathname.startsWith(`${item.to}/`)
          const menu = (
            <SidebarMenu>
              {g.items.map((item) => (
                <SidebarMenuItem key={item.to}>
                  {isActive(item) ? (
                    <motion.span
                      layoutId="sidebar-active"
                      aria-hidden
                      transition={
                        reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }
                      }
                      className="pointer-events-none absolute inset-0 rounded-md bg-[linear-gradient(90deg,rgb(214_164_74/0.22),rgb(255_255_255/0.08)_45%,rgb(255_255_255/0.04))] shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_6px_16px_-8px_rgb(0_0_0/0.5)] ring-1 ring-white/10"
                    >
                      <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-gold shadow-[0_0_10px_var(--gold)]" />
                    </motion.span>
                  ) : null}
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item)}
                    className="group/nav relative h-9 text-white/75 transition-[background-color,color,width,height,padding] duration-200 hover:bg-white/[0.07] hover:text-white data-[active=true]:bg-transparent data-[active=true]:font-semibold data-[active=true]:text-white [&>span]:transition-transform [&>span]:duration-300 [&>svg]:transition-[transform,color] [&>svg]:duration-300 hover:[&>span]:translate-x-0.5 hover:[&>svg]:translate-x-0.5 hover:[&>svg]:scale-110 hover:[&>svg]:text-gold data-[active=true]:[&>svg]:text-gold motion-reduce:hover:[&>span]:translate-x-0 motion-reduce:hover:[&>svg]:transform-none"
                  >
                    <Link
                      to={item.to}
                      search={keptSearch(item.keepSearch)}
                      onClick={() => setOpenMobile(false)}
                    >
                      <item.icon aria-hidden />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )
          return (
            <SidebarGroup key={g.section ?? g.label ?? i} className={g.section ? '' : 'py-1'}>
              {g.section ? (
                <SidebarGroupLabel className="text-[11px] text-gold uppercase tracking-[0.12em]">
                  {g.section}
                </SidebarGroupLabel>
              ) : null}
              {g.collapsible ? (
                <Collapsible
                  defaultOpen={g.defaultOpen || g.items.some(isActive)}
                  className="group/collapsible"
                >
                  <CollapsibleTrigger className="flex h-8 w-full items-center gap-2 rounded-md px-2 font-medium text-white/60 text-xs uppercase tracking-[0.08em] hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-gold">
                    <span className="flex-1 text-left">{g.label}</span>
                    <span className="rounded-full bg-white/10 px-1.5 text-[10px] text-white/70 tabular-nums">
                      {g.items.length}
                    </span>
                    <ChevronDown
                      className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-180"
                      aria-hidden
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <SidebarGroupContent>{menu}</SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <>
                  {g.label ? (
                    <SidebarGroupLabel className="text-[11px] text-gold uppercase tracking-[0.12em]">
                      {g.label}
                    </SidebarGroupLabel>
                  ) : null}
                  <SidebarGroupContent>{menu}</SidebarGroupContent>
                </>
              )}
            </SidebarGroup>
          )
        })}
      </SidebarContent>
      <SidebarFooter className="relative gap-3 p-3">
        {company ? (
          <Link
            to="/portal/company"
            onClick={() => setOpenMobile(false)}
            className="flex items-center gap-3 rounded-xl bg-white/8 p-2.5 ring-1 ring-white/10 backdrop-blur-sm transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-white/12 motion-reduce:hover:translate-y-0"
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

/** Brand line-work behind the sidebar. Kept faint so labels stay readable. */
function SidebarMotifs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_40%_at_100%_0%,rgb(22_124_179/0.28),transparent_60%),radial-gradient(90%_35%_at_0%_100%,rgb(214_164_74/0.12),transparent_70%),linear-gradient(180deg,var(--navy)_0%,var(--navy-900)_100%)]" />
      <ForAllBars size={170} className="-right-20 bottom-[22%] opacity-50" />
      <DotGrid cols={5} rows={3} className="top-3 right-2 opacity-30" />
      <CornerArcs corner="bl" size={240} className="opacity-60" />
    </div>
  )
}
