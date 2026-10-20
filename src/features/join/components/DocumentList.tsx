import type { Application, ApplicationDocument } from '@shared/types'
import { Eye, FileText, Lock, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/format'
import { DOC_LABEL } from '../join-utils'

/** Documents with current version and earlier versions kept visible. */
export function DocumentList({
  documents,
  application,
}: {
  documents: ApplicationDocument[]
  /** Fills the sample previews with the applicant's company and CEO. */
  application?: Application
}) {
  const [open, setOpen] = useState<ApplicationDocument | null>(null)
  if (documents.length === 0)
    return <p className="text-muted-foreground text-sm">No documents uploaded.</p>
  return (
    <>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-3">
        {documents.map((d) => (
          <li key={d.id} className="rounded-xl border p-3">
            <div className="flex items-center gap-3">
              <FileText className="size-5 shrink-0 text-blue" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs">{DOC_LABEL[d.kind]}</p>
                <p className="truncate font-medium text-navy text-sm">{d.fileName}</p>
                <p className="text-muted-foreground text-xs">
                  Version {d.version} · {d.sizeKb.toLocaleString()} KB · {formatDate(d.uploadedAt)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setOpen(d)}>
                <Eye aria-hidden /> View<span className="sr-only"> {d.fileName}</span>
              </Button>
            </div>
            {d.previous?.length ? (
              <ul className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-1 border-t pt-2 text-muted-foreground text-xs">
                {d.previous.map((p) => (
                  <li key={p.version}>
                    Earlier version {p.version}: {p.fileName} · replaced, kept for the record
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
      <DocumentPreview doc={open} application={application} onClose={() => setOpen(null)} />
    </>
  )
}

/** Sample rendering of an uploaded document. No real file is stored in the demo. */
function DocumentPreview({
  doc,
  application,
  onClose,
}: {
  doc: ApplicationDocument | null
  application?: Application
  onClose: () => void
}) {
  const company = application?.data.company.name || 'The company'
  const country = application?.data.company.country || '—'
  const ceo = application
    ? `${application.data.executive.firstName} ${application.data.executive.lastName}`.trim()
    : 'Chief Executive Officer'
  const ceoTitle = application?.data.executive.title || 'Chief Executive Officer'
  return (
    <Dialog open={doc !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="truncate">{doc?.fileName}</DialogTitle>
          <DialogDescription>
            {doc ? `${DOC_LABEL[doc.kind]} · version ${doc.version}` : null}
          </DialogDescription>
        </DialogHeader>
        <p className="flex w-fit items-center gap-1.5 rounded-full bg-gold-50 px-2.5 py-1 font-semibold text-[0.7rem] text-gold-700 uppercase tracking-wider">
          <Lock className="size-3" aria-hidden /> Sample · confidential
        </p>
        <article className="relative rounded-lg border bg-white p-6 text-navy text-sm shadow-card sm:p-8">
          <span
            aria-hidden
            className="-rotate-12 pointer-events-none absolute inset-0 grid select-none place-items-center font-bold font-heading text-5xl text-navy/[0.04] uppercase"
          >
            Sample
          </span>
          {doc?.kind === 'ceo_statement' ? (
            <div className="grid gap-3 leading-relaxed">
              <p className="text-muted-foreground text-xs">{formatDate(doc.uploadedAt)}</p>
              <p className="font-heading font-semibold text-lg">
                CEO Statement of Support for the Women’s Empowerment Principles
              </p>
              <p>
                I am pleased to confirm that {company} supports the Women’s Empowerment Principles
                established by UN Women and the UN Global Compact.
              </p>
              <p>
                We commit to advancing gender equality and women’s empowerment in our workplace,
                marketplace and community, and to reporting on our progress.
              </p>
              <div className="mt-4 grid gap-0.5">
                <p className="font-[cursive] text-2xl text-blue">{ceo}</p>
                <p className="font-semibold">{ceo}</p>
                <p className="text-muted-foreground">
                  {ceoTitle}, {company}
                </p>
              </div>
            </div>
          ) : doc?.kind === 'registration' ? (
            <div className="grid gap-4">
              <p className="text-center font-heading font-semibold text-lg uppercase tracking-wide">
                Certificate of Commercial Registration
              </p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                <dt className="text-muted-foreground">Registered name</dt>
                <dd className="font-medium">{company}</dd>
                <dt className="text-muted-foreground">Country</dt>
                <dd className="font-medium">{country}</dd>
                <dt className="text-muted-foreground">Registration no.</dt>
                <dd className="font-medium">SAMPLE-{doc.id.slice(-6).toUpperCase()}</dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium">Active</dd>
                <dt className="text-muted-foreground">Issued</dt>
                <dd className="font-medium">{formatDate(doc.uploadedAt)}</dd>
              </dl>
              <p className="text-muted-foreground text-xs">
                Illustrative layout only. Not a real registration record.
              </p>
            </div>
          ) : (
            <div className="grid justify-items-center gap-3 py-4">
              <span className="grid size-32 place-items-center rounded-full bg-blue-50 text-blue">
                <UserRound className="size-16" aria-hidden />
              </span>
              <p className="font-semibold">{ceo}</p>
              <p className="text-muted-foreground">
                {ceoTitle}, {company}
              </p>
            </div>
          )}
        </article>
        <p className="text-muted-foreground text-xs">
          Demo preview. No file is stored. Only the applicant and UN Women reviewers can see these
          documents.
        </p>
      </DialogContent>
    </Dialog>
  )
}
