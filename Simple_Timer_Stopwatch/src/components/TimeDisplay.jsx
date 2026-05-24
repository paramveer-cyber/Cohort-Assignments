import s from './TimeDisplay.module.css'

export default function TimeDisplay({ main, sub, label }) {
  return (
    <>
      <span className={s.main}>{main}</span>
      {sub && <span className={s.sub}>{sub}</span>}
      <span className={s.label}>{label}</span>
    </>
  )
}
