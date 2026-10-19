import { PRINCIPLES } from '@shared/reference'
import type { ClinicEvent, PrincipleId } from '@shared/types'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { EmptyState, ErrorState } from '@/components/shared/States'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { formatDateTime } from '@/lib/format'
import { useChangeEvent } from '@/queries/admin.queries'
import { useRoster, useUpsertEvent } from '@/queries/clinics.queries'
import { Field, fromIsoLocal, toIsoLocal } from './common'

const NONE = '__none'
const TIMEZONES = [
  'UTC',
  'America/New_York',
  'Europe/London',
  'Africa/Nairobi',
  'Asia/Dubai',
  'Asia/Singapore',
]
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)

export const blankEvent = (): ClinicEvent => ({
  id: '',
  slug: '',
  title: '',
  type: 'clinic',
  format: 'online',
  facilitatorId: '',
  startsAt: '2026-12-02T12:00:00.000Z',
  durationMin: 90,
  timezone: 'UTC',
  language: 'English',
  principle: 1,
  topic: '',
  capacity: 30,
  image: '/images/clinics/inclusive-hiring-webinar.webp',
  summary: '',
  objectives: [],
  agenda: [],
  preparation: '',
  attendancePoints: 75,
  status: 'scheduled',
  materials: [],
})

