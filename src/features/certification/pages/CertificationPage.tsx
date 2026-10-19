import { Award, Info } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AccessNotice, CardGridSkeleton, ErrorState } from '@/components/shared/States'
import { useCertifications } from '@/queries/certification.queries'
import { OfferingCard, ProposedNotice } from '../components/cert-shared'

export function CertificationPage() {
  const { data, isLoading, error, refetch } = useCertifications()
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Company certifications"
        title="Certification"
        description="Three proposed company certifications, each with its own payment, exam and sample credential."
      />
      <ProposedNotice />
      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : error ? (
        (error as { code?: string }).code === 'forbidden' ? (
          <AccessNotice title="Certification isn’t available" message={error.message} />
        ) : (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        )
      ) : data ? (
        <>
          {!data.canPurchase ? (
            <p className="flex items-start gap-2 rounded-xl border bg-card p-3 text-muted-foreground text-sm">
              <Info className="mt-0.5 size-4 shrink-0 text-blue" aria-hidden />
              You can see your company’s credential status here. Only the CEO or an admin with
              purchasing authority can pay for or sit a company exam.
            </p>
          ) : null}
          <div className="grid gap-5 md:grid-cols-3">
            {data.offerings.map((row, i) => (
              <OfferingCard key={row.offering.id} row={row} index={i} />
            ))}
          </div>
          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <Award className="size-4" aria-hidden />
            Each certification is tracked independently: paying for one does not unlock another.
          </p>
        </>
      ) : null}
    </div>
  )
}
