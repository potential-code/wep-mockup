import { Link, useParams } from '@tanstack/react-router'
import { Copy, Download, ShieldCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { AccessNotice, ErrorState, PageSkeleton } from '@/components/shared/States'
import { CompanyLogo } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { downloadText, formatDate } from '@/lib/format'
import { useCredential } from '@/queries/certification.queries'

export function CredentialPage() {
  const { purchaseId } = useParams({ from: '/_app/portal/certification/credential/$purchaseId' })
  const { data, isLoading, error, refetch } = useCredential(purchaseId)
  const [verified, setVerified] = useState(false)

  if (isLoading) return <PageSkeleton />
  if (error)
    return (error as { code?: string }).code === 'not_found' ? (
      <AccessNotice
        title="No credential yet"
        message={error.message}
        action={
          <Button asChild variant="outline">
            <Link to="/portal/certification">Back to certifications</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState message={error.message} onRetry={() => refetch()} />
    )
  if (!data?.offering) return null
  const { purchase, offering, company } = data
  const issued = formatDate(purchase.issuedAt)
  const shareUrl = `${window.location.origin}/verify/${purchase.credentialRef}`
  const download = () => {
    downloadText(
      `${purchase.credentialRef}.txt`,
      `SAMPLE CERTIFICATE — illustrative demo\n\nCompany: ${company?.name}\nCertification: ${offering.title}\nIssued: ${issued}\nReference: ${purchase.credentialRef}\n\nThis is a proposed demo certification. It is not an existing WEPs certification and carries no official seal or accreditation.\n`,
    )
    toast.success('Sample certificate downloaded (demo)')
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      /* clipboard may be unavailable in the demo environment */
    }
    toast.success('Share link copied')
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Certification', to: '/portal/certification' },
          { label: 'Credential' },
        ]}
        title="Company credential"
        description="Issued because payment was confirmed and the exam was passed."
        actions={
          <>
            <Button variant="outline" onClick={copy}>
              <Copy /> Copy share link
            </Button>
            <Button variant="outline" onClick={() => setVerified(true)}>
              <ShieldCheck /> Verify
            </Button>
            <Button onClick={download}>
              <Download /> Download (demo)
            </Button>
          </>
        }
      />
      <AnimatePresence>
        {verified ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
            role="status"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-success/40 bg-success-soft p-4 text-sm">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
              <div>
                <p className="font-semibold text-navy">Reference found in the demo registry</p>
                <p>
                  {purchase.credentialRef} was issued to {company?.name} on {issued} for{' '}
                  {offering.title}. This is a simulated verification of a sample certificate.
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <article
        className="relative overflow-hidden rounded-2xl border-4 border-double border-gold/60 bg-card p-8 text-center shadow-lift sm:p-14"
        aria-label="Sample certificate"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="-rotate-[24deg] select-none whitespace-nowrap font-heading font-extrabold text-2xl text-navy/[0.07] sm:text-4xl">
            SAMPLE CERTIFICATE — illustrative
          </span>
        </div>
        <div className="relative grid justify-items-center gap-4">
          <CompanyLogo name={company?.name ?? ''} src={company?.logo} className="size-16" />
          <p className="font-medium text-gold-700 text-xs uppercase tracking-[0.3em]">
            Certificate of completion
          </p>
          <p className="text-muted-foreground">This sample certificate is awarded to</p>
          <h2 className="font-heading font-bold text-3xl text-navy sm:text-4xl">{company?.name}</h2>
          <p className="text-muted-foreground">
            for successfully completing the proposed demo certification
          </p>
          <p className="max-w-xl font-heading font-semibold text-navy text-xl sm:text-2xl">
            {offering.title}
          </p>
          <div className="mt-4 grid gap-6 border-t pt-6 text-sm sm:grid-cols-2 sm:gap-16">
            <div>
              <p className="text-muted-foreground text-xs uppercase">Issue date</p>
              <p className="font-medium text-navy">{issued}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase">Reference</p>
              <p className="font-medium font-mono text-navy">{purchase.credentialRef}</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-muted-foreground text-xs">
            Illustrative demo only. Not an existing WEPs certification, not required for signatory
            status, and carries no official seal or accreditation.
          </p>
        </div>
      </article>
    </div>
  )
}
