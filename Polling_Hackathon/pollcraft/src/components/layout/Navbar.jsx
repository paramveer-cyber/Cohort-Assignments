import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import { BarChart2, LayoutDashboard, Compass, LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const navLink = (to, label, Icon) => {
    const active = location.pathname === to
    return (
      <Link
        to={to}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors"
        style={active
          ? { color: 'var(--text-primary)', background: 'var(--surface-600)' }
          : { color: 'var(--text-muted)' }
        }
        onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary)' }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-muted)' }}
      >
        <Icon size={13} />
        {label}
      </Link>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center px-4 sm:px-6" style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(12px)' }}>
      <Link to="/" className="flex items-center gap-2 mr-6">
        <div className="w-6 h-6 flex items-center justify-center" style={{ background: 'var(--brand)' }}>
          <BarChart2 size={13} style={{ color: 'var(--text-inverse)' }} strokeWidth={2.5} />
        </div>
        <span className="text-lg font-semibold tracking-wider hidden sm:block" style={{ color: 'var(--text-primary)' }}>POLLNOW</span>
      </Link>

      <div className="flex items-center gap-1 flex-1">
        {navLink('/discover', 'Discover', Compass)}
        {user && navLink('/dashboard', 'Dashboard', LayoutDashboard)}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <>
            <Link
              to="/profile"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-sm transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <User size={13} />
              <span className="hidden sm:block truncate max-w-[80px]">{user.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-sm transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--crimson)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <LogOut size={13} />
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-sm transition-colors"
            style={{ background: 'var(--brand)', color: 'var(--text-inverse)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-light)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand)' }}
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}