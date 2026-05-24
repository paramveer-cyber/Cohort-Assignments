import Arc from '../components/Arc'
import Controls from '../components/Controls'
import LapList from '../components/LapList'
import StatusBar from '../components/StatusBar'
import TimeDisplay from '../components/TimeDisplay'
import { useStopwatch } from '../hooks/useStopwatch'
import s from './Page.module.css'

function pad2(n) { return String(Math.floor(n)).padStart(2, '0') }

function fmt(ms) {
  const m = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  const cs = Math.floor((ms % 1000) / 10)
  return { main: `${pad2(m)}:${pad2(sec)}`, sub: `.${String(cs).padStart(2, '0')}` }
}

export default function StopwatchPage() {
  const { elapsed, running, laps, start, pause, reset, lap } = useStopwatch()
  const { main, sub } = fmt(elapsed)
  const pct = ((elapsed / 1000) % 60) / 60
  const status = elapsed === 0 && !running ? 'ready' : running ? 'running' : 'paused'

  const buttons = [
    {
      label: elapsed === 0 && !running ? 'Start' : running ? 'Pause' : 'Resume',
      onClick: running ? pause : start,
      primary: true,
    },
    { label: 'Lap', onClick: lap, disabled: !running },
    { label: 'Reset', onClick: reset, disabled: elapsed === 0 && !running },
  ]

  return (
    <div className={s.page}>
      <Arc pct={pct}>
        <TimeDisplay main={main} sub={sub} label="elapsed" />
      </Arc>
      <Controls buttons={buttons} />
      <LapList laps={laps} />
      <StatusBar status={status} right={laps.length ? `${laps.length} laps` : null} />
    </div>
  )
}
