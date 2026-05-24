import { useState, useRef, useCallback } from 'react'

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState([])
  const startRef = useRef(0)
  const elapsedRef = useRef(0)
  const lapStartRef = useRef(0)
  const rafRef = useRef(null)

  const tick = useCallback(() => {
    setElapsed(elapsedRef.current + (performance.now() - startRef.current))
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const start = useCallback(() => {
    startRef.current = performance.now()
    setRunning(true)
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const pause = useCallback(() => {
    elapsedRef.current += performance.now() - startRef.current
    cancelAnimationFrame(rafRef.current)
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    elapsedRef.current = 0
    lapStartRef.current = 0
    setElapsed(0)
    setRunning(false)
    setLaps([])
  }, [])

  const lap = useCallback(() => {
    const total = elapsedRef.current + (performance.now() - startRef.current)
    const split = total - lapStartRef.current
    lapStartRef.current = total
    setLaps(prev => [{ n: prev.length + 1, split, total }, ...prev])
  }, [])

  return { elapsed, running, laps, start, pause, reset, lap }
}
