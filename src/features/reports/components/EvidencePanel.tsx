import type { AnnualReport } from '@shared/types'
import { FileText } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { FileDrop, type UploadResult, type UploadStatus } from '@/components/shared/FileDrop'
import { formatDate } from '@/lib/format'
import { useAttachReportEvidence } from '@/queries/reports.queries'

const ALLOWED = /\.(pdf|xlsx|xls|csv|docx|png|jpg)$/i

export function EvidenceList({
  report,
  people,
}: {
  report: AnnualReport
  people: Record<string, string>
}) {
  if (!report.evidence.length)
    return <p className="text-muted-foreground text-sm">No evidence files attached yet.</p>
  return (
    <ul className="grid gap-2">
      {report.evidence.map((e) => (
        <li key={e.id} className="flex items-start gap-3 rounded-lg border bg-card p-3 text-sm">
          <FileText className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
          <div className="min-w-0">
            <p className="break-words font-medium text-navy">{e.fileName}</p>
            <p className="text-muted-foreground text-xs">
              {people[e.uploadedById] ?? 'Team member'} · {formatDate(e.uploadedAt)}
            </p>
            {e.note ? <p className="mt-1 text-muted-foreground text-xs">{e.note}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

export function EvidencePanel({
  report,
  readOnly,
  people,
}: {
  report: AnnualReport
  readOnly: boolean
  people: Record<string, string>
}) {
  const attach = useAttachReportEvidence()
  const [file, setFile] = useState<UploadResult | null>(null)
  const validate = (f: UploadResult): UploadStatus =>
    !ALLOWED.test(f.fileName) ? 'wrong_type' : f.sizeKb > 10240 ? 'too_large' : 'valid'

  return (
    <div className="grid gap-3">
      <h3 className="font-heading font-semibold text-navy">Evidence files</h3>
      <EvidenceList report={report} people={people} />
      {readOnly ? null : (
        <FileDrop
          label="Attach evidence"
          hint="PDF, spreadsheet, document or image up to 10 MB. Demo only: files are not uploaded anywhere."
          accept=".pdf,.xlsx,.xls,.csv,.docx,.png,.jpg"
          value={file}
          sampleName="Supplier-Spend-Analysis-FY2025.xlsx"
          validate={validate}
          onChange={(f) => {
            if (!f) return setFile(null)
            setFile(f)
            attach.mutate(
              { year: report.year, fileName: f.fileName },
              {
                onSuccess: () => {
                  toast.success(`${f.fileName} attached`)
                  setFile(null)
                },
              },
            )
          }}
        />
      )}
    </div>
  )
}
