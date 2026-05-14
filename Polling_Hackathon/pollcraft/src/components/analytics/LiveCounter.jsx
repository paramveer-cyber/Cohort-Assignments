import { useEffect, useRef, useState } from 'react'

export default function LiveCounter({ value, label, accent = false, large = false }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    if (value === prev.current) return
    const start = prev.current
    const diff = value - start
    if (diff === 0) return
    const duration = 600
    const startTime = performance.now()
    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + diff * eased))
      if (progress < 1) requestAnimationFrame(tick)
      else prev.current = value
    }
    requestAnimationFrame(tick)
  }, [value])

  return (
    <div className="card p-5">
      <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className={`font-display tracking-wider ${large ? 'text-5xl' : 'text-3xl'}`} style={{ color: accent ? 'var(--signal)' : 'var(--text-primary)' }}>
        {display.toLocaleString()}
      </p>
    </div>
  )
}
