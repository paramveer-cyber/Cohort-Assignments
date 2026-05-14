import { Trash2, X, AlertTriangle } from 'lucide-react'

export default function DeleteModal({ poll, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 modal-overlay" onClick={onClose} />
      <div className="relative modal-panel rounded-sm w-full max-w-sm shadow-2xl animate-in">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} style={{ color: 'var(--crimson)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>DELETE POLL</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Permanently delete <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>"{poll.title}"</span>?
          </p>
          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            All questions, responses, and analytics will be removed. This cannot be undone.
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 font-semibold text-sm rounded-sm transition-colors disabled:opacity-50"
            style={{ background: 'var(--crimson)', color: 'var(--text-inverse)' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            {loading ? (
              <span className="flex gap-1">
                {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--text-inverse)', animationDelay: `${i*0.15}s` }} />)}
              </span>
            ) : (<><Trash2 size={13} /> Delete</>)}
          </button>
        </div>
      </div>
    </div>
  )
}