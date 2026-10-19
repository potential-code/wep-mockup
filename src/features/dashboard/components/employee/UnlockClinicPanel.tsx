import type { ClinicEvent } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { celebrate } from '@/components/motion/Celebrate'
import { SectionCard } from '@/components/shared/Cards'
import { EligibilityPanel } from '@/features/clinics/components/EligibilityPanel'
import { formatDateTime } from '@/lib/format'
import { type Eligibility, useRegister } from '@/queries/clinics.queries'

export function UnlockClinicPanel({
  eligibility,
  event,
  registered,
}: {
  eligibility: Eligibility
  event?: ClinicEvent
  registered: boolean
}) {
  const register = useRegister()
  const onRegister = () =>
    register.mutate(eligibility.eventId, {
      onSuccess: () => {
        celebrate()
        toast.success('You are registered', {
          description: `${event?.title ?? 'The clinic'} is now on your dashboard.`,
        })
      },
    })
  return (
    <SectionCard
      title="Unlock your next clinic"
      description={
        event ? (
          <>
            <Link
              to="/portal/clinics/$eventId"
              params={{ eventId: event.id }}
              className="font-medium text-blue hover:underline"
            >
              {event.title}
            </Link>{' '}
            · {formatDateTime(event.startsAt)}
          </>
        ) : undefined
      }
      bodyClassName="p-0 sm:p-0"
    >
      <EligibilityPanel
        eligibility={eligibility}
        eventTitle={event?.title}
        registered={registered}
        onRegister={onRegister}
        registering={register.isPending}
        compact
        className="rounded-t-none border-0 border-t shadow-none"
      />
    </SectionCard>
  )
}
