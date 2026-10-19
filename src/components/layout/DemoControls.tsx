import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { FlaskConical, RotateCcw, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { homeFor } from '@/config/nav'
import { useCurrentUser } from '@/hooks/use-session'
import { cn } from '@/lib/utils'
import { DEMO_PERSONAS, useResetDemo, useSignInAs } from '@/queries/session.queries'

/** Discreet demo-mode role switch and Reset Demo (brief §4). Not production impersonation. */
export function DemoControls({ variant = 'topbar' }: { variant?: 'topbar' | 'sidebar' }) {
  const { user } = useCurrentUser()
  const signIn = useSignInAs()
  const reset = useResetDemo()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState(false)

  const switchTo = async (userId: string, label: string) => {
    const u = await signIn.mutateAsync(userId)
    qc.clear()
    toast.success(`Now viewing as ${label}`)
    navigate({ to: homeFor(u) })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant === 'sidebar' ? 'ghost' : 'outline'}
            size="sm"
            className={cn(
              variant === 'sidebar' &&
                'w-full justify-start border border-dashed border-gold/50 text-gold hover:bg-white/10 hover:text-gold',
            )}
          >
            <FlaskConical aria-hidden /> Demo mode
            <span className="sr-only">: switch role or reset</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={variant === 'sidebar' ? 'start' : 'end'}
          side={variant === 'sidebar' ? 'top' : 'bottom'}
          className="w-72"
        >
          <DropdownMenuLabel className="flex items-center gap-2">
            <Users className="size-4" aria-hidden /> View the portal as
          </DropdownMenuLabel>
          {DEMO_PERSONAS.map((p) => (
            <DropdownMenuItem
              key={p.key}
              onSelect={() => switchTo(p.userId, p.label)}
              className="grid gap-0.5 py-2"
              disabled={user?.id === p.userId}
            >
              <span className="font-medium">{p.label}</span>
              <span className="text-muted-foreground text-xs">{p.description}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setConfirm(true)} className="text-danger">
            <RotateCcw aria-hidden /> Reset demo data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Reset the demo?"
        description="All changes made during this demo (applications, bookings, points, reports) will be restored to the starting data."
        confirmLabel="Reset demo"
        pending={reset.isPending}
        onConfirm={async () => {
          await reset.mutateAsync()
          qc.clear()
          setConfirm(false)
          toast.success('Demo data restored')
          if (user) navigate({ to: homeFor(user) })
        }}
      />
    </>
  )
}
