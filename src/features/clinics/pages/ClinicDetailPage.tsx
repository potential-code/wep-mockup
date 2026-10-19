import { getRouteApi, Link } from '@tanstack/react-router'
import {
  CalendarDays,
  CalendarPlus,
  Clock,
  FileText,
  Globe2,
  MonitorPlay,
  PlayCircle,
  Users,
  Video,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoLabel, SectionCard } from '@/components/shared/Cards'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { downloadText, timeZoneLabel } from '@/lib/format'
import { useCancelRegistration, useEvent, useRegister } from '@/queries/clinics.queries'
import { ClinicStatusBadge } from '../components/ClinicStatusBadge'
import {
  buildIcs,
  clinicDateLabel,
  clinicTimeRange,
  FORMAT_LABEL,
} from '../components/clinic-utils'
import { EligibilityPanel } from '../components/EligibilityPanel'
import { FeedbackForm } from '../components/FeedbackForm'
import { JoinSessionDialog } from '../components/JoinSessionDialog'

const route = getRouteApi('/_app/portal/clinics/$eventId')

export function ClinicDetailPage() {
  const { eventId } = route.useParams()
  const { data, isLoading, isError, refetch } = useEvent(eventId)
  const register = useRegister()
  const cancel = useCancelRegistration()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  if (isLoading) return <PageSkeleton />
  if (isError || !data)
    return (
      <ErrorState
        title="Session not found"
        message="It may have been removed."
        onRetry={() => refetch()}
      />
    )

  const { event: e, status, eligibility, registration, facilitator, materials } = data
  const past = e.status === 'completed'
  const isRegistered = status === 'registered'
  const attended = registration?.status === 'attended'
  const full = status === 'full'

  const doRegister = () =>
    register.mutate(eventId, {
      onSuccess: (r) =>
        toast.success(
          r.status === 'waitlisted'
            ? 'You joined the waitlist'
            : 'Registered. No points were spent. Added to your dashboard.',
        ),
    })

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Clinics', to: '/portal/clinics' }, { label: e.title }]}
        eyebrow={e.type === 'clinic' ? 'Clinic' : 'Webinar'}
        title={e.title}
        description={e.summary}
        actions={<ClinicStatusBadge status={status} />}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grid min-w-0 content-start gap-6">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
            <img src={e.image} alt="" className="aspect-[21/9] w-full object-cover" />
            <dl className="grid gap-3 p-5 text-sm sm:grid-cols-2">
              <Fact icon={CalendarDays} label="Date" value={clinicDateLabel(e.startsAt)} />
              <Fact
                icon={Clock}
                label="Time"
                value={`${clinicTimeRange(e.startsAt, e.durationMin)} (${e.durationMin} min)`}
              />
              <Fact icon={Globe2} label="Your timezone" value={timeZoneLabel()} />
              <Fact
                icon={MonitorPlay}
                label="Format"
                value={`${FORMAT_LABEL[e.format]} · ${e.language}`}
              />
              <Fact
                icon={Users}
                label="Places"
                value={
                  past
                    ? `${data.registered} attended or registered`
                    : `${data.placesLeft} of ${e.capacity} left`
                }
              />
              <div className="flex flex-wrap items-center gap-2">
                <PrincipleTag id={e.principle} />
              </div>
            </dl>
          </div>

          <SectionCard title="What you will do">
            <ul className="grid list-disc gap-1.5 ps-5">
              {e.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Agenda" description={`${e.durationMin} minutes`}>
            <ol className="grid gap-2">
              {e.agenda.map((a) => (
                <li key={a.time + a.item} className="flex gap-3 text-sm">
                  <span className="w-12 shrink-0 font-mono text-blue tabular-nums">{a.time}</span>
                  <span>{a.item}</span>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard title="Your facilitator">
            <div className="flex gap-4">
              <UserAvatar name={facilitator.name} src={facilitator.avatar} className="size-14" />
              <div className="grid gap-1">
                <p className="font-semibold text-navy">{facilitator.name}</p>
                <p className="text-muted-foreground text-sm">
                  {facilitator.headline ?? facilitator.title}
                </p>
                {facilitator.bio ? <p className="mt-1 text-sm">{facilitator.bio}</p> : null}
                {facilitator.expertise.length ? (
                  <p className="mt-1 text-muted-foreground text-xs">
                    Expertise: {facilitator.expertise.join(' · ')}
                  </p>
                ) : null}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Required preparation">
            <p>{e.preparation}</p>
          </SectionCard>

          {past ? (
            <SectionCard title="After the session">
              <div className="grid gap-5">
                <div>
                  <p className="mb-2 font-medium text-navy text-sm">Materials</p>
                  {materials.length ? (
                    <ul className="grid gap-2">
                      {materials.map((m) => (
                        <li key={m.label}>
                          {m.resourceId ? (
                            <Link
                              to="/portal/resources/$resourceId"
                              params={{ resourceId: m.resourceId }}
                              className="inline-flex items-center gap-2 text-blue hover:underline"
                            >
                              <FileText className="size-4" aria-hidden /> {m.label}
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-2">
                              <FileText className="size-4" aria-hidden /> {m.label}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No materials were shared for this session.
                    </p>
                  )}
                </div>
                {e.recordingAvailable && attended ? (
                  <Button
                    variant="outline"
                    className="justify-self-start"
                    onClick={() => toast('Demo recording player would open here')}
                  >
                    <PlayCircle aria-hidden /> Watch recording
                  </Button>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {e.recordingAvailable
                      ? 'The recording is available to people who attended.'
                      : 'No recording is available for this session.'}
                  </p>
                )}
                {attended ? (
                  <div>
                    <p className="mb-2 font-medium text-navy text-sm">Share your feedback</p>
                    <FeedbackForm eventId={eventId} existing={registration?.feedback} />
                  </div>
                ) : null}
              </div>
            </SectionCard>
          ) : null}
        </div>

        <aside className="grid content-start gap-4 lg:sticky lg:top-20 lg:self-start">
          {past ? null : isRegistered || status === 'waitlisted' ? (
            <SectionCard title={isRegistered ? 'You are registered' : 'You are on the waitlist'}>
              <div className="grid gap-3">
                <p className="text-muted-foreground text-sm">
                  {isRegistered
                    ? 'Registering spent no points. Joining details are below.'
                    : 'We will notify you if a place opens. You keep your place in the queue.'}
                </p>
                {isRegistered ? (
                  <>
                    <div className="rounded-xl bg-muted/60 p-3 text-sm">
                      <p className="font-medium text-navy">Joining instructions</p>
                      <p className="text-muted-foreground">
                        {e.location ?? 'Online'}. Use the button below at the start time. Demo
                        session: no real meeting link.
                      </p>
                    </div>
                    <Button onClick={() => setJoinOpen(true)}>
                      <Video aria-hidden /> Join session
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        downloadText(`${e.slug}.ics`, buildIcs(e), 'text/calendar')
                        toast.success('Calendar file downloaded')
                      }}
                    >
                      <CalendarPlus aria-hidden /> Add to calendar
                    </Button>
                  </>
                ) : null}
                <Button
                  variant="ghost"
                  className="text-danger"
                  onClick={() => setConfirmCancel(true)}
                >
                  {isRegistered ? 'Cancel registration' : 'Leave waitlist'}
                </Button>
              </div>
            </SectionCard>
          ) : full ? (
            <SectionCard title="This session is full">
              <div className="grid gap-3">
                <p className="text-muted-foreground text-sm">
                  You are eligible. Join the waitlist and we will tell you if a place opens.
                </p>
                <Button onClick={doRegister} disabled={register.isPending}>
                  {register.isPending ? 'Joining…' : 'Join waitlist'}
                </Button>
              </div>
            </SectionCard>
          ) : (
            <EligibilityPanel
              eligibility={eligibility}
              eventTitle={e.title}
              onRegister={doRegister}
              registering={register.isPending}
            />
          )}

          <SectionCard title="Points">
            <ul className="grid gap-1.5 text-sm">
              <li>+{e.attendancePoints} points for attending</li>
              <li>+10 points for submitting feedback</li>
              <li className="text-muted-foreground">Registration is free and spends no points.</li>
            </ul>
            <DemoLabel className="mt-3">Proposed rules</DemoLabel>
          </SectionCard>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title={isRegistered ? 'Cancel your registration?' : 'Leave the waitlist?'}
        description="Your place will be released for someone else. You can register again if places remain."
        confirmLabel={isRegistered ? 'Cancel registration' : 'Leave waitlist'}
        destructive
        pending={cancel.isPending}
        onConfirm={() =>
          cancel.mutate(eventId, {
            onSuccess: () => {
              setConfirmCancel(false)
              toast.success('Registration cancelled')
            },
          })
        }
      />
      <JoinSessionDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        title={e.title}
        facilitator={facilitator.name}
      />
    </>
  )
}

function Fact({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
      <div>
        <dt className="text-muted-foreground text-xs">{label}</dt>
        <dd className="font-medium text-navy">{value}</dd>
      </div>
    </div>
  )
}
