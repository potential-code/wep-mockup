import { ROLE_LABELS } from '@shared/reference'
import type { Role } from '@shared/types'
import { Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoLabel, SectionCard } from '@/components/shared/Cards'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAiScripts, useSettings, useUpdateSettings } from '@/queries/admin.queries'
import { SwitchRow } from '../components/common'

const CONTEXT = [
  {
    id: 'role',
    label: 'Role and department',
    description: 'Lets answers match what the person does.',
    on: true,
  },
  {
    id: 'progress',
    label: 'Learning progress and points',
    description: 'Used to suggest the next lesson or explain a locked clinic.',
    on: true,
  },
  {
    id: 'company',
    label: 'Permitted company records',
    description: 'Priorities, actions and report status, only for users who may already see them.',
    on: true,
  },
  {
    id: 'private',
    label: 'Other companies’ private data',
    description: 'Never available to the assistant in shared spaces.',
    on: false,
    locked: true,
  },
]

const FEEDBACK = [
  {
    id: 'f1',
    up: true,
    prompt: 'Why is this clinic locked?',
    note: 'Clear and pointed me to the course.',
    who: 'Employee',
  },
  {
    id: 'f2',
    up: false,
    prompt: 'What was our gender pay gap in 2023?',
    note: 'Said the data is unavailable. Expected a pointer to the pay equity resource.',
    who: 'Focal point',
  },
  {
    id: 'f3',
    up: true,
    prompt: 'Help draft this year’s progress narrative',
    note: 'Good structure, labelled as a draft.',
    who: 'Focal point',
  },
]

export function AiSettingsPage() {
  const settings = useSettings()
  const scripts = useAiScripts()
  const update = useUpdateSettings()
  const [ctx, setCtx] = useState(Object.fromEntries(CONTEXT.map((c) => [c.id, c.on])))

  if (settings.error)
    return <ErrorState message={settings.error.message} onRetry={settings.refetch} />
  if (settings.isLoading || !settings.data) return <PageSkeleton />
  const sources = settings.data.aiSources

  const toggleSource = (i: number, active: boolean) =>
    update.mutate(
      { aiSources: sources.map((s, j) => (j === i ? { ...s, active } : s)) },
      { onSuccess: () => toast.success(active ? 'Source enabled' : 'Source disabled') },
    )

  const byRole = new Map<Role, NonNullable<typeof scripts.data>>()
  for (const s of scripts.data ?? [])
    for (const r of s.roles) byRole.set(r, [...(byRole.get(r) ?? []), s])

  return (
    <div>
      <PageHeader
        title="AI Knowledge and Settings"
        description="Control what the assistant may draw on and review how it is used."
        actions={<DemoLabel>Responses are scripted in this demo</DemoLabel>}
      />
      <Tabs defaultValue="sources">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="sources">Approved sources</TabsTrigger>
          <TabsTrigger value="prompts">Suggested prompts</TabsTrigger>
          <TabsTrigger value="context">Profile context</TabsTrigger>
          <TabsTrigger value="feedback">Feedback review</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="pt-3">
          <SectionCard
            title="Approved knowledge sources"
            description="The assistant cites only these sources. Disabling a source removes it from future answers."
          >
            <ul className="grid gap-3">
              {sources.map((s, i) => (
                <li key={s.label}>
                  <SwitchRow
                    label={s.label}
                    description={
                      <>
                        Version <span className="font-medium text-navy">{s.version}</span>
                      </>
                    }
                    checked={s.active}
                    disabled={update.isPending}
                    onCheckedChange={(v) => toggleSource(i, v)}
                  />
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="prompts" className="pt-3">
          <div className="grid gap-4 lg:grid-cols-2">
            {[...byRole.entries()].map(([role, list]) => (
              <SectionCard
                key={role}
                title={ROLE_LABELS[role]}
                description={`${list.length} suggested prompts`}
              >
                <ul className="grid gap-2">
                  {list.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2.5 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="size-3.5 text-blue" aria-hidden /> {p.prompt}
                      </span>
                      <span className="flex gap-1">
                        {p.isDraft ? (
                          <StatusBadge tone="gold" icon={null}>
                            Draft output
                          </StatusBadge>
                        ) : null}
                        {p.unavailable ? (
                          <StatusBadge tone="warning" icon={null}>
                            Unavailable-data demo
                          </StatusBadge>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="context" className="pt-3">
          <SectionCard
            title="Profile context permissions"
            description="What the assistant may read about the signed-in user."
          >
            <div className="grid max-w-2xl gap-3">
              {CONTEXT.map((c) => (
                <SwitchRow
                  key={c.id}
                  label={c.label}
                  description={c.description}
                  checked={ctx[c.id] ?? false}
                  disabled={c.locked}
                  onCheckedChange={(v) => {
                    setCtx((x) => ({ ...x, [c.id]: v }))
                    toast.success('Saved (demo)')
                  }}
                />
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="feedback" className="pt-3">
          <SectionCard
            title="User feedback"
            description="Illustrative feedback on assistant answers."
          >
            <DemoLabel className="mb-3">Illustrative demo data</DemoLabel>
            <ul className="grid gap-2">
              {FEEDBACK.map((f) => (
                <li key={f.id} className="flex items-start gap-3 rounded-xl border p-3 text-sm">
                  {f.up ? (
                    <ThumbsUp className="mt-0.5 size-4 text-success" aria-label="Helpful" />
                  ) : (
                    <ThumbsDown className="mt-0.5 size-4 text-danger" aria-label="Not helpful" />
                  )}
                  <div>
                    <p className="font-medium text-navy">{f.prompt}</p>
                    <p className="text-muted-foreground">
                      {f.note} · {f.who}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
