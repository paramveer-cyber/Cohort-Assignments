import { useState, useEffect } from 'react'
import { pollsApi } from '../api/index.js'
import Navbar from '../components/layout/Navbar.jsx'
import PublicPollCard from '../components/poll/PublicPollCard.jsx'
import { ToastProvider } from '../components/ui/Toast.jsx'
import { SkeletonCard } from '../components/ui/Skeleton.jsx'
import { Compass, Search, BarChart2, Zap } from 'lucide-react'
import { GeoBg, SectionDivider } from '../components/ui/BauhausAccents.jsx'

function DiscoverContent() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    pollsApi.list()
      .then(data => setPolls(data.polls || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const searched = query
    ? polls.filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
    : polls

  const activePolls = searched.filter(p => p.status === 'active')
  const resultPolls = searched.filter(p => p.status === 'published' || p.status === 'expired')

  const filtered = filter === 'active' ? activePolls
    : filter === 'results' ? resultPolls
    : searched

  const showSections = filter === 'all' && !query

  return (
    <div className="min-h-screen pt-14" style={{ background: 'var(--page-bg)' }}>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <GeoBg variant="discover" />
        <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Compass size={16} className="text-signal" />
              <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Public Polls</span>
            </div>
            <h1 className="font-display text-5xl tracking-wider leading-none" style={{ color: 'var(--text-primary)' }}>DISCOVER</h1>
          </div>

          <div className="relative sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setFilter('all') }}
              placeholder="Search polls..."
              className="input-base pl-9"
            />
          </div>
        </div>

        <div className="flex gap-1 mb-8 rounded-sm p-1 w-fit" style={{ background: 'var(--surface-700)', border: '1px solid var(--border-subtle)' }}>
          {[
            { k: 'all', label: `All (${searched.length})` },
            { k: 'active', label: `Live (${activePolls.length})` },
            { k: 'results', label: `Results (${resultPolls.length})` },
          ].map(({ k, label }) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wide rounded-sm transition-colors ${
                filter === k ? 'bg-signal [color:var(--text-inverse)] font-semibold' : ''
              }`}
              style={filter === k ? {} : { color: 'var(--text-muted)' }}
              onMouseEnter={e => { if (filter !== k) e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { if (filter !== k) e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0,1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : showSections ? (
          <div className="space-y-10">
            {activePolls.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Zap size={14} className="text-signal" />
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-signal">LIVE POLLS</h2>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Vote now</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activePolls.map(poll => <PublicPollCard key={poll.id} poll={poll} />)}
                </div>
              </section>
            )}

            {activePolls.length > 0 && resultPolls.length > 0 && <SectionDivider accent />}

            {resultPolls.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <BarChart2 size={14} className="text-jade" />
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-jade">RESULTS</h2>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>View analytics</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resultPolls.map(poll => <PublicPollCard key={poll.id} poll={poll} />)}
                </div>
              </section>
            )}

            {polls.length === 0 && (
              <div className="card p-16 text-center">
                <BarChart2 size={36} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No published polls yet.</p>
              </div>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <BarChart2 size={36} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {query ? `No polls matching "${query}"` : 'Nothing here yet.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs font-mono uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
              {filtered.length} {filtered.length === 1 ? 'poll' : 'polls'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(poll => <PublicPollCard key={poll.id} poll={poll} />)}
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  )
}

export default function DiscoverPage() {
  return (
    <ToastProvider>
      <Navbar />
      <DiscoverContent />
    </ToastProvider>
  )
}