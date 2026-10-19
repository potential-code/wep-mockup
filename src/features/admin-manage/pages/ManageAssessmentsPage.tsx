import { DEPARTMENTS } from '@shared/reference'
import type { AssessmentSection } from '@shared/types'
import { ArrowDown, ArrowUp, Plus, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoLabel, SectionCard } from '@/components/shared/Cards'
import { StatCard } from '@/components/shared/StatCard'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
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
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAssessmentConfig } from '@/queries/admin.queries'
import { ActionBar, Field } from '../components/common'

interface QState {
  enabled: boolean
  evidence: boolean
}

export function ManageAssessmentsPage() {
  const { data, isLoading, error, refetch } = useAssessmentConfig()
  const [sections, setSections] = useState<AssessmentSection[]>([])
  const [q, setQ] = useState<Record<string, QState>>({})
  const [owners, setOwners] = useState<Record<string, string>>({})
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!data) return
    setSections(data.sections)
    setQ(
      Object.fromEntries(
        data.sections.flatMap((s) =>
          s.questions.map((x) => [x.id, { enabled: true, evidence: x.type !== 'text' }]),
        ),
      ),
    )
    setOwners(
      Object.fromEntries(
        DEPARTMENTS.map((d) => [d.id, d.id === 'leadership' ? 'ceo' : 'department_lead']),
      ),
    )
  }, [data])

  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (isLoading || !data) return <PageSkeleton />

  const touch =
    <T,>(fn: (v: T) => void) =>
    (v: T) => {
      fn(v)
      setDirty(true)
    }
  const patchSection = touch((p: { id: string; patch: Partial<AssessmentSection> }) =>
    setSections((all) => all.map((s) => (s.id === p.id ? { ...s, ...p.patch } : s))),
  )
  const patchQ = touch((p: { id: string; patch: Partial<QState> }) =>
    setQ((all) => ({ ...all, [p.id]: { ...(all[p.id] as QState), ...p.patch } })),
  )
  const moveQuestion = touch((p: { sid: string; i: number; d: -1 | 1 }) =>
    setSections((all) =>
      all.map((s) => {
        if (s.id !== p.sid) return s
        const qs = [...s.questions]
        const [it] = qs.splice(p.i, 1)
        if (it) qs.splice(p.i + p.d, 0, it)
        return { ...s, questions: qs }
      }),
    ),
  )
  const patchText = touch((p: { sid: string; qid: string; text: string }) =>
    setSections((all) =>
      all.map((s) =>
        s.id === p.sid
          ? {
              ...s,
              questions: s.questions.map((x) => (x.id === p.qid ? { ...x, text: p.text } : x)),
            }
          : s,
      ),
    ),
  )
  const total = sections.reduce((n, s) => n + s.questions.length, 0)
  const active = Object.values(q).filter((x) => x.enabled).length

  return (
    <div>
      <PageHeader
        title="Assessments"
        description="Configure the baseline self-assessment: question groups, evidence fields and assignment."
        actions={<DemoLabel>Demo configuration</DemoLabel>}
      />
      <p className="mb-5 rounded-xl border bg-blue-50/60 p-3 text-sm">
        This is an illustrative builder. The assessment is a proposed demo form, not the official
        WEPs Gender Gap Analysis Tool, and changes here are kept in this browser session only.
      </p>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Question groups" value={sections.length} />
        <StatCard label="Active questions" value={active} hint={`of ${total}`} />
        <StatCard
          label="Submitted by companies"
          value={data.submitted}
          tone="success"
          hint={`${data.inProgress} in progress`}
        />
      </div>

      <Tabs defaultValue="groups">
        <TabsList>
          <TabsTrigger value="groups">Question groups</TabsTrigger>
          <TabsTrigger value="evidence">Evidence fields</TabsTrigger>
          <TabsTrigger value="rules">Assignment rules</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="grid gap-4 pt-3">
          {sections.map((s) => (
            <SectionCard key={s.id}>
              <div className="grid gap-3">
                <Field label="Group title">
                  <Input
                    value={s.title}
                    onChange={(e) => patchSection({ id: s.id, patch: { title: e.target.value } })}
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    rows={2}
                    value={s.description}
                    onChange={(e) =>
                      patchSection({ id: s.id, patch: { description: e.target.value } })
                    }
                  />
                </Field>
                <ul className="grid gap-2">
                  {s.questions.map((x, i) => (
                    <li key={x.id} className="grid gap-2 rounded-xl border bg-surface/50 p-3">
                      <Textarea
                        aria-label={`Question ${i + 1} text`}
                        rows={2}
                        value={x.text}
                        onChange={(e) => patchText({ sid: s.id, qid: x.id, text: e.target.value })}
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone="info" icon={null}>
                          P{x.principle}
                        </StatusBadge>
                        <StatusBadge tone="neutral" icon={null}>
                          {x.type === 'scale'
                            ? 'Maturity scale'
                            : x.type === 'single'
                              ? 'Single choice'
                              : 'Free text'}
                        </StatusBadge>
                        <div className="ms-auto flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Move question up"
                            disabled={i === 0}
                            onClick={() => moveQuestion({ sid: s.id, i, d: -1 })}
                          >
                            <ArrowUp />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Move question down"
                            disabled={i === s.questions.length - 1}
                            onClick={() => moveQuestion({ sid: s.id, i, d: 1 })}
                          >
                            <ArrowDown />
                          </Button>
                          <Switch
                            aria-label={`Include question ${i + 1}`}
                            checked={q[x.id]?.enabled ?? true}
                            onCheckedChange={(v) => patchQ({ id: x.id, patch: { enabled: v } })}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-self-start"
                  onClick={() => toast.info('Adding questions is simulated in this demo.')}
                >
                  <Plus aria-hidden /> Add question
                </Button>
              </div>
            </SectionCard>
          ))}
        </TabsContent>

        <TabsContent value="evidence" className="pt-3">
          <SectionCard
            title="Evidence fields"
            description="Ask companies to attach supporting documents to selected questions."
          >
            <ul className="grid gap-2">
              {sections.flatMap((s) =>
                s.questions.map((x) => (
                  <li
                    key={x.id}
                    className="flex items-center justify-between gap-4 rounded-xl border p-3"
                  >
                    <div className="min-w-0 text-sm">
                      <p className="line-clamp-2 text-navy">{x.text}</p>
                      <p className="text-muted-foreground text-xs">{s.title}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs">
                      <span>{q[x.id]?.evidence ? 'Evidence requested' : 'No evidence'}</span>
                      <Switch
                        aria-label={`Request evidence: ${x.text}`}
                        checked={q[x.id]?.evidence ?? false}
                        onCheckedChange={(v) => patchQ({ id: x.id, patch: { evidence: v } })}
                      />
                    </div>
                  </li>
                )),
              )}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="rules" className="pt-3">
          <SectionCard
            title="Assignment rules"
            description="Who completes each department's part of the assessment."
          >
            <ul className="grid gap-3">
              {DEPARTMENTS.map((d) => (
                <li key={d.id} className="grid items-center gap-2 sm:grid-cols-[1fr_16rem]">
                  <span className="font-medium text-navy text-sm">{d.label}</span>
                  <Select
                    value={owners[d.id]}
                    onValueChange={(v) => {
                      setOwners((o) => ({ ...o, [d.id]: v }))
                      setDirty(true)
                    }}
                  >
                    <SelectTrigger aria-label={`Owner for ${d.label}`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="department_lead">Department lead</SelectItem>
                      <SelectItem value="focal_point">WEPs focal point</SelectItem>
                      <SelectItem value="ceo">CEO / executive sponsor</SelectItem>
                    </SelectContent>
                  </Select>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <ActionBar>
        {dirty ? (
          <span className="me-auto text-muted-foreground text-xs">Unsaved changes</span>
        ) : null}
        <Button
          disabled={!dirty}
          onClick={() => {
            setDirty(false)
            toast.success('Saved (demo)')
          }}
        >
          <Save aria-hidden /> Save configuration
        </Button>
      </ActionBar>
    </div>
  )
}
