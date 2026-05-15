import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { pollsApi } from '../api/index.js'
import { tokenStore } from '../api/index.js'
import { useSocket } from '../hooks/useSocket.js'
import Navbar from '../components/layout/Navbar.jsx'
import { ToastProvider, useToast } from '../components/ui/Toast.jsx'
import { SkeletonAnalytics } from '../components/ui/Skeleton.jsx'
import LiveCounter from '../components/analytics/LiveCounter.jsx'
import { VotesBarChart, ParticipationChart, VoteBreakdown } from '../components/analytics/Charts.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import DeleteModal from '../components/poll/DeleteModal.jsx'
import { ArrowLeft, Wifi, WifiOff, RefreshCw, Activity, Eye, Trash2, Globe, Users, Lock, Download, Share2 } from 'lucide-react'
import { GeoBg } from '../components/ui/BauhausAccents.jsx'
import ShareCard from '../components/poll/ShareCard.jsx'

const VISIBILITY_LABELS = {
  all: { label: 'Public', Icon: Globe, color: 'text-jade' },
  respondents: { label: 'Respondents', Icon: Users, color: 'text-azure' },
  private: { label: 'Private', Icon: Lock },
}

function csvEscape(val) {
  const s = val == null ? '' : String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

function exportCSV(analytics) {
  const title = analytics.pollTitle || 'poll'
  const rows = []

  rows.push(['Made using PollNow, :)'])
  rows.push(['Status', csvEscape(analytics.pollStatus || '')])
  rows.push(['Results Visibility', csvEscape(analytics.resultsVisibility || '')])
  rows.push(['Total Responses', String(analytics.totalResponses ?? 0)])
  rows.push(['Computed At', csvEscape(analytics.computedAt ? new Date(analytics.computedAt).toISOString() : '')])
  rows.push([])
  rows.push(['Question #', 'Question', 'Option', 'Votes', 'Percentage'])

  analytics.questions.forEach((q, qi) => {
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

function AnalyticsContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [socketConnected, setSocketConnected] = useState(false)
  const [adminJoinError, setAdminJoinError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [viewerCount, setViewerCount] = useState(0)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)
  const pollInterval = useRef(null)
  const throttleRef = useRef(null)

  const adminToken = tokenStore.get()

  const loadAnalytics = useCallback(async () => {
    try {
      const { analytics: data } = await pollsApi.analytics(id)
      setAnalytics(data)
      setLastUpdated(new Date())
    } catch (err) {
      if (err.status === 403 || err.status === 404) {
        toast.error(err.message)
        navigate('/dashboard')
      }
    }
  }, [id])

  useEffect(() => {
    const loadAll = async () => {
      try {
        const { analytics: data } = await pollsApi.analytics(id)
        setAnalytics(data)
        setLastUpdated(new Date())
      } catch (err) {
        if (err.status === 403 || err.status === 404) {
          toast.error(err.message || 'Not found')
          navigate('/dashboard')
        }
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [id])

  const handleAnalyticsUpdate = useCallback((data) => {
    if (throttleRef.current) return
    throttleRef.current = setTimeout(() => { throttleRef.current = null }, 500)
    setAnalytics(data)
    setLastUpdated(new Date())
  }, [])

  const handleCount = useCallback((data) => {
    setAnalytics(prev => prev ? { ...prev, totalResponses: data.totalResponses } : prev)
  }, [])

  const handleViewerCount = useCallback((data) => {
    setViewerCount(data.count)
  }, [])

  const handleStatusChanged = useCallback((data) => {
    setAnalytics(prev => prev ? { ...prev, pollStatus: data.status } : prev)
  }, [])

  useSocket(id, {
    onAnalytics: handleAnalyticsUpdate,
    onCount: handleCount,
    onResponse: () => loadAnalytics(),
    onConnect: () => setSocketConnected(true),
    onDisconnect: () => {
      setSocketConnected(false)
      pollInterval.current = setInterval(loadAnalytics, 5000)
    },
    onViewerCount: handleViewerCount,
    onStatusChanged: handleStatusChanged,
    onAdminJoinError: (data) => setAdminJoinError(data.message),
  }, adminToken)

  useEffect(() => {
    setSocketConnected(true)
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current)
    }
  }, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await pollsApi.delete(id)
      toast.success('Poll deleted')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
      setDeleting(false)
      setDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-14" style={{ background: 'var(--page-bg)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="skeleton h-6 w-6 rounded" />
            <div className="skeleton h-8 w-48 rounded" />
          </div>
          <SkeletonAnalytics />
        </div>
      </div>
    )
  }

  if (!analytics) return null

  const totalVotes = analytics.questions.reduce((sum, q) =>
    sum + q.options.reduce((s, o) => s + o.votes, 0), 0
  )

  const liveIndicator = (
    <div className={`flex items-center gap-1.5 text-xs font-mono ${socketConnected ? 'text-signal' : ''}`} style={socketConnected ? {} : { color: 'var(--text-muted)' }}>
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

  const visInfo = analytics.resultsVisibility ? VISIBILITY_LABELS[analytics.resultsVisibility] : null

  return (
    <>
    <div className="min-h-screen pt-14" style={{ background: 'var(--page-bg)' }}>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <GeoBg />
        <div style={{ position: 'relative', zIndex: 1 }}>

        {adminJoinError && (
          <div className="mb-4 px-4 py-3 border [border-color:var(--crimson-border)] [background:var(--crimson-dim)] rounded-sm text-sm text-crimson">
            {adminJoinError}
          </div>
        )}

        <div className="flex items-start justify-between mb-8 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/dashboard')} className="shrink-0 transition-colors" style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="font-display text-3xl sm:text-4xl tracking-wider" style={{ color: 'var(--text-primary)' }}>ANALYTICS</h1>
                {liveIndicator}
              </div>
              {analytics.pollTitle && (
                <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{analytics.pollTitle}</p>
              )}
              {analytics.pollDescription && (
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{analytics.pollDescription}</p>
              )}
              {lastUpdated && (
                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  Updated {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            {viewerCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 border [border-color:var(--signal-dim)] [background:var(--signal-dim)] [color:var(--signal)] text-xs font-mono rounded-sm">
                <Eye size={12} />
                {viewerCount} viewing
              </div>
            )}
            {visInfo && (
              <div className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-mono ${visInfo.color || ''}`} style={visInfo.color ? {} : { color: 'var(--text-muted)' }}>
                <visInfo.Icon size={11} />
                {visInfo.label}
              </div>
            )}
            <button
              onClick={() => setShowShareCard(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-sm transition-colors"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <Share2 size={12} />
              Share
            </button>
            <button
              onClick={() => exportCSV(analytics)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-sm transition-colors"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--jade)'; e.currentTarget.style.color = 'var(--jade)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <Download size={12} />
              Export CSV
            </button>
            <button
              onClick={loadAnalytics}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-sm transition-colors"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <RefreshCw size={12} />
              Refresh
            </button>
            <button
              onClick={() => setDeleteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border [border-color:var(--crimson-border)] text-crimson text-xs font-mono rounded-sm hover:[background:var(--crimson-dim)] transition-colors"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <LiveCounter value={analytics.totalResponses} label="Total Responses" accent large />
          <LiveCounter value={analytics.questions.length} label="Questions" />
          <LiveCounter value={totalVotes} label="Total Votes" />
          <div className="card p-5">
            <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Computed</p>
            <p className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
              {new Date(analytics.computedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {analytics.participation?.length > 0 && (
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} style={{ color: 'var(--text-muted)' }} />
              <h2 className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Participation Over Time</h2>
            </div>
            <ParticipationChart data={analytics.participation} />
          </div>
        )}

        {analytics.questions.length > 1 && (
          <div className="flex gap-px mb-1 rounded-sm overflow-hidden w-full" style={{ background: 'var(--border-subtle)' }}>
            {analytics.questions.map((q, i) => (
              <button
                key={q.questionId}
                onClick={() => setActiveTab(i)}
                className="flex-1 py-2 text-xs font-mono truncate px-3 transition-colors"
                style={{
                  background: activeTab === i ? 'var(--surface-600)' : 'var(--surface-800)',
                  color: activeTab === i ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
                onMouseEnter={e => { if (activeTab !== i) e.currentTarget.style.color = 'var(--text-secondary)' }}
                onMouseLeave={e => { if (activeTab !== i) e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                Q{i + 1}
              </button>
            ))}
          </div>
        )}

        {analytics.questions.map((q, qi) => {
          if (analytics.questions.length > 1 && qi !== activeTab) return null
          const totalQ = q.options.reduce((s, o) => s + o.votes, 0)

          return (
            <div key={q.questionId} className="card p-6 mb-4">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Q{qi + 1}</span>
                  <h3 className="font-body font-medium mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{q.content}</h3>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-semibold tabular-nums text-signal">{totalQ}</p>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>votes</p>
                </div>
              </div>

              <div className="mb-6">
                <VotesBarChart options={q.options} />
              </div>

              <div className="pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <VoteBreakdown options={q.options} totalResponses={analytics.totalResponses} />
              </div>
            </div>
          )
        })}
      </div>
        </div>

      {deleteModal && (
        <DeleteModal
          poll={{ id, title: analytics.pollTitle || 'this poll' }}
          onConfirm={handleDelete}
          onClose={() => setDeleteModal(false)}
          loading={deleting}
        />
      )}
      {showShareCard && analytics && (
        <ShareCard results={analytics} onClose={() => setShowShareCard(false)} />
      )}
    </div>
    </>
  )
}

export default function AnalyticsPage() {
  return (
    <ToastProvider>
      <Navbar />
      <AnalyticsContent />
    </ToastProvider>
  )
}