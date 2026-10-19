import { POINTS_RULES } from '@shared/rules'
import { Check } from 'lucide-react'
import { DemoLabel, SectionCard } from '@/components/shared/Cards'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function RulesTable() {
  const rows = Object.entries(POINTS_RULES)
  return (
    <SectionCard
      title="How points work"
      description="Points reward verified learning and contribution. One award per unique event, so repeats and reloads never add points twice."
      action={<DemoLabel>Demo rules</DemoLabel>}
      bodyClassName="px-0 sm:px-0"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead className="text-end">Points</TableHead>
            <TableHead>Counts towards clinic</TableHead>
            <TableHead className="hidden md:table-cell">Control</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([key, r]) => (
            <TableRow key={key}>
              <TableCell className="whitespace-normal font-medium text-navy">{r.label}</TableCell>
              <TableCell className="text-end font-semibold tabular-nums">
                {r.amount > 0 ? '+' : '−'}
                {Math.abs(r.amount)}
              </TableCell>
              <TableCell>
                {r.qualifying ? (
                  <span className="inline-flex items-center gap-1 text-success">
                    <Check className="size-4" aria-hidden /> Qualifying
                  </span>
                ) : (
                  <span className="text-muted-foreground">Achievement only</span>
                )}
              </TableCell>
              <TableCell className="hidden whitespace-normal text-muted-foreground md:table-cell">
                {r.control}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="px-5 pt-4 text-muted-foreground text-sm sm:px-6">
        Qualifying points come only from your department’s designated pathway course. Rules are
        proposed for this demo and can be configured by UN Women.
      </p>
    </SectionCard>
  )
}
