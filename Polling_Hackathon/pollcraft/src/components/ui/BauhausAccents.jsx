export function GeoBg({ variant = 'default' }) {
  if (variant === 'auth') return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="10%" cy="15%" r="120" fill="none" stroke="var(--border-subtle)" strokeWidth="1" />
      <circle cx="10%" cy="15%" r="60" fill="none" stroke="var(--border-subtle)" strokeWidth="1" />
      <rect x="75%" y="5%" width="80" height="80" fill="none" stroke="var(--border-subtle)" strokeWidth="1" />
      <rect x="78%" y="8%" width="40" height="40" fill="var(--surface-700)" />
      <polygon points="680,340 740,280 680,220" fill="none" stroke="var(--border-subtle)" strokeWidth="1" />
      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--surface-700)" strokeWidth="1" />
      <line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--surface-700)" strokeWidth="1" />
      <circle cx="90%" cy="60%" r="8" fill="var(--border-subtle)" />
      <circle cx="15%" cy="70%" r="4" fill="var(--brand)" opacity="0.12" />
      <rect x="5%" y="88%" width="60" height="4" fill="var(--border-subtle)" />
    </svg>
  )

  if (variant === 'hero') return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 0 }} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--border-subtle)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid)" />
      <circle cx="92%" cy="12%" r="180" fill="none" stroke="var(--surface-600)" strokeWidth="1" />
      <circle cx="92%" cy="12%" r="90" fill="none" stroke="var(--border-subtle)" strokeWidth="1" />
      <rect x="-2%" y="68%" width="120" height="120" fill="none" stroke="var(--surface-600)" strokeWidth="1" transform="rotate(-15,-2,68)" />
    </svg>
  )

  if (variant === 'discover') return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0, opacity: 0.5 }} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="cross-grid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
          <line x1="24" y1="0" x2="24" y2="48" stroke="var(--surface-700)" strokeWidth="0.5" />
          <line x1="0" y1="24" x2="48" y2="24" stroke="var(--surface-700)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cross-grid)" />
      <circle cx="95%" cy="8%" r="200" fill="none" stroke="var(--surface-600)" strokeWidth="1.5" />
      <rect x="0" y="0" width="6" height="100%" fill="var(--surface-800)" />
      <circle cx="50%" cy="0" r="300" fill="none" stroke="var(--surface-600)" strokeWidth="1" />
    </svg>
  )

  if (variant === 'features') return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="feat-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="var(--surface-600)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#feat-dots)" />
      <line x1="0" y1="0" x2="100%" y2="100%" stroke="var(--surface-600)" strokeWidth="0.5" />
      <circle cx="0" cy="100%" r="320" fill="none" stroke="var(--surface-600)" strokeWidth="1" />
      <rect x="80%" y="0" width="2" height="100%" fill="var(--surface-700)" opacity="0.6" />
      <circle cx="80%" cy="50%" r="6" fill="var(--brand)" opacity="0.15" />
    </svg>
  )

  if (variant === 'workflow') return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="wf-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="60" height="60" fill="none" stroke="var(--surface-700)" strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wf-grid)" />
      <circle cx="100%" cy="0" r="400" fill="none" stroke="var(--surface-600)" strokeWidth="1.5" />
      <circle cx="100%" cy="0" r="250" fill="none" stroke="var(--surface-700)" strokeWidth="1" />
      <line x1="0" y1="50%" x2="60%" y2="50%" stroke="var(--surface-600)" strokeWidth="0.5" />
    </svg>
  )

  if (variant === 'create') return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0, opacity: 0.6 }} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="create-cross" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
          <line x1="18" y1="0" x2="18" y2="36" stroke="var(--surface-700)" strokeWidth="0.4" />
          <line x1="0" y1="18" x2="36" y2="18" stroke="var(--surface-700)" strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#create-cross)" />
      <rect x="0" y="0" width="4" height="100%" fill="var(--brand)" opacity="0.08" />
      <circle cx="100%" cy="100%" r="280" fill="none" stroke="var(--surface-600)" strokeWidth="1" />
      <circle cx="100%" cy="100%" r="160" fill="none" stroke="var(--border-subtle)" strokeWidth="0.8" />
    </svg>
  )

  if (variant === 'profile') return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0, opacity: 0.55 }} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="prof-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill="var(--surface-600)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#prof-dots)" />
      <circle cx="100%" cy="0" r="220" fill="none" stroke="var(--surface-600)" strokeWidth="1" />
      <circle cx="0" cy="100%" r="180" fill="none" stroke="var(--surface-600)" strokeWidth="1" />
      <line x1="0" y1="33%" x2="100%" y2="33%" stroke="var(--surface-700)" strokeWidth="0.5" />
      <line x1="0" y1="66%" x2="100%" y2="66%" stroke="var(--surface-700)" strokeWidth="0.5" />
    </svg>
  )

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0, opacity: 0.45 }} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="dot-sm" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="var(--surface-700)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-sm)" />
    </svg>
  )
}

