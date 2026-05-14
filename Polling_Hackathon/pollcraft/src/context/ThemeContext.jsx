import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { themes } from '../themes.js'

const ThemeContext = createContext(null)

function camelToKebab(str) {
  return str.replace(/([A-Z])/g, m => '-' + m.toLowerCase())
}

function themeToVars(theme) {
  const vars = {}
  const map = (prefix, obj) => {
    for (const [key, val] of Object.entries(obj)) {
      if (val === null || Array.isArray(val)) continue
      const varName = `--${prefix}-${camelToKebab(key)}`
      if (typeof val === 'object') {
        map(`${prefix}-${camelToKebab(key)}`, val)
      } else {
        vars[varName] = val
      }
    }
  }
  const { brand, signal, status, jade, azure, crimson, violet, surface, text, border, bg, shadow } = theme
  map('brand', brand)
  map('signal', signal)
  map('status', status)
  map('jade', jade)
  map('azure', azure)
  map('crimson', crimson)
  map('violet', violet)
  map('surface', surface)
  map('text', text)
  map('border', border)
  map('bg', bg)
  map('shadow', shadow)
  return vars
}

function applyVars(vars) {
  const root = document.documentElement
  for (const [k, v] of Object.entries(vars)) {
    root.style.setProperty(k, v)
  }
}

function flattenAliases(vars) {
  const aliases = {
    '--nav-bg': vars['--bg-nav'],
    '--card-bg': vars['--bg-card'],
    '--page-bg': vars['--bg-page'],
    '--input-bg': vars['--bg-input'],
    '--modal-bg': vars['--bg-modal'],
    '--modal-border': vars['--bg-modal-border'],
    '--tab-bg': vars['--bg-tab'],
    '--tab-active-bg': vars['--bg-tab-active'],
    '--modal-overlay': vars['--bg-modal-overlay'],
    '--shadow-card': vars['--shadow-card'],
    '--shadow-modal': vars['--shadow-modal'],
    '--shadow-card-hover': vars['--shadow-card-hover'],
    '--brand': vars['--brand-default'],
    '--signal': vars['--signal-default'],
    '--jade': vars['--jade-default'],
    '--azure': vars['--azure-default'],
    '--crimson': vars['--crimson-default'],
    '--violet': vars['--violet-default'],
    '--text-primary': vars['--text-primary'],
    '--text-secondary': vars['--text-secondary'],
    '--text-muted': vars['--text-muted'],
    '--text-inverse': vars['--text-inverse'],
    '--border-subtle': vars['--border-subtle'],
    '--border-default': vars['--border-default'],
  }
  return { ...vars, ...aliases }
}

export function ThemeProvider({ children }) {
  const [themeName, setThemeNameState] = useState(() => {
    try { return localStorage.getItem('pollnow-theme') || 'dark' } catch { return 'dark' }
  })

  const theme = themes[themeName] || themes.dark

  useEffect(() => {
    const vars = themeToVars(theme)
    const all = flattenAliases(vars)
    applyVars(all)
    document.documentElement.classList.remove('light', 'dark', 'retro', 'terminal', 'neon', 'minimal', 'glass', 'mono')
    document.documentElement.classList.add(themeName)
    try { localStorage.setItem('pollnow-theme', themeName) } catch {}
  }, [themeName, theme])

  const setThemeName = useCallback((name) => {
    if (themes[name]) setThemeNameState(name)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeNameState(t => t === 'dark' ? 'light' : 'dark')
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, themeName, toggleTheme, setThemeName }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}