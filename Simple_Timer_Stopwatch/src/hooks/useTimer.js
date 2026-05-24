import { useState, useRef, useCallback } from 'react'

export function useTimer() {
  const [total, setTotal] = useState(300000)
  const [remain, setRemain] = useState(300000)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const startRef = useRef(0)
  const remainRef = useRef(300000)
  const totalRef = useRef(300000)
  const rafRef = useRef(null)

  const tick = useCallback(() => {
    const left = Math.max(0, remainRef.current - (performance.now() - startRef.current))
    setRemain(left)
    if (left <= 0) {
      setRunning(false)
      setDone(true)
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const setDuration = useCallback((ms) => {
    cancelAnimationFrame(rafRef.current)
    totalRef.current = ms
    remainRef.current = ms
    setTotal(ms)
    setRemain(ms)
    setRunning(false)
    setDone(false)
  }, [])

  const start = useCallback(() => {
    if (remainRef.current <= 0) {
      remainRef.current = totalRef.current
      setRemain(totalRef.current)
    }
    startRef.current = performance.now()
    setRunning(true)
    setDone(false)
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const pause = useCallback(() => {
    remainRef.current = Math.max(0, remainRef.current - (performance.now() - startRef.current))
    cancelAnimationFrame(rafRef.current)
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    remainRef.current = totalRef.current
    setRemain(totalRef.current)
    setRunning(false)
    setDone(false)
  }, [])

  return { total, remain, running, done, setDuration, start, pause, reset }
}
