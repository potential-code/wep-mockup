import { Mail } from 'lucide-react'

export interface EmailPreviewData {
  to: string
  subject: string
  body: string[]
}

/** Simulated outgoing email, shown after actions that would notify someone. */
export function EmailPreview({ email }: { email: EmailPreviewData }) {
  return (
    <figure className="overflow-hidden rounded-xl border bg-card text-sm">
      <figcaption className="flex items-center gap-2 border-b bg-surface px-4 py-2 text-muted-foreground text-xs">
        <Mail className="size-3.5" aria-hidden /> Simulated email, not actually sent
      </figcaption>
      <div className="grid gap-2 p-4">
        <p>
          <span className="text-muted-foreground">To:</span> {email.to}
        </p>
        <p className="font-semibold text-navy">{email.subject}</p>
        <div className="grid gap-2 border-t pt-3">
          {email.body.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </figure>
  )
}
