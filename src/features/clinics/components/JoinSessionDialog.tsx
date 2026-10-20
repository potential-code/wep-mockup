import { Mic, MicOff, Video, VideoOff } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/** Simulated "join" room: no real meeting is started. */
export function JoinSessionDialog({
  open,
  onOpenChange,
  title,
  facilitator,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  facilitator: string
}) {
  const [mic, setMic] = useState(true)
  const [cam, setCam] = useState(false)
  const [joined, setJoined] = useState(false)
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) setJoined(false)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{joined ? 'You are in the session' : 'Ready to join?'}</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>
        <div className="grid aspect-video place-items-center rounded-xl bg-navy text-white">
          <div className="grid gap-1 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-white/15 font-heading font-medium text-xl">
              {facilitator
                .split(' ')
                .map((w) => w[0])
                .join('')}
            </span>
            <p className="text-sm">{joined ? `${facilitator} is presenting` : 'Waiting room'}</p>
            {joined ? <p className="text-white/90 text-xs">Simulated live view</p> : null}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-pressed={mic}
              aria-label={mic ? 'Mute microphone' : 'Unmute microphone'}
              onClick={() => setMic(!mic)}
            >
              {mic ? <Mic aria-hidden /> : <MicOff aria-hidden />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-pressed={cam}
              aria-label={cam ? 'Turn camera off' : 'Turn camera on'}
              onClick={() => setCam(!cam)}
            >
              {cam ? <Video aria-hidden /> : <VideoOff aria-hidden />}
            </Button>
          </div>
          {joined ? (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Leave session
            </Button>
          ) : (
            <Button onClick={() => setJoined(true)}>Join session</Button>
          )}
        </div>
        <p className="text-muted-foreground text-xs justify-self-start">
          Demo only: no real meeting is started
        </p>
      </DialogContent>
    </Dialog>
  )
}
