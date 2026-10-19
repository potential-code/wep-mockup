import type { Company } from '@shared/types'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useResolveDuplicate } from '@/queries/applications.queries'

export function DuplicatePanel({
  applicationId,
  company,
}: {
  applicationId: string
  company: Company
}) {
  const resolve = useResolveDuplicate()
  const run = async (action: 'claim_existing' | 'treat_as_new') => {
    await resolve.mutateAsync({ id: applicationId, action })
    toast.success(
      action === 'claim_existing'
        ? `Linked to the existing ${company.name} record.`
        : 'Confirmed as a separate company.',
    )
  }
  return (
    <section
      aria-labelledby="dup-title"
      className="rounded-2xl border border-warning/40 bg-warning-soft/60 p-5"
    >
      <h2
        id="dup-title"
        className="mb-1 flex items-center gap-2 font-heading font-semibold text-navy"
      >
        <AlertTriangle className="size-4 text-warning" aria-hidden /> Possible duplicate company
      </h2>
      <p className="mb-3 text-sm">
        An existing record has the same name. Approval is blocked until this is resolved.
      </p>
      <dl className="mb-4 grid gap-1 rounded-xl bg-card p-3 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Existing company</dt>
          <dd className="font-medium text-navy">{company.name}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Country</dt>
          <dd>{company.country}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="capitalize">{company.signatoryStatus.replace(/_/g, ' ')}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => run('claim_existing')} disabled={resolve.isPending}>
          Claim or reactivate existing record
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => run('treat_as_new')}
          disabled={resolve.isPending}
        >
          This is a different company
        </Button>
      </div>
    </section>
  )
}
