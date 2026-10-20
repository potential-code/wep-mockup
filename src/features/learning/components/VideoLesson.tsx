import type { Lesson } from '@shared/types'
import { Captions, FileText, Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/** Styled player placeholder: poster, play button and a simulated progress bar (no real video). */
export function VideoLesson({ lesson, poster }: { lesson: Lesson; poster: string }) {
  const [playing, setPlaying] = useState(false)
  const [pct, setPct] = useState(0)
  const [captions, setCaptions] = useState(true)
  const [showTranscript, setShowTranscript] = useState(false)
  const total = lesson.minutes * 60
  const sentences = useMemo(
    () => (lesson.transcript ?? lesson.summary).split(/(?<=[.?!])\s+/).filter(Boolean),
    [lesson],
  )

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => {
      setPct((p) => {
        if (p >= 100) {
          setPlaying(false)
          return 100
        }
        return Math.min(100, p + 1.2)
      })
    }, 120)
    return () => clearInterval(t)
  }, [playing])

  const caption =
    sentences[Math.min(sentences.length - 1, Math.floor((pct / 100) * sentences.length))]
  const ended = pct >= 100

  return (
    <div className="grid gap-4">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-navy-900 shadow-card">
        <img src={poster} alt="" className="absolute inset-0 size-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/20 to-transparent" />
        <button
          type="button"
          onClick={() => {
            if (ended) setPct(0)
            setPlaying((p) => !p)
          }}
          aria-label={playing ? 'Pause video' : ended ? 'Replay video' : 'Play video'}
          className="absolute inset-0 m-auto grid size-16 place-items-center rounded-full bg-white/95 text-navy shadow-lift transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {playing ? (
            <Pause className="size-7" aria-hidden />
          ) : ended ? (
            <RotateCcw className="size-7" aria-hidden />
          ) : (
            <Play className="size-7 translate-x-0.5" aria-hidden />
          )}
        </button>
        {captions && (playing || pct > 0) ? (
          <p
            aria-live="off"
            className="absolute inset-x-6 bottom-14 mx-auto max-w-2xl rounded-md bg-black/70 px-3 py-1.5 text-center text-sm text-white"
          >
            {caption}
          </p>
        ) : null}
        <div className="absolute inset-x-4 bottom-3 flex items-center gap-3 text-white text-xs">
          <span className="tabular-nums">{clock((pct / 100) * total)}</span>
          <div
            role="progressbar"
            aria-label="Video progress (simulated)"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/30"
          >
            <div className="h-full rounded-full bg-coral" style={{ width: `${pct}%` }} />
          </div>
          <span className="tabular-nums">{clock(total)}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          aria-pressed={captions}
          onClick={() => setCaptions((c) => !c)}
          className={cn(captions && 'border-blue bg-blue-50 text-blue-600')}
        >
          <Captions aria-hidden /> Captions {captions ? 'on' : 'off'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-expanded={showTranscript}
          onClick={() => setShowTranscript((s) => !s)}
        >
          <FileText aria-hidden /> {showTranscript ? 'Hide' : 'Show'} transcript
        </Button>
        <span className="text-muted-foreground text-xs">
          Demo video: playback is simulated for this mockup.
        </span>
      </div>
      {showTranscript ? (
        <section aria-label="Transcript" className="rounded-xl border bg-muted/40 p-4 text-sm">
          <p className="max-w-prose leading-relaxed">{lesson.transcript ?? lesson.summary}</p>
        </section>
      ) : null}
    </div>
  )
}
