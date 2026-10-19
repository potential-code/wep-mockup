import type { Company } from '@shared/types'
import { Eye, Globe, Lock, MapPin } from 'lucide-react'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CompanyLogo } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { formatDate } from '@/lib/format'

/** Shows exactly what visitors to the public directory see: approved information only. */
export function PublicProfileSheet({ company }: { company: Company }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Eye aria-hidden /> Preview public profile
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Public profile preview</SheetTitle>
          <SheetDescription>
            This is how {company.name} appears in the public signatory directory.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-5 px-4 pb-6">
          <div className="flex items-center gap-4 rounded-2xl border bg-card p-4">
            <CompanyLogo name={company.name} src={company.logo} className="size-16" />
            <div className="min-w-0">
              <p className="font-heading font-semibold text-lg text-navy">{company.name}</p>
              <p className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="size-3.5" aria-hidden /> {company.country} · {company.sector}
              </p>
              <p className="text-muted-foreground text-xs">
                WEPs signatory since{' '}
                {formatDate(company.memberSince, { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          {company.publicProfileApproved ? (
            <StatusBadge tone="success">Public profile approved by UN Women</StatusBadge>
          ) : (
            <StatusBadge tone="warning">Not yet published in the directory</StatusBadge>
          )}
          <section aria-labelledby="pp-about">
            <h3 id="pp-about" className="mb-1 font-semibold text-navy text-sm">
              About
            </h3>
            <p className="text-sm leading-relaxed">{company.summary}</p>
          </section>
          {company.ceoCommitment ? (
            <blockquote className="rounded-xl border-gold border-l-4 bg-gold-50/60 p-4 text-sm italic">
              “{company.ceoCommitment}”
            </blockquote>
          ) : null}
          <section aria-labelledby="pp-pr">
            <h3 id="pp-pr" className="mb-2 font-semibold text-navy text-sm">
              Priority principles
            </h3>
            <div className="flex flex-wrap gap-2">
              {company.priorityPrinciples.map((p) => (
                <PrincipleTag key={p} id={p} />
              ))}
            </div>
          </section>
          <p className="flex items-center gap-2 text-muted-foreground text-xs">
            <Globe className="size-3.5" aria-hidden /> {company.website}
          </p>
          <div className="flex items-start gap-3 rounded-xl bg-secondary p-4 text-sm">
            <Lock className="mt-0.5 size-4 shrink-0 text-navy" aria-hidden />
            <p className="text-muted-foreground">
              <span className="font-semibold text-navy">Never shown publicly:</span> assessments,
              uploaded files and evidence, team members, billing and certification purchases.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
