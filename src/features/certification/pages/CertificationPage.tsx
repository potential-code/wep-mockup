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
        description="Three company certifications, each with its own payment and exam."
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
            <p className="text-muted-foreground text-sm">
              View only. The CEO or an admin with purchasing authority can pay for and sit exams.
            </p>
          ) : null}
          <div className="grid gap-5 md:grid-cols-3">
            {data.offerings.map((row, i) => (
              <OfferingCard key={row.offering.id} row={row} index={i} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
