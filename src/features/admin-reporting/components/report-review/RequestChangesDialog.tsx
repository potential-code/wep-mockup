import type { ReportSectionKey } from '@shared/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SECTION_META, useRequestReportChanges } from '@/queries/reports.queries'

/** Pick the sections that need revision and write a note for each. */
export function RequestChangesDialog({
  open,
  onOpenChange,
  reportId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: string
}) {
  const request = useRequestReportChanges()
  const [notes, setNotes] = useState<Partial<Record<ReportSectionKey, string>>>({})
  const [touched, setTouched] = useState(false)
  const chosen = Object.entries(notes) as [ReportSectionKey, string][]
  const invalid = chosen.length === 0 || chosen.some(([, n]) => !n.trim())

  const toggle = (key: ReportSectionKey, on: boolean) =>
    setNotes((n) => {
      const next = { ...n }
      if (on) next[key] = next[key] ?? ''
      else delete next[key]
      return next
    })

  const send = () => {
    setTouched(true)
    if (invalid) return
    request.mutate(
      { id: reportId, requests: chosen.map(([section, note]) => ({ section, note: note.trim() })) },
      {
        onSuccess: () => {
          toast.success('Changes requested. The company has been notified.')
          setNotes({})
          setTouched(false)
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Request changes</DialogTitle>
          <DialogDescription>
            Choose each section that needs revision and describe what is required. Earlier versions
            are kept.
          </DialogDescription>
        </DialogHeader>
        <ul className="grid gap-3">
          {SECTION_META.filter((s) => s.key !== 'declaration').map((s) => {
            const on = s.key in notes
            return (
              <li key={s.key} className="grid gap-2 rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`chg-${s.key}`}
                    checked={on}
                    onCheckedChange={(c) => toggle(s.key, c === true)}
                  />
                  <Label htmlFor={`chg-${s.key}`} className="font-medium">
                    {s.title}
                  </Label>
                </div>
                {on ? (
                  <div className="grid gap-1">
                    <Label htmlFor={`note-${s.key}`} className="sr-only">
                      Required change for {s.title}
                    </Label>
                    <Textarea
                      id={`note-${s.key}`}
                      rows={2}
                      value={notes[s.key] ?? ''}
                      placeholder="What should the company change or add?"
                      onChange={(e) => setNotes((n) => ({ ...n, [s.key]: e.target.value }))}
                    />
                    {touched && !notes[s.key]?.trim() ? (
                      <p role="alert" className="text-danger text-xs">
                        Describe the required change.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
        {touched && chosen.length === 0 ? (
          <p role="alert" className="text-danger text-xs">
            Choose at least one section.
          </p>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={request.isPending} onClick={send}>
            {request.isPending ? 'Sending…' : 'Send change request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
