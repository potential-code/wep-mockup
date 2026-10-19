import { departmentLabel } from '@shared/reference'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, UserX } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/shared/States'
import { StatusBadge, WorkflowStatus } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { dayLong, timeIn, tzAbbrev } from '@/features/mentorship/lib/time'
import { useMarkAttendance, useRoster } from '@/queries/clinics.queries'
import { useSendClinicFollowUp } from '@/queries/mentorship.queries'
import { JoinSessionDialog } from './JoinSessionDialog'
import { ResourcePicker } from './ResourcePicker'

export function ClinicSession({ id }: { id: string }) {
  const roster = useRoster(id)
  const mark = useMarkAttendance()
  const send = useSendClinicFollowUp()
  const [joinOpen, setJoinOpen] = useState(false)
  const [note, setNote] = useState('')
  const [resourceIds, setResourceIds] = useState<string[]>([])

  if (roster.isLoading) return <PageSkeleton />
  if (roster.isError || !roster.data)
    return (
      <ErrorState
        title="Session not found"
        message={roster.error?.message}
        onRetry={() => roster.refetch()}
      />
    )
  const { event, participants } = roster.data
  const prepared = participants.filter((p) => p.prepared).length

  const markOne = async (userId: string, attended: boolean, name: string) => {
    await mark.mutateAsync({ eventId: id, userId, attended })
    toast.success(attended ? `${name} marked as attended.` : `${name} marked as no show.`)
  }
  const sendFollowUp = async () => {
    const res = await send.mutateAsync({ eventId: id, note: note.trim(), resourceIds })
    toast.success(`Follow-up sent to ${res.sent} attendee${res.sent === 1 ? '' : 's'}.`)
    setNote('')
  }

  return (
    <div>
      <PageHeader
        title={event.title}
        description={`${dayLong(event.startsAt, event.timezone)}, ${timeIn(event.startsAt, event.timezone)} ${tzAbbrev(event.timezone, event.startsAt)} · ${event.durationMin} minutes`}
        breadcrumbs={[{ label: 'Calendar', to: '/expert/calendar' }, { label: 'Group session' }]}
        actions={
          event.status === 'scheduled' ? (
            <Button onClick={() => setJoinOpen(true)}>Join session</Button>
          ) : (
            <WorkflowStatus status={event.status} />
          )
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard
          title="Roster"
          description={`${participants.length} registered · ${prepared} prepared (designated course complete)`}
        >
          {participants.length === 0 ? (
            <EmptyState title="Nobody has registered yet" />
          ) : (
            <ul className="divide-y">
              {participants.map((p) => {
                const st = p.registration.status
                return (
                  <li key={p.registration.id} className="flex flex-wrap items-center gap-3 py-3">
                    <UserAvatar name={p.name} src={p.avatar} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-navy">{p.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {[p.company, p.department ? departmentLabel(p.department) : '']
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <StatusBadge tone={p.prepared ? 'success' : 'warning'}>
                      {p.prepared ? 'Prepared' : 'Course not finished'}
                    </StatusBadge>
                    {st === 'attended' || st === 'no_show' ? (
                      <WorkflowStatus status={st} />
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={mark.isPending}
                          onClick={() => markOne(p.registration.userId, true, p.name)}
                        >
                          <CheckCircle2 aria-hidden /> Attended
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={mark.isPending}
                          onClick={() => markOne(p.registration.userId, false, p.name)}
                        >
                          <UserX aria-hidden /> No show
                        </Button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>

        <div className="grid content-start gap-6">
          <SectionCard title="Materials">
            <ul className="grid gap-1.5 text-sm">
              {event.materials.map((m) => (
                <li key={m.label}>
                  {m.resourceId ? (
                    <Link
                      to="/portal/resources/$resourceId"
                      params={{ resourceId: m.resourceId }}
                      className="text-blue hover:underline"
                    >
                      {m.label}
                    </Link>
                  ) : (
                    m.label
                  )}
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title="Follow-up" description="Sent to everyone marked as attended.">
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                sendFollowUp()
              }}
            >
              <div className="grid gap-1.5">
                <Label htmlFor="clinic-note">Message to attendees</Label>
                <Textarea
                  id="clinic-note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Approved materials</Label>
                <ResourcePicker value={resourceIds} onChange={setResourceIds} />
              </div>
              <Button
                type="submit"
                className="justify-self-start"
                disabled={send.isPending || note.trim().length < 5}
              >
                {send.isPending ? 'Sending…' : 'Send follow-up'}
              </Button>
            </form>
          </SectionCard>
        </div>
      </div>
      <JoinSessionDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        title={event.title}
        who={`${participants.length} participants`}
        sessionId={id}
      />
    </div>
  )
}
