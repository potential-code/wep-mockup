import { Star } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useSubmitBookingFeedback } from '@/queries/mentorship.queries'

export function FeedbackDialog({
  bookingId,
  mentorName,
  open,
  onOpenChange,
}: {
  bookingId: string
  mentorName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const submit = useSubmitBookingFeedback()
  const send = async () => {
    await submit.mutateAsync({ id: bookingId, rating, comment: comment.trim() })
    toast.success('Thank you. Your feedback was shared with the programme team.')
    onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How was your session with {mentorName}?</DialogTitle>
          <DialogDescription>
            Ratings help UN Women keep the expert network useful. Your comment is not shown to the
            expert by name.
          </DialogDescription>
        </DialogHeader>
        <fieldset className="grid gap-2">
          <legend className="mb-1 font-medium text-sm">Rating</legend>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
                aria-pressed={rating === n}
                onClick={() => setRating(n)}
                className="grid size-10 place-items-center rounded-lg hover:bg-coral-50 focus-visible:outline-2"
              >
                <Star
                  className={cn(
                    'size-6',
                    n <= rating ? 'fill-coral text-coral' : 'text-muted-foreground',
                  )}
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-1.5">
          <Label htmlFor="fb-comment">Comment (optional)</Label>
          <Textarea
            id="fb-comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submit.isPending}>
            Not now
          </Button>
          <Button disabled={rating === 0 || submit.isPending} onClick={send}>
            {submit.isPending ? 'Sending…' : 'Send feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
