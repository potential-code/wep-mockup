import { Link } from '@tanstack/react-router'
import { Building2, EyeOff, Link2, Lock, ShieldCheck, Video } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { dayLong, timeIn, tzAbbrev } from '@/features/mentorship/lib/time'
import { useCompleteSession, useExpertBooking } from '@/queries/mentorship.queries'
import { JoinSessionDialog } from './JoinSessionDialog'
import { ResourcePicker } from './ResourcePicker'

export function BookingSession({ id }: { id: string }) {
  const q = useExpertBooking(id)
  const complete = useCompleteSession()
  const [joinOpen, setJoinOpen] = useState(false)
  const [attended, setAttended] = useState<'yes' | 'no'>('yes')
  const [actionsText, setActionsText] = useState('')
  const [resourceIds, setResourceIds] = useState<string[]>([])
  const [sharedNote, setSharedNote] = useState('')
  const [privateNote, setPrivateNote] = useState('')

  if (q.isLoading) return <PageSkeleton />
  if (q.isError || !q.data)
    return (
      <ErrorState
        title="Booking not found"
        message={q.error?.message}
        onRetry={() => q.refetch()}
      />
    )
  const d = q.data
  const b = d.booking
  const done = b.status === 'completed' || b.status === 'no_show'
  const canRecord = b.status === 'booked'

  const submit = async () => {
    await complete.mutateAsync({
      id,
      attended: attended === 'yes',
      nextActions: actionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      sharedNote: sharedNote.trim(),
      privateNote: privateNote.trim(),
      resourceIds,
    })
    toast.success('Session recorded. The participant can now see your shared follow-up.')
  }

  return (
    <div>
      <PageHeader
        title="One-to-one session"
        description={b.purpose}
        breadcrumbs={[{ label: 'Calendar', to: '/expert/calendar' }, { label: 'Session' }]}
        actions={
          canRecord ? (
            <Button onClick={() => setJoinOpen(true)}>
              <Video aria-hidden /> Join session
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid content-start gap-6">
          <SectionCard title="Session">
            <div className="flex items-center gap-3">
              <UserAvatar name={d.menteeName} src={d.menteeAvatar} className="size-12" />
              <div>
                <p className="font-semibold text-navy">{d.menteeName}</p>
                {d.companyName ? (
                  <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <Building2 className="size-4" aria-hidden /> {d.companyName}
                  </p>
                ) : null}
              </div>
              <span className="ms-auto">
                <WorkflowStatus status={b.status} />
              </span>
            </div>
            <p className="mt-4 text-sm">
              <strong className="text-navy">{dayLong(d.startsAt, d.timezone)}</strong>
              <br />
              {timeIn(d.startsAt, d.timezone)} {tzAbbrev(d.timezone, d.startsAt)} · {d.durationMin}{' '}
              minutes
            </p>
          </SectionCard>
          <SectionCard
            title="Shared with you"
            description="Only what the participant chose to share is shown."
          >
            <p className="flex items-start gap-2 text-sm">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              {b.sharedContext}
            </p>
            {d.actionTitle ? (
              <p className="mt-3 flex items-start gap-2 text-sm">
                <Link2 className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
                Goal linked to company action: <strong>{d.actionTitle}</strong>
              </p>
            ) : null}
          </SectionCard>
        </div>

        <SectionCard
          title="After the session"
          description={done ? 'Recorded follow-up.' : 'Record attendance and agree next steps.'}
        >
          {done ? (
            <div className="grid gap-4 text-sm">
              {b.followUp ? (
                <>
                  <div>
                    <h3 className="font-semibold text-navy">Shared note</h3>
                    <p>{b.followUp.sharedNote || 'None'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">Agreed follow-up</h3>
                    <ul className="list-disc ps-5">
                      {b.followUp.nextActions.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p>Recorded as {b.status.replace('_', ' ')}.</p>
              )}
              {b.privateNote ? (
                <div className="rounded-lg bg-muted p-3">
                  <h3 className="flex items-center gap-1.5 font-semibold text-navy">
                    <Lock className="size-4" aria-hidden /> Private note (only you)
                  </h3>
                  <p>{b.privateNote}</p>
                </div>
              ) : null}
              <Button asChild variant="outline" className="justify-self-start">
                <Link to="/expert/calendar">Back to calendar</Link>
              </Button>
            </div>
          ) : !canRecord ? (
            <p className="text-muted-foreground text-sm">
              This booking is {b.status.replace('_', ' ')}, so there is nothing to record.
            </p>
          ) : (
            <form
              className="grid gap-5"
              onSubmit={(e) => {
                e.preventDefault()
                submit()
              }}
            >
              <fieldset>
                <legend className="mb-2 font-medium text-sm">Attendance</legend>
                <RadioGroup
                  value={attended}
                  onValueChange={(v) => setAttended(v as 'yes' | 'no')}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="att-yes" value="yes" />
                    <Label htmlFor="att-yes">Attended</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="att-no" value="no" />
                    <Label htmlFor="att-no">No show</Label>
                  </div>
                </RadioGroup>
              </fieldset>
              {attended === 'yes' ? (
                <>
                  <div className="grid gap-1.5">
                    <Label htmlFor="next-actions">Agreed follow-up (one per line)</Label>
                    <Textarea
                      id="next-actions"
                      rows={3}
                      value={actionsText}
                      onChange={(e) => setActionsText(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Approved materials to share</Label>
                    <ResourcePicker value={resourceIds} onChange={setResourceIds} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="shared-note">Shared note (visible to the participant)</Label>
                    <Textarea
                      id="shared-note"
                      rows={3}
                      value={sharedNote}
                      onChange={(e) => setSharedNote(e.target.value)}
                    />
                  </div>
                </>
              ) : null}
              <div className="grid gap-1.5 rounded-lg border border-dashed p-3">
                <Label htmlFor="private-note" className="flex items-center gap-1.5">
                  <EyeOff className="size-4" aria-hidden /> Private note (only you can see this)
                </Label>
                <Textarea
                  id="private-note"
                  rows={2}
                  value={privateNote}
                  onChange={(e) => setPrivateNote(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={
                  complete.isPending || (attended === 'yes' && sharedNote.trim().length === 0)
                }
                className="justify-self-start"
              >
                {complete.isPending ? 'Saving…' : 'Complete session'}
              </Button>
            </form>
          )}
        </SectionCard>
      </div>
      <JoinSessionDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        title="One-to-one session"
        who={`${d.menteeName}${d.companyName ? `, ${d.companyName}` : ''}`}
        sessionId={id}
        sharedContext={b.sharedContext}
      />
    </div>
  )
}
