import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart2, Clock, Users, ArrowRight, Zap, Globe, Lock, Trash2, Eye, Calendar, Pencil, HelpCircle, X } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge.jsx'

const VISIBILITY_CFG = {
  all: { label: 'Results: Public', color: 'var(--jade)', Icon: Globe },
  respondents: { label: 'Results: Respondents', color: 'var(--azure)', Icon: Users },
  private: { label: 'Results: Private', color: 'var(--text-muted)', Icon: Lock },
}

const VIS_LABEL = { all: 'Public', respondents: 'Respondents Only', private: 'Private' }

function fmt(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function MetaRow({ label, value, color }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-3 items-start py-1.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <span className="text-xs font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-xs font-mono text-right leading-snug" style={{ color: color || 'var(--text-secondary)' }}>{value}</span>
    </div>
  )
}

function InfoPopover({ poll, anchorRef, onClose }) {
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const popoverRef = useRef(null)

  useEffect(() => {
    if (!anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    const vpw = window.innerWidth
    const left = rect.right + 8
    const adjustedLeft = left + 280 > vpw ? rect.left - 288 : left
    setPos({ top: rect.top, left: adjustedLeft })
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target) && !anchorRef.current?.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isExpiredOrPublished = poll.status === 'expired' || poll.status === 'published'

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 w-72 rounded-sm shadow-xl"
      style={{
        top: pos.top,
        left: pos.left,
        background: 'var(--modal-bg)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-modal)',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Poll Info</span>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
          <X size={12} />
        </button>
      </div>
      <div className="px-4 py-2 pb-3 space-y-0">
        <MetaRow label="Title" value={poll.title} color="var(--text-primary)" />
        <MetaRow label="Description" value={poll.description} />
        <MetaRow label="Slug" value={poll.slug ? `/${poll.slug}` : null} />
        <MetaRow label="Status" value={poll.status?.toUpperCase()} color={
          poll.status === 'active' ? 'var(--status-active)' :
            poll.status === 'published' ? 'var(--status-published)' :
              poll.status === 'expired' ? 'var(--status-expired)' :
                'var(--text-muted)'
        } />
        <MetaRow label="Questions" value={poll.questions?.length != null ? String(poll.questions.length) : null} />
        <MetaRow label="Created" value={fmt(poll.createdAt)} />
        <MetaRow label={poll.status === 'published' ? 'Published On' : 'Publish On'} value={fmt(poll.publishOn)} />
        <MetaRow label={isExpiredOrPublished ? 'Expired On' : 'Expires On'} value={fmt(poll.expiresAt)} />
        <MetaRow
          label="Visibility"
          value={poll.resultsVisibility ? VIS_LABEL[poll.resultsVisibility] : null}
          color={poll.resultsVisibility === 'all' ? 'var(--jade)' : poll.resultsVisibility === 'respondents' ? 'var(--azure)' : null}
        />
        <MetaRow label="Responses" value={poll.anonymousAllowed ? 'Anonymous OK' : 'Auth Required'} />
        {poll.totalResponses != null && <MetaRow label="Total Responses" value={String(poll.totalResponses)} color="var(--signal)" />}
      </div>
    </div>
  )
}

export default function PollCard({ poll, onActivate, onPublish, onDelete, activating, publishing, deleting, showResultStatus, viewerCount }) {
  const [showInfo, setShowInfo] = useState(false)
  const infoIconRef = useRef(null)

  const canActivate = poll.status === 'draft'
  const canPublish = poll.status === 'active' || poll.status === 'expired'
  const canViewAnalytics = poll.status !== 'draft'
  const isExpiredOrPublished = poll.status === 'expired' || poll.status === 'published'
  const resultInfo = showResultStatus && poll.resultsVisibility ? VISIBILITY_CFG[poll.resultsVisibility] || null : null
  const isScheduled = poll.publishOn && poll.status === 'draft' && new Date(poll.publishOn) > new Date()

  const accentColor = poll.status === 'active' ? 'var(--signal)' : poll.status === 'published' ? 'var(--jade)' : poll.status === 'expired' ? 'var(--brand)' : 'var(--border-default)'

  return (
    <div className={`group flex flex-col gap-0 relative ${isExpiredOrPublished ? 'opacity-75' : ''}`}
      style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', overflow: 'visible', transition: 'border-color 0.15s ease' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
    >
      <div style={{ height: '3px', background: accentColor, flexShrink: 0 }} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-mono font-bold text-sm leading-snug truncate" style={{ color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
              {poll.title}
            </h3>
            <p className="font-mono text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>/{poll.slug}</p>
            {poll.description && <p className="text-xs mt-2 line-clamp-2 leading-snug" style={{ color: 'var(--text-muted)' }}>{poll.description}</p>}
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <StatusBadge status={isScheduled ? 'scheduled' : poll.status} />
              <button ref={infoIconRef} onClick={() => setShowInfo(v => !v)}
                className="transition-colors" style={{ color: showInfo ? 'var(--brand)' : 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand)' }}
                onMouseLeave={e => { if (!showInfo) e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <HelpCircle size={13} />
              </button>
            </div>
            {typeof viewerCount === 'number' && viewerCount > 0 && (
              <span className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--signal)' }}>
                <Eye size={10} />{viewerCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono flex-wrap" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><Clock size={10} />{new Date(poll.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
          {poll.expiresAt && <span className="flex items-center gap-1"><Clock size={10} />{isExpiredOrPublished ? 'Ended' : 'Expires'} {new Date(poll.expiresAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>}
          {isScheduled && <span className="flex items-center gap-1" style={{ color: 'var(--status-scheduled)' }}><Calendar size={10} />{new Date(poll.publishOn).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>}
          {poll.anonymousAllowed && <span className="flex items-center gap-1"><Users size={10} />Anon</span>}
        </div>

        {resultInfo && (
          <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: resultInfo.color }}>
            <resultInfo.Icon size={10} />{resultInfo.label}
          </div>
        )}

        <div className="flex items-center gap-1.5 pt-3 flex-wrap" style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
          {canActivate && (
            <button onClick={() => onActivate(poll.id)} disabled={activating}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wide transition-all disabled:opacity-50"
              style={{ background: 'var(--signal-dim)', border: '1px solid var(--signal-dim)', color: 'var(--signal)' }}
            >
              <Zap size={11} strokeWidth={2.5} />{activating ? '…' : 'ACTIVATE'}
            </button>
          )}
          {poll.status === 'draft' && (
            <Link to={`/edit/${poll.id}`}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono uppercase tracking-wide transition-colors"
              style={{ background: 'var(--surface-700)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <Pencil size={11} />EDIT
            </Link>
          )}
          {canPublish && (
            <button onClick={() => onPublish(poll)} disabled={publishing}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wide transition-all disabled:opacity-50"
              style={{ background: 'var(--jade-dim)', border: '1px solid var(--jade-border)', color: 'var(--jade)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--jade-dim-strong)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--jade-dim)' }}
            >
              <Globe size={11} />{publishing ? '…' : 'PUBLISH'}
            </button>
          )}
          {canViewAnalytics && (
            <Link to={`/analytics/${poll.id}`}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wide transition-all ml-auto"
              style={{ background: 'var(--azure-dim)', border: '1px solid var(--azure-border)', color: 'var(--azure)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--azure-dim-strong)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--azure-dim)' }}
            >
              <BarChart2 size={11} />ANALYTICS
            </Link>
          )}
          {poll.status === 'active' && (
            <Link to={`/poll/${poll.slug}`}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono uppercase tracking-wide transition-colors"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              VIEW <ArrowRight size={10} />
            </Link>
          )}
          <button onClick={() => onDelete(poll)} disabled={deleting}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-mono transition-all disabled:opacity-50"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--crimson)'; e.currentTarget.style.background = 'var(--crimson-dim)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = '' }}
            title="Delete poll"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {showInfo && (
        <InfoPopover poll={poll} anchorRef={infoIconRef} onClose={() => setShowInfo(false)} />
      )}
    </div>
  )
}