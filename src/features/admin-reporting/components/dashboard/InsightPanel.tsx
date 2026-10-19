import { Link } from '@tanstack/react-router'
import { ArrowRight, Lightbulb, Sparkles } from 'lucide-react'
import { SectionCard } from '@/components/shared/Cards'
import { Button } from '@/components/ui/button'

/** Evidence-based observations with follow-up links and a hand-off to the AI concierge. */
export function InsightPanel({
  insights,
  search,
}: {
  insights: { text: string; to: string }[]
  search: Record<string, unknown>
}) {
  return (
    <SectionCard title="Insights" description="Each links to its evidence.">
      <ul className="grid gap-3">
        {insights.slice(0, 3).map((i) => (
          <li key={i.text} className="flex gap-3 text-sm">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden />
            <p className="min-w-0">
              {i.text}{' '}
              <Link
                to={i.to}
                search={search}
                className="inline-flex items-center gap-1 font-medium text-blue hover:underline"
              >
                View evidence <ArrowRight className="size-3" aria-hidden />
              </Link>
            </p>
          </li>
        ))}
      </ul>
      <Button asChild className="mt-5 w-full sm:w-auto">
        <Link
          to="/portal/concierge"
          search={{ prompt: 'Prepare a portfolio summary with source records' }}
        >
          <Sparkles aria-hidden /> Ask AI for an evidence-linked summary
        </Link>
      </Button>
    </SectionCard>
  )
}
