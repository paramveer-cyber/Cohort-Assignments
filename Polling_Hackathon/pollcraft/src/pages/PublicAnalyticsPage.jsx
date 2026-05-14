import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { pollsApi } from '../api/index.js'
import { useSocket } from '../hooks/useSocket.js'
import { useAuth } from '../context/AuthContext.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import { ToastProvider } from '../components/ui/Toast.jsx'
import { SkeletonAnalytics } from '../components/ui/Skeleton.jsx'
import LiveCounter from '../components/analytics/LiveCounter.jsx'
import { VotesBarChart, ParticipationChart, VoteBreakdown } from '../components/analytics/Charts.jsx'
import { ArrowLeft, Wifi, WifiOff, Activity, Globe, Lock, Users, Clock, Eye, Calendar, Download, Share2 } from 'lucide-react'
import { GeoBg } from '../components/ui/BauhausAccents.jsx'
import ShareCard from '../components/poll/ShareCard.jsx'

function AccessBlock({ icon: Icon, title, message, onBack }) {
  return (
    <div className="min-h-screen pt-14 flex items-center justify-center px-4" style={{ background: "var(--page-bg)" }}>
      <div className="card p-10 max-w-sm w-full text-center">
        <Icon size={32} className="[color:var(--border-default)] mx-auto mb-4" />
        <h2 className="text-xl font-semibold [color:var(--text-primary)] mb-2">{title}</h2>
        <p className="[color:var(--text-muted)] text-sm mb-6">{message}</p>
        <button onClick={onBack} className="btn-secondary w-full justify-center">
          Back to Discover
        </button>
      </div>
    </div>
  )
}

