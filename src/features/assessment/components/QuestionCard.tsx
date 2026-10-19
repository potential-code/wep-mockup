import type { AssessmentQuestion } from '@shared/types'
import { HelpCircle, Paperclip } from 'lucide-react'
import { useState } from 'react'
import { FileDrop } from '@/components/shared/FileDrop'
import { PrincipleTag } from '@/components/shared/PrincipleTag'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

/** One assessment question: answer control, help text and optional evidence attachments. */
export function QuestionCard({
  question,
  index,
  value,
  evidence,
  onAnswer,
  onEvidence,
}: {
  question: AssessmentQuestion
  index: number
  value: string
  evidence: string[]
  onAnswer: (v: string) => void
  onEvidence: (fileName: string) => void
}) {
  const [attaching, setAttaching] = useState(false)
  const name = `q-${question.id}`
  return (
    <fieldset className="grid gap-3 rounded-2xl border bg-card p-4 shadow-card sm:p-5">
      <legend className="sr-only">Question {index + 1}</legend>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-blue text-xs">Question {index + 1}</span>
        <PrincipleTag id={question.principle} linked={false} />
      </div>
      <p className="font-medium text-navy leading-snug">{question.text}</p>
      {question.help ? (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-1.5 text-blue text-sm hover:underline">
            <HelpCircle className="size-4" aria-hidden /> Why we ask
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 rounded-lg bg-blue-50 p-3 text-sm">
            {question.help}
          </CollapsibleContent>
        </Collapsible>
      ) : null}
      {question.type === 'text' ? (
        <Textarea
          aria-label={question.text}
          rows={4}
          value={value}
          placeholder="Write a few sentences"
          onChange={(e) => onAnswer(e.target.value)}
        />
      ) : (
        <div
          role="radiogroup"
          aria-label={question.text}
          className={cn('grid gap-2', question.type === 'scale' && 'sm:grid-cols-2 lg:grid-cols-4')}
        >
          {question.options?.map((o) => {
            const checked = value === o
            return (
              <label
                key={o}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
                  checked ? 'border-blue bg-blue-50 font-medium text-navy' : 'hover:bg-surface',
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={o}
                  checked={checked}
                  onChange={() => onAnswer(o)}
                  className="size-4 accent-blue"
                />
                {o}
              </label>
            )
          })}
        </div>
      )}
      <div className="grid gap-2">
        {evidence.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="Attached evidence">
            {evidence.map((f) => (
              <li
                key={f}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs"
              >
                <Paperclip className="size-3" aria-hidden /> {f}
              </li>
            ))}
          </ul>
        ) : null}
        {attaching ? (
          <FileDrop
            label="Attach supporting evidence"
            hint="PDF, DOCX or XLSX · demo only, nothing is uploaded"
            accept=".pdf,.docx,.xlsx"
            sampleName="Supporting_policy_document.pdf"
            value={null}
            onChange={(f) => {
              if (f) {
                onEvidence(f.fileName)
                setAttaching(false)
              }
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAttaching(true)}
            className="inline-flex w-fit items-center gap-1.5 text-muted-foreground text-sm hover:text-navy"
          >
            <Paperclip className="size-4" aria-hidden /> Attach evidence
          </button>
        )}
      </div>
    </fieldset>
  )
}
