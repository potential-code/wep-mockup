import { Link } from '@tanstack/react-router'
import { CheckCircle2, Loader2, Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

type Stage = 'prejoin' | 'lobby' | 'live' | 'post'

const mmss = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

/** Simulated session room: prejoin check, lobby, in-session mock, post-session summary. */
export function JoinSessionDialog({
  open,
  onOpenChange,
  title,
  who,
  sessionId,
  sharedContext,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  who: string
  sessionId: string
  sharedContext?: string
}) {
  const [stage, setStage] = useState<Stage>('prejoin')
  const [mic, setMic] = useState(true)
  const [cam, setCam] = useState(true)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (open) {
      setStage('prejoin')
      setSeconds(0)
    }
  }, [open])

  useEffect(() => {
    if (stage !== 'lobby') return
    const t = setTimeout(() => setStage('live'), 1800)
    return () => clearTimeout(t)
  }, [stage])

  useEffect(() => {
    if (stage !== 'live') return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [stage])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Simulated session room for the demo. No camera, microphone or video call is used.
          </DialogDescription>
        </DialogHeader>

        {stage === 'prejoin' ? (
          <div className="grid gap-4">
            <div className="grid aspect-video place-items-center rounded-xl bg-navy text-white/90">
              {cam ? (
                <Video className="size-10" aria-hidden />
              ) : (
                <VideoOff className="size-10" aria-hidden />
              )}
              <span className="text-sm">{cam ? 'Camera preview (simulated)' : 'Camera off'}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="mic-sw">Microphone</Label>
                <Switch id="mic-sw" checked={mic} onCheckedChange={setMic} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="cam-sw">Camera</Label>
                <Switch id="cam-sw" checked={cam} onCheckedChange={setCam} />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">With: {who}</p>
          </div>
        ) : null}

        {stage === 'lobby' ? (
          <div className="grid place-items-center gap-3 py-12 text-center" role="status">
            <Loader2 className="size-8 animate-spin text-blue" aria-hidden />
            <p className="font-medium text-navy">Waiting for the participant to join…</p>
          </div>
        ) : null}

        {stage === 'live' ? (
          <div className="grid gap-3 md:grid-cols-[1fr_14rem]">
            <div className="relative grid aspect-video place-items-center rounded-xl bg-navy-900 text-white">
              <span className="text-lg">{who}</span>
              <span className="absolute top-3 left-3 rounded-full bg-danger px-2 py-0.5 text-xs">
                Live · {mmss(seconds)}
              </span>
              <span className="absolute right-3 bottom-3 grid h-16 w-24 place-items-center rounded-lg bg-white/15 text-xs">
                You {cam ? '' : '(camera off)'}
              </span>
            </div>
            <div className="rounded-xl bg-surface p-3 text-sm">
              <p className="mb-1 font-semibold text-navy">Shared context</p>
              <p className="text-muted-foreground">
                {sharedContext ?? 'Group session: see the roster on the session page.'}
              </p>
            </div>
            <div className="flex justify-center gap-2 md:col-span-2">
              <Button
                variant="outline"
                size="icon"
                aria-label={mic ? 'Mute microphone' : 'Unmute microphone'}
                onClick={() => setMic((m) => !m)}
              >
                {mic ? <Mic aria-hidden /> : <MicOff aria-hidden />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={cam ? 'Turn camera off' : 'Turn camera on'}
                onClick={() => setCam((c) => !c)}
              >
                {cam ? <Video aria-hidden /> : <VideoOff aria-hidden />}
              </Button>
              <Button variant="destructive" onClick={() => setStage('post')}>
                <PhoneOff aria-hidden /> End session
              </Button>
            </div>
          </div>
        ) : null}

        {stage === 'post' ? (
          <div className="grid justify-items-center gap-3 py-8 text-center">
            <CheckCircle2 className="size-10 text-success" aria-hidden />
            <p className="font-heading font-medium text-lg text-navy">Session ended</p>
            <p className="max-w-md text-muted-foreground text-sm">
              Now record attendance, agreed follow-up and your notes. Only the shared note reaches
              the participant. Your private note stays with you.
            </p>
          </div>
        ) : null}

        <DialogFooter>
          {stage === 'prejoin' ? (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => setStage('lobby')}>Join session</Button>
            </>
          ) : null}
          {stage === 'post' ? (
            <Button asChild>
              <Link to="/expert/sessions/$sessionId" params={{ sessionId }}>
                Complete session notes
              </Link>
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
