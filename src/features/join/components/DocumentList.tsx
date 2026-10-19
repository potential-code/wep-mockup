import type { ApplicationDocument } from '@shared/types'
import { Eye, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { DOC_LABEL } from '../join-utils'

/** Documents with current version and earlier versions kept visible. */
export function DocumentList({ documents }: { documents: ApplicationDocument[] }) {
  if (documents.length === 0)
    return <p className="text-muted-foreground text-sm">No documents uploaded.</p>
  return (
    <ul className="grid gap-3">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info(`Opening ${d.fileName} (demo, no file is stored)`)}
            >
              <Eye aria-hidden /> View<span className="sr-only"> {d.fileName}</span> (demo)
            </Button>
          </div>
          {d.previous?.length ? (
            <ul className="mt-2 grid gap-1 border-t pt-2 text-muted-foreground text-xs">
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
  )
}
