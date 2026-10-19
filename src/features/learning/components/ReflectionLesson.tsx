import { Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSaveReflection } from '@/queries/learning.queries'

/** Reflection prompt with a saved textarea. Saved text is private to the learner. */
export function ReflectionLesson({
  courseId,
  lessonId,
  prompt,
  initial,
  value,
  onChange,
}: {
  courseId: string
  lessonId: string
  prompt: string
  initial: string
  value: string
  onChange: (v: string) => void
}) {
  const save = useSaveReflection()
  const [savedText, setSavedText] = useState(initial)
  const dirty = value !== savedText
  return (
    <div className="grid gap-3 rounded-2xl border bg-card p-5 shadow-card">
      <Label htmlFor="reflection" className="font-heading font-semibold text-base text-navy">
        {prompt}
      </Label>
      <Textarea
        id="reflection"
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a few sentences. Only you can see this."
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          disabled={!dirty || save.isPending}
          onClick={() =>
            save.mutate(
              { courseId, lessonId, text: value },
              {
                onSuccess: () => {
                  setSavedText(value)
                  toast.success('Reflection saved')
                },
              },
            )
          }
        >
          <Save aria-hidden /> {save.isPending ? 'Saving…' : 'Save reflection'}
        </Button>
        <span className="text-muted-foreground text-xs" aria-live="polite">
          {dirty ? 'Unsaved changes' : savedText ? 'Saved' : 'Private to you'}
        </span>
      </div>
    </div>
  )
}
