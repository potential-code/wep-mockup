import { Construction } from 'lucide-react'
import { PageHeader } from './PageHeader'

/** Temporary stand-in while a page is being built. */
export function PagePlaceholder({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} description="This screen is being designed." />
      <div className="grid place-items-center rounded-2xl border border-dashed bg-card p-16 text-center text-muted-foreground">
        <Construction className="mb-3 size-8" aria-hidden />
        Coming together shortly.
      </div>
    </div>
  )
}
