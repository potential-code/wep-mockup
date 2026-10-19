import { Link } from '@tanstack/react-router'
import { CheckCircle2, FileBadge2, RotateCcw, XCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { celebrate } from '@/components/motion/Celebrate'
import { Button } from '@/components/ui/button'

export interface ExamOutcome {
  score: number
  correct: number
  total: number
  passed: boolean
  passMark: number
}

export function ExamResult({
  outcome,
  purchaseId,
  onRetry,
}: {
  outcome: ExamOutcome
  purchaseId: string
  onRetry: () => void
}) {
  useEffect(() => {
    if (outcome.passed) celebrate()
  }, [outcome.passed])
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto grid max-w-xl justify-items-center gap-4 rounded-2xl border bg-card p-8 text-center shadow-card"
      role="status"
    >
      {outcome.passed ? (
        <CheckCircle2 className="size-14 text-success" aria-hidden />
      ) : (
        <XCircle className="size-14 text-danger" aria-hidden />
      )}
      <h2 className="font-heading font-bold text-2xl text-navy">
        {outcome.passed ? 'You passed' : 'Not passed yet'}
      </h2>
      <p className="font-heading font-bold text-5xl text-navy">{outcome.score}%</p>
      <p className="text-muted-foreground text-sm">
        {outcome.correct} of {outcome.total} correct. Pass mark: {outcome.passMark}%.
      </p>
      {outcome.passed ? (
        <>
          <p className="rounded-lg bg-success-soft px-3 py-1.5 font-medium text-sm">
            Certificate issued
          </p>
          <Button asChild size="lg">
            <Link to="/portal/certification/credential/$purchaseId" params={{ purchaseId }}>
              <FileBadge2 /> View credential
            </Link>
          </Button>
        </>
      ) : (
        <>
          <p className="max-w-sm text-sm">
            Your score was {outcome.passMark - outcome.score} points below the pass mark. Your
            payment stands; you can retry the exam. Retake limits are a configurable decision.
          </p>
          <Button size="lg" onClick={onRetry}>
            <RotateCcw /> Retry exam
          </Button>
        </>
      )}
      <Button asChild variant="ghost">
        <Link to="/portal/certification">Back to certifications</Link>
      </Button>
    </motion.div>
  )
}
