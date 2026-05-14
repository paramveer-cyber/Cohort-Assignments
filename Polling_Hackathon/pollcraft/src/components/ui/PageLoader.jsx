export default function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'var(--page-bg)' }}>
      <div className="relative flex items-center justify-center">
        <svg width="80" height="80" viewBox="0 0 80 80" className="animate-spin" style={{ animationDuration: '3s' }} aria-hidden="true">
          <rect x="10" y="10" width="28" height="28" fill="none" stroke="var(--border-default)" strokeWidth="1.5" />
          <rect x="42" y="42" width="28" height="28" fill="none" stroke="var(--border-default)" strokeWidth="1.5" />
          <circle cx="56" cy="24" r="14" fill="none" stroke="var(--surface-600)" strokeWidth="1.5" />
        </svg>
        <div className="absolute flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--signal)', animationDelay: `${i*0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