function csvEscape(val) {
  const s = val == null ? '' : String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

function exportCSV(results) {
  const title = results.pollTitle || 'poll'
  console.log(results)
  const questions = results.questions || []
  const rows = []
  rows.push(['Made using PollNow, :)'])
  rows.push(['Total Responses', String(results.totalResponses ?? 0)])
  rows.push(['Computed At', csvEscape(results.computedAt ? new Date(results.computedAt).toISOString() : '')])
  rows.push([])
  rows.push(['Question #', 'Question', 'Option', 'Votes', 'Percentage'])
  questions.forEach((q, qi) => {
    const totalQ = q.options.reduce((s, o) => s + o.votes, 0)
    q.options.forEach(opt => {
      const pct = totalQ > 0 ? ((opt.votes / totalQ) * 100).toFixed(1) + '%' : '0.0%'
      rows.push([String(qi + 1), csvEscape(q.content), csvEscape(opt.text), String(opt.votes), pct])
    })
    rows.push([])
  })
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-results.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function PublicAnalyticsContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorState, setErrorState] = useState(null)
  const [socketConnected, setSocketConnected] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [viewerCount, setViewerCount] = useState(0)
  const [showShareCard, setShowShareCard] = useState(false)
  const pollInterval = useRef(null)

  const loadResults = useCallback(async () => {
    try {
      const { analytics } = await pollsApi.results(id)
      setResults(analytics)
      setLastUpdated(new Date())
    } catch { }
  }, [id])

  useEffect(() => {
    pollsApi.results(id)
      .then(({ analytics }) => {
        setResults(analytics)
        setLastUpdated(new Date())
      })
      .catch(err => {
        setErrorState({ status: err.status, message: err.message })
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleCount = useCallback((data) => {
    setResults(prev => prev ? { ...prev, totalResponses: data.totalResponses } : prev)
  }, [])

  const handleViewerCount = useCallback((data) => {
    setViewerCount(data.count)
  }, [])

  useSocket(id, {
    onCount: handleCount,
    onResponse: () => loadResults(),
    onConnect: () => setSocketConnected(true),
    onDisconnect: () => {
      setSocketConnected(false)
      if (!pollInterval.current) {
        pollInterval.current = setInterval(loadResults, 5000)
      }
    },
    onViewerCount: handleViewerCount,
  })

  useEffect(() => {
    setSocketConnected(true)
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen pt-14" style={{ background: "var(--page-bg)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <SkeletonAnalytics />
        </div>
      </div>
    )
  }

  if (errorState) {
    if (errorState.status === 403) {
      return (
        <AccessBlock
          icon={Lock}
          title="ACCESS RESTRICTED"
          message="Results for this poll are only visible to the creator or respondents who submitted a response."
          onBack={() => navigate('/discover')}
        />
      )
    }
    if (errorState.status === 404) {
      return (
        <AccessBlock
          icon={Globe}
          title="NOT FOUND"
          message="This poll does not exist or has been removed."
          onBack={() => navigate('/discover')}
        />
      )
    }
    if (errorState.status === 423 || (errorState.message || '').toLowerCase().includes('scheduled')) {
      return (
        <AccessBlock
          icon={Calendar}
          title="NOT YET PUBLISHED"
          message="This poll is scheduled for future publication. Check back later."
          onBack={() => navigate('/discover')}
        />
      )
    }
    if ((errorState.message || '').toLowerCase().includes('unpublished') || (errorState.message || '').toLowerCase().includes('not published')) {
      return (
        <AccessBlock
          icon={Clock}
          title="RESULTS NOT PUBLISHED"
          message="The creator has not published results for this poll yet."
          onBack={() => navigate('/discover')}
        />
      )
    }
    return (
      <AccessBlock
        icon={Globe}
        title="RESULTS UNAVAILABLE"
        message="Results for this poll are not currently available."
        onBack={() => navigate('/discover')}
      />
    )
  }

  if (!results) return null

  const questions = results.questions || []
  const totalVotes = questions.reduce((sum, q) =>
    sum + q.options.reduce((s, o) => s + o.votes, 0), 0
  )

  const liveIndicator = (
    <div className={`flex items-center gap-1.5 text-xs font-mono ${socketConnected ? 'text-signal' : '[color:var(--text-muted)]'}`}>
      {socketConnected ? (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse-slow" />
          <Wifi size={12} />
          LIVE
        </>
      ) : (
        <>
          <WifiOff size={12} />
          POLLING
        </>
      )}
    </div>
  )

  return (
    <>
    <div className="min-h-screen pt-14" style={{ background: "var(--page-bg)" }}>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <GeoBg />
        <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex items-start justify-between mb-8 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/discover')} className="[color:var(--text-muted)] hover:[color:var(--text-primary)] shrink-0 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="font-display text-3xl sm:text-4xl [color:var(--text-primary)] tracking-wider">RESULTS</h1>
                {liveIndicator}
                <span className="flex items-center gap-1.5 text-xs font-mono text-jade border [border-color:var(--jade-border)] px-2 py-0.5 rounded-sm">
                  <Globe size={10} />
                  PUBLIC
                </span>
              </div>
              {results.pollTitle && (
                <p className="text-sm [color:var(--text-secondary)] truncate">{results.pollTitle}</p>
              )}
              {results.pollDescription && (
                <p className="text-xs [color:var(--text-muted)] mt-0.5 leading-snug max-w-lg">{results.pollDescription}</p>
              )}
              {lastUpdated && (
                <p className="text-xs font-mono [color:var(--text-muted)] mt-1">
                  Updated {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          {viewerCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 border [border-color:var(--signal-dim)] [background:var(--signal-dim)] [color:var(--signal)] text-xs font-mono rounded-sm shrink-0">
              <Eye size={12} />
              {viewerCount} viewing
            </div>
          )}
          <button
            onClick={() => setShowShareCard(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-sm transition-colors shrink-0"
            style={{ border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <Share2 size={12} />
            Share
          </button>
          <button
            onClick={() => exportCSV(results)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-sm transition-colors shrink-0"
            style={{ border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--jade)'; e.currentTarget.style.color = 'var(--jade)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <LiveCounter value={results.totalResponses ?? 0} label="Total Responses" accent large />
          <LiveCounter value={questions.length} label="Questions" />
          <LiveCounter value={totalVotes} label="Total Votes" />
          <div className="card p-5">
            <p className="text-xs font-mono [color:var(--text-muted)] uppercase tracking-widest mb-2">Computed</p>
            <p className="font-mono text-sm [color:var(--text-secondary)]">
              {results.computedAt ? new Date(results.computedAt).toLocaleTimeString() : '—'}
            </p>
          </div>
        </div>

        {results.participation?.length > 0 && (
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="[color:var(--text-muted)]" />
              <h2 className="font-mono text-xs [color:var(--text-muted)] uppercase tracking-widest">Participation Over Time</h2>
            </div>
            <ParticipationChart data={results.participation} />
          </div>
        )}

        {questions.length > 1 && (
          <div className="flex gap-px mb-1 [background:var(--surface-700)] rounded-sm overflow-hidden w-full">
            {questions.map((q, i) => (
              <button
                key={q.questionId}
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-2 text-xs font-mono truncate px-3 transition-colors ${activeTab === i ? '[background:var(--surface-600)] [color:var(--text-primary)]' : '[background:var(--surface-800)] [color:var(--text-muted)] hover:[color:var(--text-secondary)]'
                  }`}
              >
                Q{i + 1}
              </button>
            ))}
          </div>
        )}

        {questions.map((q, qi) => {
          if (questions.length > 1 && qi !== activeTab) return null
          const totalQ = q.options.reduce((s, o) => s + o.votes, 0)

          return (
            <div key={q.questionId} className="card p-6 mb-4">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <span className="font-mono text-xs [color:var(--text-muted)]">Q{qi + 1}</span>
                  <h3 className="[color:var(--text-primary)] font-medium mt-0.5 text-sm">{q.content}</h3>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-semibold tabular-nums text-signal">{totalQ}</p>
                  <p className="text-xs font-mono [color:var(--text-muted)]">votes</p>
                </div>
              </div>

              <div className="mb-6">
                <VotesBarChart options={q.options} />
              </div>

              <div className="border-t [border-color:var(--border-subtle)] pt-4">
                <VoteBreakdown options={q.options} totalResponses={results.totalResponses} />
              </div>
            </div>
          )
        })}
      </div>
        </div>
    </div>
    {showShareCard && results && (
      <ShareCard results={results} onClose={() => setShowShareCard(false)} />
    )}
    </>
  )
}

export default function PublicAnalyticsPage() {
  return (
    <ToastProvider>
      <Navbar />
      <PublicAnalyticsContent />
    </ToastProvider>
  )
}