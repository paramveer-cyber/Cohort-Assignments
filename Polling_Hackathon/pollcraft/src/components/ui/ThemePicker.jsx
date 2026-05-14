import { useTheme } from '../../context/ThemeContext.jsx'
import { themeList } from '../../themes.js'
import { Check } from 'lucide-react'

export default function ThemePicker() {
  const { themeName, setThemeName } = useTheme()

  return (
    <div>
      <p style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
        Website Theme
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {themeList.map(t => {
          const active = t.id === themeName
          return (
            <button
              key={t.id}
              onClick={() => setThemeName(t.id)}
              style={{
                border: active ? '2px solid var(--brand)' : '2px solid var(--border-default)',
                borderRadius: '8px',
                padding: '10px 6px 8px',
                background: active ? 'var(--brand-dim)' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--text-muted)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border-default)' }}
            >
              {active && (
                <div style={{
                  position: 'absolute', top: '4px', right: '4px',
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={9} color="#fff" />
                </div>
              )}
              <div style={{ display: 'flex', gap: '3px' }}>
                {t.preview.map((c, i) => (
                  <div key={i} style={{ width: '14px', height: '14px', borderRadius: '3px', background: c, border: '1px solid rgba(128,128,128,0.2)' }} />
                ))}
              </div>
              <span style={{
                fontSize: '10px',
                fontFamily: 'monospace',
                color: active ? 'var(--brand)' : 'var(--text-muted)',
                fontWeight: active ? 700 : 400,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}