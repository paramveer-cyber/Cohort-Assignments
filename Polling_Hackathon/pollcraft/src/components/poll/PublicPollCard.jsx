import { Link } from 'react-router-dom'
import { ArrowRight, Users, User, BarChart2, Clock } from 'lucide-react'

const STATUS_META = {
  published: { label: 'Results', activeColor: 'var(--jade)', activeBg: 'var(--jade-dim)', activeBorder: 'var(--jade-border)', dotStyle: { background: 'var(--jade)' } },
  active: { label: 'Live', activeColor: 'var(--signal)', activeBg: 'var(--signal-dim)', activeBorder: 'var(--signal-dim)', dotStyle: { background: 'var(--signal)' }, dotAnimate: true },
  expired: { label: 'Ended', dotStyle: { background: 'var(--status-draft)' } },
}

function pollHref(poll) {
  if (poll.status === 'published' || poll.status === 'expired') return `/results/${poll.id}`
  return `/poll/${poll.slug}`
}

export default function PublicPollCard({ poll }) {
  const meta = STATUS_META[poll.status] || STATUS_META.expired
  const isResultsPoll = poll.status === 'published' || poll.status === 'expired'

  return (
    <Link to={pollHref(poll)}
      className="card p-5 flex flex-col gap-4 group transition-all duration-200 relative overflow-hidden"
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-default)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-body font-semibold text-base leading-snug line-clamp-2 flex-1 transition-colors" style={{ color: 'var(--text-primary)' }}>
          {poll.title}
        </h3>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border rounded-sm text-xs font-mono shrink-0"
          style={meta.activeColor ? { background: meta.activeBg, borderColor: meta.activeBorder, color: meta.activeColor } : { background: 'var(--surface-700)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dotAnimate ? 'animate-pulse-slow' : ''}`} style={meta.dotStyle} />
          {meta.label}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs font-mono flex-wrap" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1.5"><User size={11} />{poll.creator?.name || 'Anonymous'}</span>
        {poll.anonymousAllowed && <span className="flex items-center gap-1.5"><Users size={11} />Open</span>}
        {poll.expiresAt && <span className="flex items-center gap-1.5"><Clock size={11} />{new Date(poll.expiresAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>}
        <span className="ml-auto">{new Date(poll.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
      </div>

      <div className="flex items-center gap-2 pt-3 text-xs font-mono transition-colors" style={{ borderTop: '1px solid var(--border-subtle)', color: isResultsPoll ? 'var(--jade)' : 'var(--signal)' }}>
        {isResultsPoll ? (<><BarChart2 size={13} />View Results</>) : (<><span className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ background: 'var(--signal)' }} />Vote Now</>)}
        <ArrowRight size={13} className="ml-auto group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  )
}
