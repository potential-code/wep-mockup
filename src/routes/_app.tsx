import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/AppShell'
import { qk } from '@/queries/keys'
import { getSession } from '@/services/auth.service'

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData({
      queryKey: qk('session'),
      queryFn: getSession,
    })
    if (!session) throw redirect({ to: '/sign-in', search: { redirect: location.href } })
    return { session }
  },
  component: AppShell,
})
