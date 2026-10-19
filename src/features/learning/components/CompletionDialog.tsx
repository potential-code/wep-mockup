import { useNavigate } from '@tanstack/react-router'
import { CalendarCheck, PartyPopper } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRegister } from '@/queries/clinics.queries'

/** Celebration when the last lesson of a course is finished. */
export function CompletionDialog({
  open,
  onOpenChange,
  courseTitle,
  clinicId,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  courseTitle: string
  clinicId?: string
}) {
  const navigate = useNavigate()
  const register = useRegister()
  const registerNow = () => {
    if (!clinicId) return
    register.mutate(clinicId, {
      onSuccess: () => {
        toast.success('You are registered. It now appears on your dashboard.')
        onOpenChange(false)
        navigate({ to: '/portal/clinics/$eventId', params: { eventId: clinicId } })
      },
    })
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center sm:max-w-md">
        <DialogHeader className="items-center sm:text-center">
          <span className="mb-2 grid size-14 place-items-center rounded-2xl bg-gold-50 text-gold-700">
            <PartyPopper className="size-7" aria-hidden />
          </span>
          <DialogTitle className="font-heading text-xl text-navy">Course complete</DialogTitle>
          <DialogDescription>
            {clinicId
              ? `You finished “${courseTitle}” and unlocked your clinic. Registration is free and spends no points.`
              : `You finished “${courseTitle}”. Great work: your progress and points are saved.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          {clinicId ? (
            <Button size="lg" onClick={registerNow} disabled={register.isPending}>
              <CalendarCheck aria-hidden />
              {register.isPending ? 'Registering…' : 'Register for the clinic'}
            </Button>
          ) : null}
          <Button
            variant={clinicId ? 'outline' : 'default'}
            size="lg"
            onClick={() => {
              onOpenChange(false)
              navigate({ to: '/portal/learn' })
            }}
          >
            Back to my path
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
