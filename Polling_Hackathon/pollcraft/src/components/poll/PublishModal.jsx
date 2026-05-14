import { useState } from 'react'
import { Globe, Users, Lock, X, ArrowRight } from 'lucide-react'

const ALL_OPTIONS = [
  { id: 'all', icon: Globe, label: 'Public', desc: 'Any authenticated user can view results', activeColor: 'var(--jade)', activeBorder: 'var(--jade-border)', activeBg: 'var(--jade-dim)' },
  { id: 'respondents', icon: Users, label: 'Respondents Only', desc: 'Results visible only to authenticated users who submitted a response', activeColor: 'var(--azure)', activeBorder: 'var(--azure-border)', activeBg: 'var(--azure-dim)', requiresAuth: true },
  { id: 'private', icon: Lock, label: 'Private', desc: 'Results visible only to you — creator only', activeColor: 'var(--text-secondary)', activeBorder: 'var(--border-default)', activeBg: 'var(--surface-700)' },
]

export default function PublishModal({ poll, onConfirm, onClose, loading }) {
  const options = ALL_OPTIONS.filter(o => !o.requiresAuth || !poll?.anonymousAllowed)
  const [selected, setSelected] = useState('all')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 modal-overlay" onClick={onClose} />
      <div className="relative modal-panel rounded-sm w-full max-w-md shadow-2xl animate-in">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>PUBLISH POLL</h2>
            <p className="text-xs font-mono mt-0.5 truncate max-w-xs" style={{ color: 'var(--text-muted)' }}>{poll.title}</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Who can see the results?</p>
          {poll?.anonymousAllowed && (
            <p className="text-xs font-mono px-3 py-2 rounded-sm mb-2" style={{ background: 'var(--azure-dim)', color: 'var(--azure)', border: '1px solid var(--azure-border)' }}>
              "Respondents only" unavailable — anonymous polls cannot track voters
            </p>
          )}
          {options.map(opt => {
            const Icon = opt.icon
            const active = selected === opt.id
            return (
              <button key={opt.id} onClick={() => setSelected(opt.id)}
                className="w-full text-left flex items-start gap-4 px-4 py-3.5 border rounded-sm transition-all duration-150"
                style={{ borderColor: active ? opt.activeBorder : 'var(--border-subtle)', background: active ? opt.activeBg : 'transparent' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border-default)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
              >
                <div className="mt-0.5 shrink-0" style={{ color: active ? opt.activeColor : 'var(--text-muted)' }}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: active ? opt.activeColor : 'var(--text-secondary)' }}>{opt.label}</p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>{opt.desc}</p>
                </div>
                <div className="w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors"
                  style={{ borderColor: active ? opt.activeBorder : 'var(--border-default)', background: active ? opt.activeColor : 'transparent' }}>
                  {active && <span className="w-1.5 h-1.5 rounded-full block" style={{ background: 'var(--modal-bg)' }} />}
                </div>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
          <button onClick={() => onConfirm(selected)} disabled={loading} className="btn-primary flex-1 justify-center text-sm">
            {loading ? (
              <span className="flex gap-1">
                {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--text-inverse)', animationDelay: `${i*0.15}s` }} />)}
              </span>
            ) : (<>Publish <ArrowRight size={14} /></>)}
          </button>
        </div>
      </div>
    </div>
  )
}