import type { AnnualReport } from '@shared/types'
import { Eye, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { SectionCard } from '@/components/shared/Cards'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTogglePublicSummary } from '@/queries/reports.queries'
import { ACCEPTED_NOTE } from '../lib'

/** Public disclosure is a separate, explicit decision from report submission. */
export function PublicDisclosureCard({
  report,
  canApprove,
  onPreview,
}: {
  report: AnnualReport
  canApprove: boolean
  onPreview: () => void
}) {
  const toggle = useTogglePublicSummary()
  const accepted = report.status === 'accepted'
  return (
    <SectionCard title="Public disclosure" description="Publishing is a separate approval.">
      <div className="grid gap-4">
        {accepted ? <p className="text-muted-foreground text-sm">{ACCEPTED_NOTE}</p> : null}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-4">
          <Label htmlFor="public-summary" className="grid gap-0.5">
            <span className="font-semibold text-navy">Approve public summary</span>
            <span className="font-normal text-muted-foreground text-xs">
              {accepted
                ? report.publicSummaryApproved
                  ? 'Approved. The summary is visible on your public company profile.'
                  : 'Not approved. Nothing from this report is public.'
                : 'Available after UN Women accepts the report.'}
            </span>
          </Label>
          <div className="flex items-center gap-2">
            {!accepted ? <Lock className="size-4 text-muted-foreground" aria-hidden /> : null}
            <Switch
              id="public-summary"
              checked={report.publicSummaryApproved}
              disabled={!accepted || !canApprove || toggle.isPending}
              onCheckedChange={(approved) =>
                toggle.mutate(
                  { year: report.year, approved },
                  {
                    onSuccess: () =>
                      toast.success(
                        approved ? 'Public summary approved' : 'Public summary withdrawn',
                      ),
                  },
                )
              }
            />
          </div>
        </div>
        <Button type="button" variant="outline" className="w-fit" onClick={onPreview}>
          <Eye /> Preview public summary
        </Button>
      </div>
    </SectionCard>
  )
}
