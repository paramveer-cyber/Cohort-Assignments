import { Palette } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'
import { themeList } from '../../themes.js'

export default function ThemeToggle({ className = '' }) {
  const { themeName, setThemeName } = useTheme()

  const cycleTheme = () => {
    const idx = themeList.findIndex(t => t.id === themeName)
    const next = themeList[(idx + 1) % themeList.length]
    setThemeName(next.id)
  }

  return (
    <button
      onClick={cycleTheme}
      className={`w-8 h-8 flex items-center justify-center rounded-sm transition-colors ${className}`}
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-600)' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = '' }}
      aria-label="Cycle theme"
      title={`Theme: ${themeName}`}
    >
      <Palette size={15} />
    </button>
  )
}