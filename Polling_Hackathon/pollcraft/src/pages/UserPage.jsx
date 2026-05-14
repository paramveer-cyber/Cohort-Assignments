import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { pollsApi } from '../api/index.js'
import Navbar from '../components/layout/Navbar.jsx'
import { ToastProvider, useToast } from '../components/ui/Toast.jsx'
import { SkeletonCard } from '../components/ui/Skeleton.jsx'
import { User, Mail, Calendar, BarChart2, Zap, Globe, Clock, Plus, ArrowRight, ExternalLink, LogOut, Palette } from 'lucide-react'
import ThemePicker from '../components/ui/ThemePicker.jsx'

function UserPageContent() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await pollsApi.myPolls()
      setPolls(data.polls || [])
    } catch {
      toast.error('Failed to load polls')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  const counts = {
    total: polls.length,
    active: polls.filter(p => p.status === 'active').length,
    published: polls.filter(p => p.status === 'published').length,
    draft: polls.filter(p => p.status === 'draft').length,
    expired: polls.filter(p => p.status === 'expired').length,
  }

  const recentPolls = polls.slice(0, 6)

  const statusCfg = {
    active: { color: 'var(--status-active)', bg: 'var(--status-active-bg)', border: 'var(--status-active-border)', label: 'Active' },
    published: { color: 'var(--status-published)', bg: 'var(--status-published-bg)', border: 'var(--status-published-border)', label: 'Published' },
    draft: { color: 'var(--status-draft)', bg: 'var(--status-draft-bg)', border: 'var(--status-draft-border)', label: 'Draft' },
    expired: { color: 'var(--status-expired)', bg: 'var(--status-expired-bg)', border: 'var(--status-expired-border)', label: 'Expired' },
  }

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'

  return (
    <div className="min-h-screen pt-14" style={{ background: 'var(--page-bg)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: 'var(--brand)' }} />
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 rounded-sm flex items-center justify-center text-2xl font-semibold relative overflow-hidden"
                  style={{ background: 'var(--brand-dim)', border: '2px solid var(--brand-dim-strong)', color: 'var(--brand)' }}>
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (user?.name?.[0] || 'U').toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="font-display text-2xl tracking-wider" style={{ color: 'var(--text-primary)' }}>{user?.name}</h2>
                  <p className="text-sm font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.provider === 'google' ? 'Google Account' : 'Local Account'}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{user?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Member since {memberSince}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{user?.id?.slice(0, 8)}…</span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Quick Actions</p>
              <div className="space-y-2">
                <Link to="/create"
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold rounded-sm transition-all duration-150"
                  style={{ background: 'var(--brand)', color: 'var(--text-inverse)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-light)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand)' }}>
                  <Plus size={14} />
                  New Poll
                </Link>
                <Link to="/dashboard"
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-sm transition-colors"
                  style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--text-muted)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-default)' }}>
                  <BarChart2 size={14} />
                  My Dashboard
                </Link>
                <Link to="/discover"
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-sm transition-colors"
                  style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--text-muted)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-default)' }}>
                  <Globe size={14} />
                  Discover Polls
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-sm transition-colors"
                  style={{ color: 'var(--brand)', border: '1px solid var(--brand-dim-strong)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-dim)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '' }}>
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tightr mb-1" style={{ color: 'var(--text-primary)' }}>PROFILE</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your activity summary and poll overview</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total', value: counts.total, icon: <BarChart2 size={15} />, color: 'var(--text-secondary)' },
                { label: 'Active', value: counts.active, icon: <Zap size={15} />, color: 'var(--status-active)' },
                { label: 'Published', value: counts.published, icon: <Globe size={15} />, color: 'var(--status-published)' },
                { label: 'Drafts', value: counts.draft, icon: <Clock size={15} />, color: 'var(--text-muted)' },
              ].map((stat) => (
                <div key={stat.label} className="card p-4 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2" style={{ color: stat.color }}>
                    {stat.icon}
                    <span className="text-xs font-mono uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <p className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="card overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Recent Polls</p>
                <Link to="/dashboard" className="text-xs font-mono transition-colors flex items-center gap-1" style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
                  View all <ArrowRight size={10} />
                </Link>
              </div>

              {loading ? (
                <div className="p-5 space-y-3">
                  {[0, 1, 2].map(i => <div key={i} className="skeleton h-12 rounded-sm" />)}
                </div>
              ) : recentPolls.length === 0 ? (
                <div className="p-10 text-center">
                  <BarChart2 size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>No polls yet.</p>
                  <Link to="/create" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-sm transition-all"
                    style={{ background: 'var(--brand)', color: 'var(--text-inverse)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-light)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand)' }}>
                    <Plus size={13} /> Create your first poll
                  </Link>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                  {recentPolls.map(poll => {
                    const cfg = statusCfg[poll.status] || statusCfg.draft
                    return (
                      <div key={poll.id} className="px-5 py-4 flex items-center justify-between gap-4 transition-colors"
                        style={{ background: 'transparent' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-700)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{poll.title}</p>
                          <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {new Date(poll.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="status-badge text-xs" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                            {poll.status === 'active' && <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ background: cfg.color }} />}
                            {cfg.label}
                          </span>
                          {(poll.status === 'active' || poll.status === 'published') && (
                            <Link to={`/poll/${poll.slug}`} className="transition-colors" style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand)' }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
                              <ExternalLink size={13} />
                            </Link>
                          )}
                          <Link to={`/analytics/${poll.id}`} className="transition-colors" style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
                            <BarChart2 size={13} />
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="card p-5">
              <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Poll Status Breakdown</p>
              <div className="space-y-3">
                {[
                  { label: 'Active', count: counts.active, total: counts.total, color: 'var(--status-active)' },
                  { label: 'Published', count: counts.published, total: counts.total, color: 'var(--status-published)' },
                  { label: 'Draft', count: counts.draft, total: counts.total, color: 'var(--text-muted)' },
                  { label: 'Expired', count: counts.expired, total: counts.total, color: 'var(--status-expired)' },
                ].map(row => {
                  const pct = counts.total > 0 ? Math.round((row.count / counts.total) * 100) : 0
                  return (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>
                        <span>{row.label}</span>
                        <span style={{ color: row.color }}>{row.count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-600)' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: row.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="card p-5">
              <ThemePicker />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UserPage() {
  return (
    <ToastProvider>
      <Navbar />
      <UserPageContent />
    </ToastProvider>
  )
}