export function BauhausCorner({ position = 'tr', color = 'brand', size = 80 }) {
  const c = color === 'brand' ? 'var(--brand)' : color === 'azure' ? 'var(--azure)' : color === 'jade' ? 'var(--jade)' : color === 'signal' ? 'var(--signal)' : color === 'crimson' ? 'var(--crimson)' : 'var(--brand)'
  const opacity = 0.07
  const s = size
  if (position === 'tr') return (
    <svg className="absolute top-0 right-0 pointer-events-none" width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden="true" style={{ zIndex: 0 }}>
      <rect x={s / 2} y="0" width={s / 2} height={s / 2} fill={c} opacity={opacity} />
      <circle cx={s} cy="0" r={s / 2} fill="none" stroke={c} strokeWidth="1" opacity={opacity * 3} />
      <circle cx={s} cy="0" r={s * 0.2} fill={c} opacity={opacity * 1.5} />
    </svg>
  )
  if (position === 'bl') return (
    <svg className="absolute bottom-0 left-0 pointer-events-none" width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden="true" style={{ zIndex: 0 }}>
      <rect x="0" y={s / 2} width={s / 2} height={s / 2} fill={c} opacity={opacity} />
      <circle cx="0" cy={s} r={s / 2} fill="none" stroke={c} strokeWidth="1" opacity={opacity * 3} />
    </svg>
  )
  if (position === 'tl') return (
    <svg className="absolute top-0 left-0 pointer-events-none" width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden="true" style={{ zIndex: 0 }}>
      <rect x="0" y="0" width={s / 2} height={s / 2} fill={c} opacity={opacity} />
      <circle cx="0" cy="0" r={s / 2} fill="none" stroke={c} strokeWidth="1" opacity={opacity * 3} />
    </svg>
  )
  if (position === 'br') return (
    <svg className="absolute bottom-0 right-0 pointer-events-none" width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden="true" style={{ zIndex: 0 }}>
      <rect x={s / 2} y={s / 2} width={s / 2} height={s / 2} fill={c} opacity={opacity} />
      <circle cx={s} cy={s} r={s / 2} fill="none" stroke={c} strokeWidth="1" opacity={opacity * 3} />
    </svg>
  )
  return null
}

export function BauhausRule({ vertical = false, accent = 'brand' }) {
  const c = accent === 'brand' ? 'var(--brand)' : accent === 'jade' ? 'var(--jade)' : accent === 'signal' ? 'var(--signal)' : 'var(--border-default)'
  if (vertical) return (
    <div aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '3px', background: `linear-gradient(to bottom, ${c}, transparent)`, opacity: 0.25, zIndex: 0, pointerEvents: 'none' }} />
  )
  return (
    <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(to right, ${c}, transparent)`, opacity: 0.2, zIndex: 0, pointerEvents: 'none' }} />
  )
}

export function SectionDivider({ accent = false }) {
  return (
    <div className="relative flex items-center gap-4 my-8" aria-hidden="true">
      <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
      {accent ? (
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rotate-45 inline-block" style={{ background: 'var(--brand-dim-strong)' }} />
          <span className="w-1 h-1 rounded-full inline-block" style={{ background: 'var(--text-muted)' }} />
          <span className="w-2 h-2 rotate-45 inline-block" style={{ background: 'var(--brand-dim-strong)' }} />
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => <span key={i} className="w-1 h-1 rounded-full inline-block" style={{ background: 'var(--border-default)' }} />)}
        </div>
      )}
      <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
    </div>
  )
}

export function GeometricCard({ children, className = '', accent = false }) {
  return (
    <div className={`card relative overflow-hidden ${className}`}>
      {accent && (
        <>
          <svg className="absolute top-0 right-0 pointer-events-none" width="64" height="64" viewBox="0 0 64 64" aria-hidden="true" style={{ zIndex: 0 }}>
            <rect x="32" y="0" width="32" height="32" fill="var(--brand)" opacity="0.04" />
            <circle cx="64" cy="0" r="32" fill="none" stroke="var(--brand)" strokeWidth="0.5" opacity="0.15" />
          </svg>
          <svg className="absolute bottom-0 left-0 pointer-events-none" width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" style={{ zIndex: 0 }}>
            <circle cx="0" cy="40" r="24" fill="none" stroke="var(--border-subtle)" strokeWidth="1" />
          </svg>
        </>
      )}
      {children}
    </div>
  )
}

export function GeoTick({ x = '0', y = '0', size = 8 }) {
  return (
    <svg className="pointer-events-none" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ position: 'absolute', left: x, top: y, zIndex: 0, opacity: 0.3 }}>
      <line x1={size / 2} y1="0" x2={size / 2} y2={size} stroke="var(--brand)" strokeWidth="1" />
      <line x1="0" y1={size / 2} x2={size} y2={size / 2} stroke="var(--brand)" strokeWidth="1" />
    </svg>
  )
}