export function EventForm({
  initial,
  facilitators,
  courses,
  resources,
  onSaved,
}: {
  initial: ClinicEvent
  facilitators: { id: string; name: string }[]
  courses: { id: string; title: string }[]
  resources: { id: string; title: string }[]
  onSaved: () => void
}) {
  const save = useUpsertEvent()
  const [e, setE] = useState(initial)
  const [closesHours, setClosesHours] = useState('24')
  const [touched, setTouched] = useState(false)
  const patch = (p: Partial<ClinicEvent>) => setE((x) => ({ ...x, ...p }))
  const errs = {
    title: !e.title.trim(),
    facilitator: !e.facilitatorId,
    capacity: !(e.capacity > 0),
    topic: !e.topic.trim(),
  }

  const submit = () => {
    setTouched(true)
    if (Object.values(errs).some(Boolean)) {
      toast.error('Complete the required fields first.')
      return
    }
    const id = e.id || `evt-${slugify(e.title)}`
    save.mutate(
      { ...e, id, slug: e.slug || slugify(e.title), summary: e.summary || e.title },
      {
        onSuccess: () => {
          toast.success(initial.id ? 'Event updated' : 'Event scheduled')
          onSaved()
        },
      },
    )
  }

  return (
    <div className="grid gap-4">
      <Field label="Title" required>
        <Input
          value={e.title}
          onChange={(v) => patch({ title: v.target.value })}
          aria-invalid={touched && errs.title}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type">
          <Select value={e.type} onValueChange={(v) => patch({ type: v as ClinicEvent['type'] })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clinic">Clinic</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Format">
          <Select
            value={e.format}
            onValueChange={(v) => patch({ format: v as ClinicEvent['format'] })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="in_person">In person</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Start (UTC)" required>
          <Input
            type="datetime-local"
            value={toIsoLocal(e.startsAt)}
            onChange={(v) => v.target.value && patch({ startsAt: fromIsoLocal(v.target.value) })}
          />
        </Field>
        <Field label="Display time zone">
          <Select value={e.timezone} onValueChange={(v) => patch({ timezone: v })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Duration (minutes)">
          <Input
            type="number"
            min={15}
            step={15}
            value={e.durationMin}
            onChange={(v) => patch({ durationMin: Number(v.target.value) || 60 })}
          />
        </Field>
        <Field label="Capacity" required>
          <Input
            type="number"
            min={1}
            value={e.capacity}
            onChange={(v) => patch({ capacity: Number(v.target.value) })}
            aria-invalid={touched && errs.capacity}
          />
        </Field>
        <Field label="Facilitator" required>
          <Select
            value={e.facilitatorId || NONE}
            onValueChange={(v) => patch({ facilitatorId: v === NONE ? '' : v })}
          >
            <SelectTrigger className="w-full" aria-invalid={touched && errs.facilitator}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Choose a facilitator</SelectItem>
              {facilitators.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Registration closes" hint="Informational in this demo.">
          <Select value={closesHours} onValueChange={setClosesHours}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 hours before</SelectItem>
              <SelectItem value="24">24 hours before</SelectItem>
              <SelectItem value="72">3 days before</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Principle">
          <Select
            value={String(e.principle)}
            onValueChange={(v) => patch({ principle: Number(v) as PrincipleId })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRINCIPLES.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.id}. {p.short}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Topic" required>
          <Input
            value={e.topic}
            onChange={(v) => patch({ topic: v.target.value })}
            aria-invalid={touched && errs.topic}
          />
        </Field>
        <Field label="Prerequisite course">
          <Select
            value={e.prerequisiteCourseId ?? NONE}
            onValueChange={(v) => patch({ prerequisiteCourseId: v === NONE ? undefined : v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>None (open to all)</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Minimum qualifying points">
          <Input
            type="number"
            min={0}
            value={e.minQualifyingPoints ?? 0}
            onChange={(v) => patch({ minQualifyingPoints: Number(v.target.value) || undefined })}
          />
        </Field>
      </div>
      <Field label="Summary">
        <Textarea value={e.summary} onChange={(v) => patch({ summary: v.target.value })} rows={3} />
      </Field>
      <Field label="Preparation for participants">
        <Textarea
          value={e.preparation}
          onChange={(v) => patch({ preparation: v.target.value })}
          rows={2}
        />
      </Field>
      <fieldset className="grid gap-2">
        <legend className="mb-1 font-medium text-navy text-sm">Materials</legend>
        {e.materials.map((m, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: editable rows
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              aria-label={`Material ${i + 1} label`}
              value={m.label}
              placeholder="Label"
              onChange={(v) =>
                patch({
                  materials: e.materials.map((x, j) =>
                    j === i ? { ...x, label: v.target.value } : x,
                  ),
                })
              }
            />
            <Select
              value={m.resourceId ?? NONE}
              onValueChange={(v) =>
                patch({
                  materials: e.materials.map((x, j) =>
                    j === i ? { ...x, resourceId: v === NONE ? undefined : v } : x,
                  ),
                })
              }
            >
              <SelectTrigger className="w-full" aria-label={`Material ${i + 1} resource`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No linked resource</SelectItem>
                {resources.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove material ${i + 1}`}
              onClick={() => patch({ materials: e.materials.filter((_, j) => j !== i) })}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="justify-self-start"
          onClick={() => patch({ materials: [...e.materials, { label: '' }] })}
        >
          <Plus aria-hidden /> Add material
        </Button>
      </fieldset>
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button disabled={save.isPending} onClick={submit}>
          {save.isPending ? 'Saving…' : initial.id ? 'Save changes' : 'Schedule event'}
        </Button>
      </div>
    </div>
  )
}

export function Attendance({ eventId }: { eventId: string }) {
  const { data, isLoading, error, refetch } = useRoster(eventId)
  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  const p = data?.participants ?? []
  if (p.length === 0)
    return (
      <EmptyState
        title="No registrations yet"
        description="Registered participants and their preparation status appear here."
      />
    )
  const count = (s: string) => p.filter((x) => x.registration.status === s).length
  return (
    <div className="grid gap-3">
      <p className="text-muted-foreground text-sm">
        {count('registered')} registered · {count('waitlisted')} waitlisted · {count('attended')}{' '}
        attended · {count('no_show')} no-show
      </p>
      <ul className="grid gap-2">
        {p.map((x) => (
          <li
            key={x.registration.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card p-3 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-navy">{x.name}</p>
              <p className="truncate text-muted-foreground text-xs">
                {x.company ?? 'Independent'} ·{' '}
                {x.prepared ? 'Course complete' : 'Course not complete'}
              </p>
            </div>
            <WorkflowStatus status={x.registration.status} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ChangeTime({ event, onDone }: { event: ClinicEvent; onDone: () => void }) {
  const change = useChangeEvent()
  const [startsAt, setStartsAt] = useState(event.startsAt)
  const [message, setMessage] = useState('')
  const cancelled = event.status === 'cancelled'
  const run = (cancel: boolean) =>
    change.mutate(
      { eventId: event.id, startsAt: cancel ? undefined : startsAt, cancel, message },
      {
        onSuccess: (r) => {
          toast.success(
            `${cancel ? 'Event cancelled' : 'Time updated'}. ${r.notified} participants notified.`,
          )
          setMessage('')
          onDone()
        },
      },
    )
  if (cancelled)
    return (
      <p className="text-muted-foreground text-sm">
        This event is cancelled. Participants were notified.
      </p>
    )
  return (
    <div className="grid gap-4">
      <p className="text-muted-foreground text-sm">
        Currently {formatDateTime(event.startsAt)}. Registered and waitlisted participants receive
        an in-platform notice and a simulated email.
      </p>
      <Field label="New start (UTC)">
        <Input
          type="datetime-local"
          value={toIsoLocal(startsAt)}
          onChange={(v) => v.target.value && setStartsAt(fromIsoLocal(v.target.value))}
        />
      </Field>
      <Field label="Message to participants" required>
        <Textarea
          value={message}
          onChange={(v) => setMessage(v.target.value)}
          rows={3}
          placeholder="Explain what changed and what participants should do."
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={change.isPending || startsAt === event.startsAt || !message.trim()}
          onClick={() => run(false)}
        >
          Change time and notify
        </Button>
        <Button
          variant="outline"
          className="text-danger"
          disabled={change.isPending || !message.trim()}
          onClick={() => run(true)}
        >
          Cancel event and notify
        </Button>
      </div>
    </div>
  )
}
