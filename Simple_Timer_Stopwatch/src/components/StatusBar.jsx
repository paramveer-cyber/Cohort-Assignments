import s from './StatusBar.module.css'

export default function StatusBar({ status, right }) {
  return (
    <div className={s.bar}>
      <div className={s.left}>
        <span className={`${s.dot} ${status === 'running' ? s.active : ''}`} />
        <span className={s.txt}>{status}</span>
      </div>
      {right && <span className={s.txt}>{right}</span>}
    </div>
  )
}
