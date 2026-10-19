import { useCallback, useEffect, useRef, useState } from 'react'

export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

/** Debounced autosave. `save` receives the latest value; flush() saves immediately. */
export function useAutosave<T>(save: (value: T) => Promise<unknown>, delay = 900) {
  const [state, setState] = useState<SaveState>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const latest = useRef<T | undefined>(undefined)
  const saveRef = useRef(save)
  saveRef.current = save

  const run = useCallback(async () => {
    if (latest.current === undefined) return
    setState('saving')
    try {
      await saveRef.current(latest.current)
      setState('saved')
    } catch {
      setState('error')
    }
  }, [])

  const schedule = useCallback(
    (value: T) => {
      latest.current = value
      setState('dirty')
      clearTimeout(timer.current)
      timer.current = setTimeout(run, delay)
    },
    [run, delay],
  )

  const flush = useCallback(
    (value: T) => {
      latest.current = value
      clearTimeout(timer.current)
      return run()
    },
    [run],
  )

  useEffect(() => () => clearTimeout(timer.current), [])
  return { state, schedule, flush }
}
