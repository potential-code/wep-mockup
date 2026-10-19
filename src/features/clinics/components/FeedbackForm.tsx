import { Star } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useSubmitFeedback } from '@/queries/clinics.queries'

/** Post-session feedback. Awards +10 points once. */
export function FeedbackForm({
  eventId,
  existing,
}: {
  eventId: string
  existing?: { rating: number; comment: string }
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const submit = useSubmitFeedback()

  if (existing)
    return (
      <p className="rounded-xl bg-success-soft/60 p-4 text-sm">
        Thank you. You rated this session {existing.rating} out of 5.
      </p>
    )
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!rating) return toast.error('Please choose a rating first.')
        submit.mutate(
          { eventId, rating, comment },
          {
            onSuccess: (r) =>
              toast.success(
                r.pointsAwarded
                  ? `Thanks for your feedback. +${r.pointsAwarded} points`
                  : 'Thanks for your feedback',
              ),
          },
        )
      }}
    >
      <fieldset className="grid gap-2">
        <legend className="mb-1 font-medium text-navy text-sm">How useful was this session?</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              aria-label={`${n} out of 5`}
              aria-pressed={rating === n}
              onClick={() => setRating(n)}
              className="rounded p-1 focus-visible:outline-2 focus-visible:outline-blue"
            >
              <Star
                className={cn(
                  'size-7',
                  n <= rating ? 'fill-gold text-gold' : 'text-muted-foreground',
                )}
                aria-hidden
              />
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-1.5">
        <Label htmlFor="fb-comment">Comments (optional)</Label>
        <Textarea
          id="fb-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      </div>
      <Button type="submit" disabled={submit.isPending} className="justify-self-start">
        {submit.isPending ? 'Sending…' : 'Submit feedback (+10 points)'}
      </Button>
    </form>
  )
}
