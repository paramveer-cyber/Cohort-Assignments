import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell
} from 'recharts'
import { useTheme } from '../../context/ThemeContext.jsx'

function useChartColors() {
  const { theme } = useTheme()
  return theme.chart
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border-default)',
      borderRadius: 2,
      padding: '8px 12px',
      boxShadow: 'var(--shadow-card)',
    }}>
      <p className="text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold font-body" style={{ color: entry.color || 'var(--brand)' }}>
          {entry.value} {entry.name || 'votes'}
        </p>
      ))}
    </div>
  )
}

export function VotesBarChart({ options }) {
  const colors = useChartColors()
  const total = options.reduce((s, o) => s + o.votes, 0)
  const data = options.map(o => ({
    name: o.text.length > 16 ? o.text.slice(0, 16) + '…' : o.text,
    votes: o.votes,
    pct: total > 0 ? Math.round((o.votes / total) * 100) : 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 4 }} barCategoryGap="30%">
        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-700)', opacity: 0.4 }} />
        <Bar dataKey="votes" radius={[2, 2, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ParticipationChart({ data }) {
  const formatted = data.map(d => ({
    time: new Date(d.hour).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    count: d.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -24, bottom: 4 }}>
        <defs>
          <linearGradient id="countGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.15} />
            <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="count" stroke="var(--brand)" strokeWidth={1.5} fill="url(#countGrad)" dot={false} activeDot={{ r: 3, fill: 'var(--brand-light)', stroke: 'var(--card-bg)', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function VoteBreakdown({ options }) {
  const colors = useChartColors()
  const total = options.reduce((s, o) => s + o.votes, 0)

  return (
    <div className="space-y-3">
      {options.map((opt, i) => {
        const pct = total > 0 ? (opt.votes / total) * 100 : 0
        return (
          <div key={opt.id} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-body" style={{ color: 'var(--text-secondary)' }}>{opt.text}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{opt.votes} votes</span>
                <span className="font-mono text-sm font-medium" style={{ color: colors[i % colors.length] }}>{pct.toFixed(1)}%</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-600)' }}>
              <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
