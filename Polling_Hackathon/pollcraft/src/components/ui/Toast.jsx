import { useState, useCallback, createContext, useContext } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)
let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((msg, type = 'info', duration = 3500) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const remove = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), [])

  return (
    <ToastContext.Provider value={{ success: (m) => add(m, 'success'), error: (m) => add(m, 'error'), info: (m) => add(m, 'info') }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80">
        {toasts.map(t => <Toast key={t.id} toast={t} onRemove={remove} />)}
      </div>
    </ToastContext.Provider>
  )
}

function Toast({ toast, onRemove }) {
  const icons = {
    success: <CheckCircle size={16} style={{ color: 'var(--jade)', flexShrink: 0 }} />,
    error: <AlertCircle size={16} style={{ color: 'var(--crimson)', flexShrink: 0 }} />,
    info: <Info size={16} style={{ color: 'var(--azure)', flexShrink: 0 }} />,
  }
  return (
    <div className="flex items-start gap-3 rounded-sm px-4 py-3 shadow-2xl animate-in" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-default)' }}>
      {icons[toast.type]}
      <span className="text-sm flex-1 leading-snug" style={{ color: 'var(--text-primary)' }}>{toast.msg}</span>
      <button onClick={() => onRemove(toast.id)} style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
        <X size={14} />
      </button>
    </div>
  )
}

export function useToast() { return useContext(ToastContext) }
