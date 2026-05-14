import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { pollsApi } from '../api/index.js'
import { tokenStore } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useSocket } from '../hooks/useSocket.js'
import Navbar from '../components/layout/Navbar.jsx'
import PollCard from '../components/poll/PollCard.jsx'
import PublishModal from '../components/poll/PublishModal.jsx'
import DeleteModal from '../components/poll/DeleteModal.jsx'
import { SkeletonCard } from '../components/ui/Skeleton.jsx'
import { ToastProvider, useToast } from '../components/ui/Toast.jsx'
import { Plus, BarChart2, FileText, Zap, Globe, Clock, Archive } from 'lucide-react'
import { GeoBg, SectionDivider } from '../components/ui/BauhausAccents.jsx'

function PollStatusWatcher({ pollId, onStatusChange }) {
  const adminToken = tokenStore.get()
  useSocket(pollId, {
    onExpired: (data) => onStatusChange(data.pollId, data.status),
    onPublished: (data) => onStatusChange(data.pollId, data.status),
    onStatusChanged: (data) => onStatusChange(data.pollId, data.status),
  }, adminToken)
  return null
}

function DashboardContent() {
  const { user } = useAuth()
  const toast = useToast()
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [activatingId, setActivatingId] = useState(null)
  const [publishModal, setPublishModal] = useState(null)
  const [publishingId, setPublishingId] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const load = useCallback(async () => {
    try {
      const { polls: list } = await pollsApi.myPolls()
      setPolls(list || [])
    } catch {
      toast.error('Failed to load polls')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleStatusChange = useCallback((pollId, status) => {
    setPolls(prev => prev.map(p => p.id === pollId ? { ...p, status } : p))
  }, [])

  const handleActivate = async (id) => {
    setActivatingId(id)
    try {
      const { poll } = await pollsApi.activate(id)
      setPolls(prev => prev.map(p => p.id === id ? poll : p))
      toast.success('Poll activated — now accepting responses')
    } catch (err) {
      toast.error(err.message || 'Failed to activate')
    } finally {
      setActivatingId(null)
    }
  }

  const openPublishModal = (poll) => setPublishModal(poll)

  const handlePublishConfirm = async (visibility) => {
    if (!publishModal) return
    setPublishingId(publishModal.id)
    try {
      const { poll } = await pollsApi.publish(publishModal.id, visibility)
      setPolls(prev => prev.map(p => p.id === publishModal.id ? { ...poll, resultsVisibility: visibility } : p))
      toast.success(`Poll published — ${visibility === 'all' ? 'visible to everyone' : visibility === 'respondents' ? 'visible to respondents' : 'private'}`)
      setPublishModal(null)
    } catch (err) {
      toast.error(err.message || 'Failed to publish')
    } finally {
      setPublishingId(null)
    }
  }

  const openDeleteModal = (poll) => setDeleteModal(poll)

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return
    setDeletingId(deleteModal.id)
    try {
      await pollsApi.delete(deleteModal.id)
      setPolls(prev => prev.filter(p => p.id !== deleteModal.id))
      toast.success('Poll deleted')
      setDeleteModal(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const counts = {
    all: polls.length,
    draft: polls.filter(p => p.status === 'draft').length,
    active: polls.filter(p => p.status === 'active').length,
    published: polls.filter(p => p.status === 'published').length,
    expired: polls.filter(p => p.status === 'expired').length,
  }

  const filtered = filter === 'all' ? polls : polls.filter(p => p.status === filter)

  const activePolls = polls.filter(p => p.status === 'active')
  const expiredPolls = polls.filter(p => p.status === 'expired' || p.status === 'published')
  const draftPolls = polls.filter(p => p.status === 'draft')

  const watchedPolls = polls.filter(p => p.status === 'active' || p.status === 'draft')

  const stats = [
    { label: 'Total Polls', value: counts.all, icon: <FileText size={16} />, color: 'var(--text-secondary)' },
    { label: 'Active Now', value: counts.active, icon: <Zap size={16} />, color: 'var(--signal)' },
    { label: 'Published', value: counts.published, icon: <Globe size={16} />, color: 'var(--jade)' },
    { label: 'Expired', value: counts.expired, icon: <Clock size={16} />, color: 'var(--brand)' },
  ]

  const showSections = filter === 'all'

  const cardProps = (poll) => ({
    poll,
    onActivate: handleActivate,
    onPublish: openPublishModal,
    onDelete: openDeleteModal,
    activating: activatingId === poll.id,
    publishing: publishingId === poll.id,
    deleting: deletingId === poll.id,
  })

  return (
    <div className="min-h-screen pt-14" style={{ background: 'var(--page-bg)' }}>
      {watchedPolls.map(p => (
        <PollStatusWatcher key={p.id} pollId={p.id} onStatusChange={handleStatusChange} />
      ))}

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <GeoBg />
        <div style={{ position: 'relative', zIndex: 1 }}>

        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-0">
            <div style={{ width: '4px', height: '48px', background: 'var(--brand)', marginRight: '12px', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Control Panel</p>
              <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>DASHBOARD</h1>
              <p className="text-xs font-mono mt-1.5" style={{ color: 'var(--text-muted)' }}>— {user?.name}</p>
            </div>
          </div>
          <Link to="/create"
            className="flex items-center gap-2 px-5 py-3 font-bold text-xs uppercase tracking-widest transition-all"
            style={{ background: 'var(--signal)', color: 'var(--text-inverse)', letterSpacing: '0.12em', position: 'relative' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--signal-dark)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--signal)' }}
          >
            <Plus size={14} strokeWidth={3} />
            NEW POLL
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {stats.map((s, i) => (
            <div key={s.label} className="relative overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: s.color, opacity: 0.7 }} />
              <div className="p-5 pl-6">
                <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: s.color }}>{s.label}</p>
                <p className="text-4xl font-bold tabular-nums" style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-0 mb-8 w-fit overflow-x-auto" style={{ border: '1px solid var(--border-subtle)' }}>
          {Object.entries(counts).map(([k, v], i) => (
            <button key={k} onClick={() => setFilter(k)}
              className="px-4 py-2 text-xs font-mono uppercase tracking-widest whitespace-nowrap transition-all"
              style={filter === k
                ? { background: 'var(--brand)', color: 'var(--text-inverse)', fontWeight: 700 }
                : { color: 'var(--text-muted)', background: 'transparent', borderLeft: i > 0 ? '1px solid var(--border-subtle)' : 'none' }
              }
              onMouseEnter={e => { if (filter !== k) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-700)' } }}
              onMouseLeave={e => { if (filter !== k) { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' } }}
            >
              {k} <span style={{ opacity: 0.6 }}>({v})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0,1,2].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : showSections ? (
          <div className="space-y-10">
            {activePolls.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div style={{ width: '3px', height: '20px', background: 'var(--signal)' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ background: 'var(--signal)' }} />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: 'var(--signal)' }}>ACTIVE POLLS</h2>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>· accepting responses</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activePolls.map(poll => (
                    <PollCard key={poll.id} {...cardProps(poll)} />
                  ))}
                </div>
              </section>
            )}

            {activePolls.length > 0 && draftPolls.length > 0 && <SectionDivider />}

            {draftPolls.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div style={{ width: '3px', height: '20px', background: 'var(--text-muted)' }} />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>DRAFTS</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {draftPolls.map(poll => (
                    <PollCard key={poll.id} {...cardProps(poll)} />
                  ))}
                </div>
              </section>
            )}

            {expiredPolls.length > 0 && (draftPolls.length > 0 || activePolls.length > 0) && <SectionDivider />}

            {expiredPolls.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div style={{ width: '3px', height: '20px', background: 'var(--border-default)' }} />
                  <Archive size={12} style={{ color: 'var(--text-muted)' }} />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>EXPIRED & PUBLISHED</h2>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>· closed</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expiredPolls.map(poll => (
                    <PollCard key={poll.id} {...cardProps(poll)} showResultStatus />
                  ))}
                </div>
              </section>
            )}

            {polls.length === 0 && (
              <div className="relative overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', padding: '64px 48px', textAlign: 'center' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'var(--brand)' }} />
                <div style={{ position: 'absolute', top: '24px', right: '24px', width: '60px', height: '60px', border: '1px solid var(--border-subtle)', borderRadius: '50%', opacity: 0.4 }} />
                <div style={{ position: 'absolute', bottom: '16px', left: '24px', width: '40px', height: '40px', background: 'var(--brand-dim)', transform: 'rotate(45deg)', opacity: 0.5 }} />
                <BarChart2 size={28} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>No polls yet</p>
                <Link to="/create" className="inline-flex items-center gap-2 px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-all"
                  style={{ background: 'var(--signal)', color: 'var(--text-inverse)', letterSpacing: '0.1em' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--signal-dark)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--signal)' }}
                >
                  <Plus size={13} strokeWidth={3} />
                  CREATE POLL
                </Link>
              </div>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <BarChart2 size={32} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No {filter} polls.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(poll => (
              <PollCard
                key={poll.id}
                {...cardProps(poll)}
                showResultStatus={poll.status === 'expired' || poll.status === 'published'}
              />
            ))}
          </div>
        )}
        </div>
      </div>

      {publishModal && (
        <PublishModal
          poll={publishModal}
          onConfirm={handlePublishConfirm}
          onClose={() => setPublishModal(null)}
          loading={publishingId === publishModal?.id}
        />
      )}

      {deleteModal && (
        <DeleteModal
          poll={deleteModal}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteModal(null)}
          loading={deletingId === deleteModal?.id}
        />
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <Navbar />
      <DashboardContent />
    </ToastProvider>
  )
}