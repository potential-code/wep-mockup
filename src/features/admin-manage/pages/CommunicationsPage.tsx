import type { CommsTemplate } from '@shared/types'
import { Mail, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { type Column, DataTable } from '@/components/shared/DataTable'
import { ErrorState } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate, formatDateTime } from '@/lib/format'
import {
  useComms,
  useNotificationHistory,
  useSettings,
  useUpsertComms,
} from '@/queries/admin.queries'
import { Field } from '../components/common'

const AUDIENCES = [
  'Applicant',
  'Company CEO',
  'Invited employee',
  'Company users',
  'Preparers and approvers',
  'Mentor / trainer',
  'All users',
]
const CHANNEL_LABEL: Record<CommsTemplate['channel'], string> = {
  email: 'Email',
  in_app: 'In platform',
  both: 'Email and in platform',
}

const blank = (): CommsTemplate => ({
  id: '',
  name: '',
  trigger: '',
  audience: AUDIENCES[0] as string,
  channel: 'both',
  subject: '',
  active: true,
  sentCount: 0,
})

export function CommunicationsPage() {
  const { data, isLoading, error, refetch } = useComms()
  const [editing, setEditing] = useState<CommsTemplate | null>(null)
  const save = useUpsertComms()

  const columns: Column<CommsTemplate>[] = [
    {
      key: 'name',
      header: 'Template',
      sortValue: (t) => t.name,
      cell: (t) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-navy">{t.name}</p>
          <p className="truncate text-muted-foreground text-xs">{t.subject}</p>
        </div>
      ),
    },
    {
      key: 'audience',
      header: 'Audience and trigger',
      sortValue: (t) => t.audience,
      cell: (t) => (
        <div className="min-w-0">
          <p>{t.audience}</p>
          <p className="text-muted-foreground text-xs">
            {t.trigger} · {CHANNEL_LABEL[t.channel]}
          </p>
        </div>
      ),
    },
    {
      key: 'sent',
      header: 'Sent',
      align: 'end',
      sortValue: (t) => t.sentCount,
      cell: (t) => t.sentCount.toLocaleString(),
    },
    {
      key: 'active',
      header: 'Active',
      cell: (t) => (
        <Switch
          aria-label={`${t.name} active`}
          checked={t.active}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={(v) =>
            save.mutate(
              { ...t, active: v },
              { onSuccess: () => toast.success(v ? 'Template activated' : 'Template paused') },
            )
          }
        />
      ),
    },
  ]

  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  return (
    <div>
      <PageHeader
        title="Communications"
        description="Notification and email templates, schedules and history."
        actions={
          <Button onClick={() => setEditing(blank())}>
            <Plus aria-hidden /> New template
          </Button>
        }
      />
      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="templates" className="pt-3">
          <DataTable
            caption="Templates"
            columns={columns}
            rows={data ?? []}
            getRowId={(t) => t.id}
            isLoading={isLoading}
            onRowClick={setEditing}
          />
        </TabsContent>
        <TabsContent value="schedule" className="pt-3">
          <Schedule />
        </TabsContent>
        <TabsContent value="history" className="pt-3">
          <History />
        </TabsContent>
      </Tabs>
      <Sheet open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {editing ? (
            <Editor key={editing.id || 'new'} initial={editing} onClose={() => setEditing(null)} />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Editor({ initial, onClose }: { initial: CommsTemplate; onClose: () => void }) {
  const save = useUpsertComms()
  const [t, setT] = useState(initial)
  const [touched, setTouched] = useState(false)
  const patch = (p: Partial<CommsTemplate>) => setT((x) => ({ ...x, ...p }))
  const bad = { name: !t.name.trim(), trigger: !t.trigger.trim(), subject: !t.subject.trim() }
  const preview = t.subject.replace('{{company}}', 'Asteria Group')

  return (
    <>
      <SheetHeader>
        <SheetTitle>{initial.id ? 'Edit template' : 'New template'}</SheetTitle>
        <SheetDescription>Use {'{{company}}'} to insert the company name.</SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 px-4 pb-4">
        <Field label="Name" required>
          <Input
            value={t.name}
            onChange={(e) => patch({ name: e.target.value })}
            aria-invalid={touched && bad.name}
          />
        </Field>
        <Field
          label="Trigger"
          required
          hint="The event that sends it, e.g. “Application approved”."
        >
          <Input
            value={t.trigger}
            onChange={(e) => patch({ trigger: e.target.value })}
            aria-invalid={touched && bad.trigger}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Audience segment">
            <Select value={t.audience} onValueChange={(v) => patch({ audience: v })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCES.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Channel">
            <Select
              value={t.channel}
              onValueChange={(v) => patch({ channel: v as CommsTemplate['channel'] })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CHANNEL_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Subject" required>
          <Input
            value={t.subject}
            onChange={(e) => patch({ subject: e.target.value })}
            aria-invalid={touched && bad.subject}
          />
        </Field>
        <div className="flex items-center gap-2 text-sm">
          <Switch
            id="tpl-active"
            checked={t.active}
            onCheckedChange={(v) => patch({ active: v })}
          />
          <label htmlFor="tpl-active">Active</label>
        </div>

        <section aria-label="Email preview" className="grid gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-navy text-sm">Email preview</h3>
            <p className="text-muted-foreground text-xs">Simulated, no email sent</p>
          </div>
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="border-b bg-surface p-3 text-xs">
              <p>
                <span className="text-muted-foreground">To:</span> {t.audience}
              </p>
              <p>
                <span className="text-muted-foreground">Subject:</span>{' '}
                <span className="font-medium text-navy">{preview || 'Subject line'}</span>
              </p>
            </div>
            <div className="grid gap-2 p-4 text-sm">
              <p>Hello,</p>
              <p className="text-muted-foreground">
                Message body for “{t.name || 'this template'}” appears here. Content follows the
                approved wording for the {t.trigger || 'selected'} event.
              </p>
              <p className="text-muted-foreground text-xs">
                UN Women · Women’s Empowerment Principles
              </p>
            </div>
          </div>
        </section>
      </div>
      <SheetFooter className="flex-row justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={save.isPending}
          onClick={() => {
            setTouched(true)
            if (Object.values(bad).some(Boolean)) return
            save.mutate(t, {
              onSuccess: () => {
                toast.success('Template saved')
                onClose()
              },
            })
          }}
        >
          {save.isPending ? 'Saving…' : 'Save template'}
        </Button>
      </SheetFooter>
    </>
  )
}

function Schedule() {
  const { data } = useSettings()
  const due = data ? new Date(data.reportingDueDate).getTime() : 0
  const rows = useMemo(
    () =>
      due
        ? [14, 7, 1].map((d) => ({
            id: `r${d}`,
            at: new Date(due - d * 864e5).toISOString(),
            label: `Reporting deadline reminder (${d} day${d > 1 ? 's' : ''} before)`,
            audience: 'Preparers and approvers',
          }))
        : [],
    [due],
  )
  return (
    <SectionCard
      title="Scheduled sends"
      description="Automatic reminders generated from platform settings."
    >
      <ul className="grid gap-2">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm"
          >
            <span className="font-medium text-navy">{r.label}</span>
            <span className="text-muted-foreground">
              {r.audience} · {formatDate(r.at)}
            </span>
          </li>
        ))}
        <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm">
          <span className="font-medium text-navy">Weekly digest of new resources</span>
          <span className="text-muted-foreground">Company users · every Monday</span>
        </li>
      </ul>
    </SectionCard>
  )
}

function History() {
  const { data, isLoading } = useNotificationHistory()
  type R = NonNullable<typeof data>[number]
  const cols: Column<R>[] = [
    {
      key: 'at',
      header: 'Sent',
      sortValue: (r) => r.notification.createdAt,
      cell: (r) => formatDateTime(r.notification.createdAt),
    },
    { key: 'to', header: 'Recipient', sortValue: (r) => r.recipient, cell: (r) => r.recipient },
    {
      key: 'title',
      header: 'Notification',
      cell: (r) => (
        <div className="min-w-0">
          <p className="font-medium text-navy">{r.notification.title}</p>
          <p className="text-muted-foreground text-xs">{r.notification.category}</p>
        </div>
      ),
    },
    {
      key: 'ch',
      header: 'Channel',
      cell: (r) => (
        <span className="flex gap-1">
          <StatusBadge tone="neutral" icon={null}>
            In platform
          </StatusBadge>
          {r.notification.emailPreview ? (
            <StatusBadge tone="info" icon={Mail}>
              Email (simulated)
            </StatusBadge>
          ) : null}
        </span>
      ),
    },
  ]
  return (
    <DataTable
      caption="Notification history"
      columns={cols}
      rows={data ?? []}
      getRowId={(r) => r.notification.id}
      isLoading={isLoading}
      initialSort={{ key: 'at', dir: 'desc' }}
    />
  )
}
