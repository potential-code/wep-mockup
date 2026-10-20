import { CalendarClock, Check, CircleX, CopyCheck, FilePlus2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/Cards'
import { StatCard } from '@/components/shared/StatCard'
import { ErrorState, PageSkeleton } from '@/components/shared/States'
import { WorkflowStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate } from '@/lib/format'
import {
  REPORT_TEMPLATE_SECTIONS,
  useOpenReportingYear,
  useReportingConfig,
  useUpdateSettings,
} from '@/queries/admin.queries'
import { CheckRow, Field, SwitchRow } from '../components/common'

type CompanyRow = NonNullable<ReturnType<typeof useReportingConfig>['data']>['companies'][number]

const WORKFLOW = [
  { label: 'Company prepares', note: 'Preparers draft sections and attach evidence.' },
  { label: 'CEO / approver signs off', note: 'The declaration is approved before submission.' },
  { label: 'UN Women reviews', note: 'Reviewers check completeness, evidence and consistency.' },
  { label: 'Changes requested or accepted', note: 'Companies resubmit; every version is kept.' },
  { label: 'Public summary (optional)', note: 'Only approved summaries can be shown publicly.' },
]

export function ManageReportingPage() {
  const { data, isLoading, error, refetch } = useReportingConfig()
  const update = useUpdateSettings()
  const [included, setIncluded] = useState<Set<string>>(new Set())
  const [due, setDue] = useState('')
  const [reminder, setReminder] = useState('14,7,1')
  const [rollover, setRollover] = useState(false)
  const [required, setRequired] = useState<Record<string, boolean>>({})
  const [disclosure, setDisclosure] = useState({
    publicSummary: true,
    companyApproval: true,
    showIndicators: false,
  })

  useEffect(() => {
    if (!data) return
    setIncluded(new Set(data.companies.map((c) => c.company.id)))
    setDue(data.settings.reportingDueDate.slice(0, 10))
    setRequired(Object.fromEntries(REPORT_TEMPLATE_SECTIONS.map((s) => [s.key, true])))
  }, [data])

  const stats = useMemo(() => {
    const list = data?.companies ?? []
    const submitted = list.filter((c) =>
      ['submitted', 'under_review', 'accepted', 'resubmitted'].includes(c.status),
    ).length
    return {
      total: list.length,
      submitted,
    }
  }, [data])

  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (isLoading || !data) return <PageSkeleton />
  const year = data.settings.reportingYear

  return (
    <div>
      <PageHeader
        title="Annual Reporting"
        description="Configure the reporting cycle, who reports, the template and review workflow."
        actions={
          <Button onClick={() => setRollover(true)}>
            <FilePlus2 aria-hidden /> Open new reporting year
          </Button>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Reporting year" value={String(year)} icon={CalendarClock} />
        <StatCard
          label="Deadline"
          value={formatDate(data.settings.reportingDueDate)}
          tone="coral"
        />
        <StatCard
          label="Submitted or accepted"
          value={`${stats.submitted} / ${stats.total}`}
          progress={stats.total ? (stats.submitted / stats.total) * 100 : 0}
        />
      </div>

      <Tabs defaultValue="population">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="population">Population</TabsTrigger>
          <TabsTrigger value="template">Template</TabsTrigger>
          <TabsTrigger value="deadline">Deadline and reminders</TabsTrigger>
          <TabsTrigger value="workflow">Review workflow</TabsTrigger>
          <TabsTrigger value="disclosure">Public disclosure</TabsTrigger>
        </TabsList>

        <TabsContent value="population" className="pt-3">
          <SectionCard
            title="Companies expected to report"
            description="Approved signatories included in the reporting cycle."
          >
            <ul className="grid gap-2 sm:grid-cols-2">
              {data.companies.map((r) => (
                <li key={r.company.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <CheckRow
                      label={
                        <span className="flex items-center justify-between gap-2">
                          {r.company.name}
                          <WorkflowStatus status={r.status} />
                        </span>
                      }
                      checked={included.has(r.company.id)}
                      onCheckedChange={(v) =>
                        setIncluded((s) => {
                          const n = new Set(s)
                          v ? n.add(r.company.id) : n.delete(r.company.id)
                          return n
                        })
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-muted-foreground text-xs">
              {included.size} of {data.companies.length} companies in scope for {year}.
            </p>
          </SectionCard>
        </TabsContent>

        <TabsContent value="template" className="pt-3">
          <SectionCard
            title="Report template sections"
            description="Sections companies complete. Required sections block submission until finished."
          >
            <ul className="grid gap-2">
              {REPORT_TEMPLATE_SECTIONS.map((s, i) => (
                <li key={s.key}>
                  <SwitchRow
                    label={`${i + 1}. ${s.label}`}
                    description={
                      s.carried
                        ? 'Pre-filled from last year as an editable reference.'
                        : 'Starts blank each year.'
                    }
                    checked={required[s.key] ?? true}
                    onCheckedChange={(v) => setRequired((r) => ({ ...r, [s.key]: v }))}
                  />
                </li>
              ))}
            </ul>
            <Button className="mt-4" onClick={() => toast.success('Template saved (demo)')}>
              Save template
            </Button>
          </SectionCard>
        </TabsContent>

        <TabsContent value="deadline" className="pt-3">
          <SectionCard title="Deadline and reminders">
            <div className="grid max-w-xl gap-4">
              <Field label="Submission deadline">
                <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
              </Field>
              <Field label="Automatic reminders (days before deadline)">
                <Select value={reminder} onValueChange={setReminder}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14,7,1">14, 7 and 1 day before</SelectItem>
                    <SelectItem value="30,14,7,1">30, 14, 7 and 1 day before</SelectItem>
                    <SelectItem value="7">7 days before only</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <p className="text-muted-foreground text-xs">
                Reminders go to preparers and approvers using the “Reporting deadline” notification
                template. They cannot be switched off by recipients.
              </p>
              <Button
                className="justify-self-start"
                disabled={update.isPending || !due}
                onClick={() =>
                  update.mutate(
                    { reportingDueDate: `${due}T23:59:00.000Z` },
                    { onSuccess: () => toast.success('Deadline updated') },
                  )
                }
              >
                {update.isPending ? 'Saving…' : 'Save deadline'}
              </Button>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="workflow" className="pt-3">
          <SectionCard title="Review workflow">
            <ol className="grid gap-3">
              {WORKFLOW.map((w, i) => (
                <li key={w.label} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-blue-50 font-semibold text-blue text-xs">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-navy text-sm">{w.label}</p>
                    <p className="text-muted-foreground text-sm">{w.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>
        </TabsContent>

        <TabsContent value="disclosure" className="pt-3">
          <SectionCard
            title="Public disclosure settings"
            description="Nothing is published without the company’s explicit approval."
          >
            <div className="grid max-w-2xl gap-3">
              <SwitchRow
                label="Allow public summaries"
                description="Accepted reports may show an approved public summary."
                checked={disclosure.publicSummary}
                onCheckedChange={(v) => setDisclosure((d) => ({ ...d, publicSummary: v }))}
              />
              <SwitchRow
                label="Require company approval of the summary"
                description="Strongly recommended. Companies approve the exact text first."
                checked={disclosure.companyApproval}
                onCheckedChange={(v) => setDisclosure((d) => ({ ...d, companyApproval: v }))}
              />
              <SwitchRow
                label="Show headline indicators publicly"
                description="Off by default. Indicator values stay private to UN Women."
                checked={disclosure.showIndicators}
                onCheckedChange={(v) => setDisclosure((d) => ({ ...d, showIndicators: v }))}
              />
              <Button
                className="justify-self-start"
                onClick={() => toast.success('Disclosure settings saved (demo)')}
              >
                Save settings
              </Button>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <RolloverDialog
        open={rollover}
        onOpenChange={setRollover}
        year={year}
        companies={data.companies}
        defaultSelected={included}
      />
    </div>
  )
}

function RolloverDialog({
  open,
  onOpenChange,
  year,
  companies,
  defaultSelected,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  year: number
  companies: CompanyRow[]
  defaultSelected: Set<string>
}) {
  const roll = useOpenReportingYear()
  const next = year + 1
  const [due, setDue] = useState(`${next}-11-30`)
  const ids = companies.filter((c) => defaultSelected.has(c.company.id)).map((c) => c.company.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Open reporting year {next}</DialogTitle>
          <DialogDescription>
            Creates a new blank report for {ids.length} companies. Previous reports stay unchanged
            and readable.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <section className="rounded-xl border border-success/30 bg-success-soft/40 p-3">
              <h3 className="mb-1.5 flex items-center gap-1.5 font-medium text-navy text-sm">
                <CopyCheck className="size-4 text-success" aria-hidden /> Copied forward
              </h3>
              <ul className="list-disc ps-5 text-sm">
                <li>Company profile snapshot</li>
                <li>Priorities, as editable references</li>
                <li>Indicator definitions, with last year’s value shown as “previous”</li>
              </ul>
            </section>
            <section className="rounded-xl border border-danger/30 bg-danger-soft/40 p-3">
              <h3 className="mb-1.5 flex items-center gap-1.5 font-medium text-navy text-sm">
                <CircleX className="size-4 text-danger" aria-hidden /> Not copied
              </h3>
              <ul className="list-disc ps-5 text-sm">
                <li>Outcome values and evidence</li>
                <li>Narrative, declaration and sign-off</li>
                <li>Review history and change requests</li>
              </ul>
            </section>
          </div>
          <Field label="Submission deadline" required>
            <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={roll.isPending}>
            Cancel
          </Button>
          <Button
            disabled={roll.isPending || !due || ids.length === 0}
            onClick={() =>
              roll.mutate(
                { year: next, companyIds: ids, dueDate: `${due}T23:59:00.000Z` },
                {
                  onSuccess: () => {
                    toast.success(`Reporting year ${next} opened for ${ids.length} companies`)
                    onOpenChange(false)
                  },
                },
              )
            }
          >
            <Check aria-hidden /> {roll.isPending ? 'Opening…' : `Open ${next}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
