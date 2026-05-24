import s from './LapList.module.css'

function pad2(n) { return String(Math.floor(n)).padStart(2, '0') }

function fmt(ms) {
  const m = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  const cs = Math.floor((ms % 1000) / 10)
  return `${pad2(m)}:${pad2(sec)}.${String(cs).padStart(2, '0')}`
}

export default function LapList({ laps }) {
  if (!laps.length) return null
  return (
    <div className={s.laps}>
      {laps.map(l => (
        <div key={l.n} className={s.row}>
          <span className={s.num}>L{pad2(l.n)}</span>
          <span className={s.split}>{fmt(l.split)}</span>
          <span className={s.total}>{fmt(l.total)}</span>
        </div>
      ))}
    </div>
  )
}
