import { useState } from 'react'
import Arc from '../components/Arc'
import Controls from '../components/Controls'
import StatusBar from '../components/StatusBar'
import TimeDisplay from '../components/TimeDisplay'
import { useTimer } from '../hooks/useTimer'
import s from './Page.module.css'
import ts from './TimerPage.module.css'

function pad2(n) { return String(Math.floor(n)).padStart(2, '0') }

function fmt(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return h > 0 ? `${pad2(h)}:${pad2(m)}:${pad2(sec)}` : `${pad2(m)}:${pad2(sec)}`
}

export default function TimerPage() {
  const { total, remain, running, done, setDuration, start, pause, reset } = useTimer()
  const [h, setH] = useState(0)
  const [m, setM] = useState(5)
  const [sec, setSec] = useState(0)

  const pct = total > 0 ? remain / total : 1
  const status = done ? 'done' : remain === total && !running ? 'ready' : running ? 'running' : 'paused'
  const subTxt = done ? 'finished' : running ? '' : 'remaining'

  function apply(nh, nm, ns) {
    setDuration((nh * 3600 + nm * 60 + ns) * 1000)
  }

  const buttons = [
    {
      label: done ? 'Start' : running ? 'Pause' : remain < total ? 'Resume' : 'Start',
      onClick: running ? pause : start,
      primary: true,
      disabled: total === 0,
    },
    { label: 'Reset', onClick: reset },
  ]

  return (
    <div className={s.page}>
      <Arc pct={pct}>
        <TimeDisplay main={fmt(remain)} sub={null} label="remaining" />
        {subTxt && <span className={ts.subTxt}>{subTxt}</span>}
      </Arc>

      {!running && !done && (
        <div className={ts.inputs}>
          <div className={ts.group}>
            <input
              className={ts.numInput} type="number" min="0" max="23" value={h}
              onChange={e => { const v = Math.max(0, parseInt(e.target.value) || 0); setH(v); apply(v, m, sec) }}
            />
            <span className={ts.inputLabel}>hr</span>
          </div>
          <span className={ts.colon}>:</span>
          <div className={ts.group}>
            <input
              className={ts.numInput} type="number" min="0" max="59" value={m}
              onChange={e => { const v = Math.min(59, Math.max(0, parseInt(e.target.value) || 0)); setM(v); apply(h, v, sec) }}
            />
            <span className={ts.inputLabel}>min</span>
          </div>
          <span className={ts.colon}>:</span>
          <div className={ts.group}>
            <input
              className={ts.numInput} type="number" min="0" max="59" value={sec}
              onChange={e => { const v = Math.min(59, Math.max(0, parseInt(e.target.value) || 0)); setSec(v); apply(h, m, v) }}
            />
            <span className={ts.inputLabel}>sec</span>
          </div>
        </div>
      )}

      <Controls buttons={buttons} />
      <StatusBar status={status} right={running ? `${Math.ceil(pct * 100)}%` : null} />
    </div>
  )
}
