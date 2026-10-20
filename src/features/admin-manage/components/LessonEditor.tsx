import type { Lesson, LessonType, QuizQuestion } from '@shared/types'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Field } from './common'

const TYPES: { id: LessonType; label: string }[] = [
  { id: 'video', label: 'Video' },
  { id: 'reading', label: 'Reading' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'reflection', label: 'Reflection' },
]

const blankQuestion = (n: number): QuizQuestion => ({
  id: `q-${Date.now().toString(36)}${n}`,
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
})

/** Side sheet to edit one lesson: type, length, body text and quiz questions. */
export function LessonEditor({
  lesson,
  onClose,
  onSave,
}: {
  lesson: Lesson | null
  onClose: () => void
  onSave: (lesson: Lesson) => void
}) {
  // The course builder edits units here; the post-test quiz has its own card.
  const types = TYPES.filter((t) => t.id !== 'quiz' || lesson?.type === 'quiz')
  const [draft, setDraft] = useState<Lesson | null>(lesson)
  const [touched, setTouched] = useState(false)
  useEffect(() => {
    setDraft(lesson)
    setTouched(false)
  }, [lesson])

  const set = (patch: Partial<Lesson>) => setDraft((d) => (d ? { ...d, ...patch } : d))
  const questions = draft?.quiz ?? []
  const setQuestion = (i: number, patch: Partial<QuizQuestion>) =>
    set({ quiz: questions.map((q, j) => (j === i ? { ...q, ...patch } : q)) })

  const titleOk = Boolean(draft?.title.trim())
  const quizOk =
    draft?.type !== 'quiz' ||
    (questions.length > 0 &&
      questions.every((q) => q.text.trim() && q.options.filter((o) => o.trim()).length >= 2))

  return (
    <Sheet open={Boolean(lesson)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Edit unit</SheetTitle>
          <SheetDescription>
            The course saves automatically when you save the unit.
          </SheetDescription>
        </SheetHeader>
        {draft ? (
          <div className="grid gap-4 px-4 pb-4">
            <Field label="Unit title" required>
              <Input
                value={draft.title}
                onChange={(e) => set({ title: e.target.value })}
                aria-invalid={touched && !titleOk}
              />
              {touched && !titleOk ? (
                <span role="alert" className="text-danger text-xs">
                  A title is required.
                </span>
              ) : null}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                <Select
                  value={draft.type}
                  onValueChange={(v) =>
                    set({
                      type: v as LessonType,
                      quiz: v === 'quiz' && !draft.quiz?.length ? [blankQuestion(0)] : draft.quiz,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Duration (minutes)">
                <Input
                  type="number"
                  min={1}
                  value={draft.minutes}
                  onChange={(e) => set({ minutes: Math.max(1, Number(e.target.value) || 1) })}
                />
              </Field>
            </div>
            <Field label="Summary" hint="Shown in the lesson list.">
              <Textarea
                value={draft.summary}
                onChange={(e) => set({ summary: e.target.value })}
                rows={2}
              />
            </Field>
            <Field label="Body" hint="Separate paragraphs with a blank line.">
              <Textarea
                value={draft.body.join('\n\n')}
                onChange={(e) =>
                  set({
                    body: e.target.value
                      .split(/\n{2,}/)
                      .map((p) => p.trim())
                      .filter(Boolean),
                  })
                }
                rows={8}
              />
            </Field>
            {draft.type === 'reflection' ? (
              <Field label="Reflection prompt">
                <Textarea
                  value={draft.reflectionPrompt ?? ''}
                  onChange={(e) => set({ reflectionPrompt: e.target.value })}
                  rows={2}
                />
              </Field>
            ) : null}
            {draft.type === 'quiz' ? (
              <section className="grid gap-3">
                <h3 className="font-heading font-medium text-navy text-sm">
                  Quiz questions ({questions.length})
                </h3>
                {questions.map((q, i) => (
                  <fieldset key={q.id} className="grid gap-2 rounded-xl border bg-surface/50 p-3">
                    <legend className="px-1 font-medium text-navy text-xs">Question {i + 1}</legend>
                    <Input
                      aria-label={`Question ${i + 1} text`}
                      value={q.text}
                      placeholder="Question text"
                      onChange={(e) => setQuestion(i, { text: e.target.value })}
                    />
                    {q.options.map((o, oi) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: fixed option slots
                      <div key={`${q.id}-o${oi}`} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctIndex === oi}
                          onChange={() => setQuestion(i, { correctIndex: oi })}
                          aria-label={`Mark option ${oi + 1} correct`}
                          className="size-4 accent-blue"
                        />
                        <Input
                          aria-label={`Question ${i + 1} option ${oi + 1}`}
                          value={o}
                          placeholder={`Option ${oi + 1}`}
                          onChange={(e) =>
                            setQuestion(i, {
                              options: q.options.map((x, k) => (k === oi ? e.target.value : x)),
                            })
                          }
                        />
                      </div>
                    ))}
                    <Input
                      aria-label={`Question ${i + 1} explanation`}
                      value={q.explanation}
                      placeholder="Explanation shown after answering"
                      onChange={(e) => setQuestion(i, { explanation: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="justify-self-start text-danger"
                      onClick={() => set({ quiz: questions.filter((_, j) => j !== i) })}
                    >
                      <Trash2 aria-hidden /> Remove question
                    </Button>
                  </fieldset>
                ))}
                {touched && !quizOk ? (
                  <p role="alert" className="text-danger text-xs">
                    Each question needs text and at least two options.
                  </p>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="justify-self-start"
                  onClick={() => set({ quiz: [...questions, blankQuestion(questions.length)] })}
                >
                  <Plus aria-hidden /> Add question
                </Button>
              </section>
            ) : null}
          </div>
        ) : null}
        <SheetFooter className="flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setTouched(true)
              if (!draft || !titleOk || !quizOk) return
              const cleaned =
                draft.type === 'quiz'
                  ? {
                      ...draft,
                      quiz: questions.map((q) => ({
                        ...q,
                        options: q.options.filter((o) => o.trim()),
                      })),
                    }
                  : draft
              onSave(cleaned)
            }}
          >
            Save unit
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
