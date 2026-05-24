import { useState } from 'react'
import StopwatchPage from './pages/StopwatchPage'
import TimerPage from './pages/TimerPage'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('sw')
  return (
    <div className="card">
      <div className="tabs">
        <button className={`tab ${tab === 'sw' ? 'active' : ''}`} onClick={() => setTab('sw')}>Stopwatch</button>
        <button className={`tab ${tab === 'tm' ? 'active' : ''}`} onClick={() => setTab('tm')}>Timer</button>
      </div>
      {tab === 'sw' ? <StopwatchPage /> : <TimerPage />}
    </div>
  )
}
