import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { NotFound, RouteError } from '@/components/layout/RouteStates'
import { Toaster } from '@/components/ui/sonner'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-navy focus:shadow-lift"
      >
        Skip to content
      </a>
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
    </>
  ),
  notFoundComponent: NotFound,
  errorComponent: RouteError,
})
