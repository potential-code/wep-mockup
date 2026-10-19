import type { QuizQuestion } from '@shared/types'
import { Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Field } from './common'

const TRUE_FALSE = ['True', 'False']

export const isTrueFalse = (q: QuizQuestion) =>
  q.options.length === 2 && q.options.every((o, i) => o === TRUE_FALSE[i])

export const blankQuestion = (prefix: string): QuizQuestion => ({
  id: `${prefix}-q${Date.now().toString(36)}`,
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
})

/** Add or edit one test question: multiple choice or true/false, with the correct answer. */
export function QuestionDialog({
  question,
  onClose,
  onSave,
}: {
  question: QuizQuestion | null
  onClose: () => void
  onSave: (q: QuizQuestion) => void
}) {
  const [draft, setDraft] = useState<QuizQuestion | null>(question)
  const [touched, setTouched] = useState(false)
  useEffect(() => {
    setDraft(question)
    setTouched(false)
  }, [question])

  if (!draft) return null
  const tf = isTrueFalse(draft)
  const set = (p: Partial<QuizQuestion>) => setDraft((d) => (d ? { ...d, ...p } : d))
  const filled = draft.options.filter((o) => o.trim())
  const ok = draft.text.trim() && filled.length >= 2 && draft.options[draft.correctIndex]?.trim()

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{question?.text ? 'Edit question' : 'Add question'}</DialogTitle>
          <DialogDescription>
            Mark the correct answer. Learners see the explanation after they submit.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Question" required>
            <Textarea
              value={draft.text}
              onChange={(e) => set({ text: e.target.value })}
              rows={2}
              aria-invalid={touched && !draft.text.trim()}
            />
          </Field>
          <div className="grid gap-1.5 text-sm">
            <span className="font-medium text-navy">Type</span>
            <ToggleGroup
              type="single"
              variant="outline"
              value={tf ? 'tf' : 'mc'}
              onValueChange={(v) => {
                if (!v || (v === 'tf') === tf) return
                set(
                  v === 'tf'
                    ? { options: [...TRUE_FALSE], correctIndex: 0 }
                    : { options: ['', '', '', ''], correctIndex: 0 },
                )
              }}
              aria-label="Question type"
              className="w-fit"
            >
              <ToggleGroupItem value="mc">Multiple choice</ToggleGroupItem>
              <ToggleGroupItem value="tf">True or false</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <fieldset className="grid gap-2">
            <legend className="mb-1 font-medium text-navy text-sm">
              Answers (select the correct one)
            </legend>
            <RadioGroup
              value={String(draft.correctIndex)}
              onValueChange={(v) => set({ correctIndex: Number(v) })}
              className="grid gap-2"
            >
              {draft.options.map((o, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: options are positional
                <div key={i} className="flex items-center gap-2">
                  <RadioGroupItem value={String(i)} aria-label={`Answer ${i + 1} is correct`} />
                  {tf ? (
                    <span className="text-sm">{o}</span>
                  ) : (
                    <>
                      <Input
                        value={o}
                        aria-label={`Answer ${i + 1}`}
                        onChange={(e) =>
                          set({
                            options: draft.options.map((x, j) => (j === i ? e.target.value : x)),
                          })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove answer ${i + 1}`}
                        disabled={draft.options.length <= 2}
                        onClick={() =>
                          set({
                            options: draft.options.filter((_, j) => j !== i),
                            correctIndex:
                              draft.correctIndex === i
                                ? 0
                                : draft.correctIndex > i
                                  ? draft.correctIndex - 1
                                  : draft.correctIndex,
                          })
                        }
                      >
                        <X />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </RadioGroup>
            {!tf && draft.options.length < 6 ? (
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => set({ options: [...draft.options, ''] })}
              >
                <Plus aria-hidden /> Add answer
              </Button>
            ) : null}
          </fieldset>
          <Field label="Explanation">
            <Textarea
              value={draft.explanation}
              onChange={(e) => set({ explanation: e.target.value })}
              rows={2}
            />
          </Field>
          {touched && !ok ? (
            <p role="alert" className="text-danger text-sm">
              Add the question, at least two answers, and mark a correct answer that is filled in.
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setTouched(true)
              if (!ok) return
              const correct = draft.options[draft.correctIndex] ?? ''
              const options = draft.options.filter((o) => o.trim())
              onSave({ ...draft, options, correctIndex: Math.max(0, options.indexOf(correct)) })
            }}
          >
            Save question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
