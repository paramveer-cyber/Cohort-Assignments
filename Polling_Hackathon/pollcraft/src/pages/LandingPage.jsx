import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BarChart2, Zap, Globe, Users, ArrowRight, CheckCircle, TrendingUp, Radio, Clock, Shield, ChevronRight, Menu, X } from 'lucide-react'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'

function useIntersect(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function AnimatedSection({ children, delay = 0, className = '' }) {
  const [ref, visible] = useIntersect()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

const features = [
  { icon: <Zap size={18} />, title: 'Instant Vote Propagation', desc: 'Every cast vote broadcasts via WebSocket to all connected viewers ; no refresh, no delay, no approximation.' },
  { icon: <Globe size={18} />, title: 'Flexible Visibility', desc: 'Publish polls publicly, limit access to respondents, or keep results private. You control the audience.' },
  { icon: <Shield size={18} />, title: 'Anonymous Mode', desc: 'Enable anonymous voting so participants answer freely. No account required when you want broad reach.' },
  { icon: <TrendingUp size={18} />, title: 'Live Analytics', desc: 'Per-option vote distribution, hourly participation trends, and live viewer counts ; all updating in real time.' },
  { icon: <Users size={18} />, title: 'Live Viewer Presence', desc: 'Track exactly how many people are watching results unfold with your poll room open right now.' },
  { icon: <Clock size={18} />, title: 'Scheduled Expiry', desc: 'Set a deadline and walk away. Polls auto-expire at the exact time you specify, ready to publish.' },
]

const workflow = [
  { n: '01', title: 'Create', desc: 'Build your poll in seconds. Define options, toggle anonymous mode, set an optional expiry.' },
  { n: '02', title: 'Activate', desc: 'Go live with one click. Share the link ; your poll starts accepting real responses immediately.' },
  { n: '03', title: 'Watch', desc: 'See results stream in live. Track participation, option momentum, and active viewer count.' },
  { n: '04', title: 'Publish', desc: 'Close the poll and publish results ; public, respondents-only, or private ; with permanent analytics.' },
]

const marqueeItems = ['Real-time Voting', 'WebSocket Powered', 'Zero Refresh', 'Live Analytics', 'Anonymous Mode', 'Scheduled Expiry', 'Live Viewer Count', 'Instant Results', 'Swiss Precision', 'Bauhaus Design']

function InteractivePollDemo() {
  const [voted, setVoted] = useState(null)
  const [counts, setCounts] = useState([64, 22, 14])

  const opts = [
    { label: 'TypeScript everywhere', color: 'var(--brand)' },
    { label: 'JavaScript is enough', color: 'var(--azure)' },
    { label: 'Gradually typed', color: 'var(--jade)' },
  ]
  const total = counts.reduce((a, b) => a + b, 0)

  const handleVote = (i) => {
    if (voted !== null) return
    setVoted(i)
    setCounts(prev => { const n = [...prev]; n[i] += 1; return n })
  }

  return (
    <div className="card p-6 relative overflow-hidden" style={{ borderColor: 'var(--border-default)' }}>
      <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: 'var(--brand)' }} />
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Demo</p>
          <h3 className="font-body font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>What's your typing philosophy?</h3>
        </div>
        <span className="status-badge" style={{ background: 'var(--status-active-bg)', color: 'var(--status-active)', border: '1px solid var(--status-active-border)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow inline-block" style={{ background: 'var(--status-active)' }} />
          Live
        </span>
      </div>

      <div className="space-y-3 mb-5">
        {opts.map((opt, i) => {
          const pct = Math.round((counts[i] / total) * 100)
          return (
            <button
              key={i}
              onClick={() => handleVote(i)}
              disabled={voted !== null}
              className="w-full text-left group"
              style={{ cursor: voted !== null ? 'default' : 'pointer' }}
            >
              <div className="flex justify-between text-xs font-mono mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <span style={voted === i ? { color: 'var(--text-primary)', fontWeight: 600 } : {}}>{opt.label}</span>
                <span style={voted !== null ? { color: opt.color, fontWeight: 600 } : {}}>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-600)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${pct}%`, background: opt.color, opacity: voted === null ? 0.45 : (voted === i ? 1 : 0.7) }}
                />
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
        <span>{total} votes</span>
        {voted === null
          ? <span>Click an option to vote →</span>
          : <span style={{ color: 'var(--status-active)' }}>✓ Vote recorded</span>
        }
      </div>
    </div>
  )
}

function StackDiagram() {
  const layers = [
    { label: 'Browser', detail: 'React + Socket.IO', color: 'var(--azure)' },
    { label: 'API', detail: 'Express + JWT', color: 'var(--brand)' },
    { label: 'Cache', detail: 'Redis TTL 30s', color: 'var(--jade)' },
    { label: 'DB', detail: 'PostgreSQL', color: 'var(--violet)' },
    { label: 'Socket', detail: 'Realtime rooms', color: 'var(--signal-dark)' },
  ]
  return (
    <div className="card p-5 relative overflow-hidden" style={{ borderColor: 'var(--border-default)' }}>
      <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: 'var(--azure)' }} />
      <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Stack layers</p>
      <div className="space-y-3">
        {layers.map((layer, i) => (
          <div key={layer.label} className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center rounded-sm text-xs font-mono font-semibold flex-shrink-0"
              style={{ background: `${layer.color}18`, color: layer.color, border: `1px solid ${layer.color}30` }}>
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-semibold" style={{ color: layer.color }}>{layer.label}</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{layer.detail}</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-600)' }}>
                <div className="h-full rounded-full" style={{ width: `${100 - i * 10}%`, background: layer.color, opacity: 0.65 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 flex items-center gap-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ background: 'var(--status-active)' }} />
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Sub-50ms broadcast latency</span>
      </div>
    </div>
  )
}

function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'var(--nav-bg)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0" >
            <img src="/icon.png" alt="Logo" className='scale-150'/>
            {/* <BarChart2 size={14} color="var(--text-inverse)" strokeWidth={2.5} /> */}
          </div>
          <span className="font-display text-2xl tracking-wider" style={{ color: 'var(--text-primary)' }}>POLLNOW</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[['Features', '#features'], ['How It Works', '#workflow'], ['Architecture', '#architecture'], ['Guide', '/help']].map(([label, href]) => (
            <a key={label} href={href} className="px-4 py-2 text-sm transition-colors rounded-sm"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-700)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = '' }}>
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/discover" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-sm transition-all"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-700)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = '' }}>
            Discover
          </Link>
          <Link to="/auth" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-sm transition-all duration-200"
            style={{ background: 'var(--brand)', color: 'var(--text-inverse)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-light)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-glow)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.boxShadow = 'none' }}>
            Get Started
            <ArrowRight size={13} />
          </Link>
          <button className="md:hidden transition-colors focus-ring" onClick={() => setMenuOpen(!menuOpen)} style={{ color: 'var(--text-muted)' }}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden px-6 py-4 space-y-1" style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
          {[['Features', '#features'], ['How It Works', '#workflow'], ['Architecture', '#architecture'], ['Guide', '/help'], ['Discover Polls', '/discover']].map(([label, href]) => (
            <a key={label} href={href} className="block px-3 py-2.5 text-sm rounded-sm transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setMenuOpen(false)}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-700)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = '' }}>
              {label}
            </a>
          ))}
        </div>
      )}
    </header>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill="var(--surface-600)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
        <div className="absolute top-0 right-0 w-px h-full opacity-20" style={{ background: 'var(--border-default)' }} />
        <div className="absolute top-0 left-1/2 w-px h-full opacity-10" style={{ background: 'var(--border-default)' }} />
        <svg className="absolute top-16 right-16 opacity-10" width="160" height="160" viewBox="0 0 160 160">
          <rect x="0" y="0" width="80" height="80" fill="none" stroke="var(--brand)" strokeWidth="1" />
          <rect x="80" y="80" width="80" height="80" fill="var(--brand)" opacity="0.08" />
          <circle cx="80" cy="80" r="50" fill="none" stroke="var(--brand)" strokeWidth="0.5" strokeDasharray="3 6" />
        </svg>
        <svg className="absolute bottom-20 left-12 opacity-8" width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="none" stroke="var(--azure)" strokeWidth="1" />
          <line x1="2" y1="50" x2="98" y2="50" stroke="var(--azure)" strokeWidth="0.5" />
          <line x1="50" y1="2" x2="50" y2="98" stroke="var(--azure)" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm"
              style={{ background: 'var(--status-active-bg)', border: '1px solid var(--status-active-border)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ background: 'var(--status-active)' }} />
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--status-active)' }}>WebSocket Powered</span>
            </div>
          </div>

          <h1 className="font-display leading-none tracking-wider mb-6">
            <span className="block text-7xl sm:text-8xl lg:text-9xl" style={{ color: 'var(--text-primary)' }}>POLLS</span>
            <span className="block text-7xl sm:text-8xl lg:text-9xl" style={{ color: 'var(--brand)' }}>THAT</span>
            <span className="block text-7xl sm:text-8xl lg:text-9xl" style={{ color: 'var(--text-primary)' }}>MOVE.</span>
          </h1>

          <p className="text-lg leading-relaxed max-w-md mb-2" style={{ color: 'var(--text-secondary)' }}>
            Create polls. Go live instantly. Every vote propagates via WebSocket to every connected viewer ; no reload, no polling, no lag.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-base rounded-sm transition-all duration-200"
              style={{ background: 'var(--brand)', color: 'var(--text-inverse)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-light)'; e.currentTarget.style.boxShadow = '0 0 0 4px var(--brand-glow), 0 2px 12px var(--brand-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              Start for free
              <ArrowRight size={16} />
            </Link>
            <Link to="/discover" className="inline-flex items-center gap-2 px-6 py-3 text-base rounded-sm transition-all"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-700)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = '' }}>
              Browse live polls
            </Link>
          </div>

          <div className="flex items-center gap-8 mt-12 pt-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {[['< 50ms', 'Broadcast latency'], ['Socket.IO', 'Realtime engine'], ['Zero', 'Refresh needed']].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-2xl tracking-wider" style={{ color: 'var(--text-primary)' }}>{n}</div>
                <div className="text-xs font-mono uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <AnimatedSection delay={100}>
            <InteractivePollDemo />
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <StackDiagram />
          </AnimatedSection>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="flex flex-col items-center gap-1 animate-bounce opacity-25">
          <div className="w-px h-6" style={{ background: 'var(--text-muted)' }} />
          <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Scroll</div>
        </div>
      </div>
    </section>
  )
}

function MarqueeSection() {
  const items = [...marqueeItems, ...marqueeItems]
  return (
    <div className="relative py-4 overflow-hidden" style={{ background: 'var(--surface-700)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="flex gap-0" style={{ width: 'max-content', animation: 'marquee 28s linear infinite' }}>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-6 px-6">
            <span className="text-xs font-mono uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{item}</span>
            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--brand)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg className="w-full h-full">
          <defs>
            <pattern id="feat-grid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
              <line x1="48" y1="0" x2="48" y2="48" stroke="var(--border-subtle)" strokeWidth="0.5" />
              <line x1="0" y1="48" x2="48" y2="48" stroke="var(--border-subtle)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#feat-grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection>
          <div className="flex items-end justify-between mb-16 gap-8 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-sm"
                style={{ background: 'var(--azure-dim-bg)', border: '1px solid var(--azure-dim-border)' }}>
                <Radio size={12} style={{ color: 'var(--azure)' }} />
                <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--azure)' }}>Platform</span>
              </div>
              <h2 className="font-display text-6xl lg:text-7xl tracking-wider leading-none" style={{ color: 'var(--text-primary)' }}>
                BUILT<br />
                <span style={{ color: 'var(--brand)' }}>RIGHT.</span>
              </h2>
            </div>
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Every feature serves precision. No filler ; just what real-time polling needs to work at its best.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: 'var(--border-subtle)' }}>
          {features.map((f, i) => (
            <AnimatedSection key={f.title} delay={i * 60}>
              <div
                className="p-7 h-full relative group transition-all duration-200 cursor-default"
                style={{ background: 'var(--card-bg)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-700)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--card-bg)' }}
              >
                <div className="absolute top-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ background: 'var(--brand)' }} />
                <div className="w-9 h-9 flex items-center justify-center rounded-sm mb-5 flex-shrink-0"
                  style={{ background: 'var(--brand-dim)', color: 'var(--brand)', border: '1px solid var(--brand-dim-strong)' }}>
                  {f.icon}
                </div>
                <h3 className="font-body font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

function ArchitectureSection() {
  return (
    <section id="architecture" className="relative py-28 overflow-hidden" style={{ background: 'var(--surface-800)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-sm"
              style={{ background: 'var(--brand-dim)', border: '1px solid var(--brand-dim-strong)' }}>
              <Zap size={12} style={{ color: 'var(--brand)' }} />
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--brand)' }}>Architecture</span>
            </div>
            <h2 className="font-display text-6xl lg:text-7xl tracking-wider leading-none mb-6" style={{ color: 'var(--text-primary)' }}>
              BUILT<br />
              <span style={{ color: 'var(--brand)' }}>FOR</span><br />
              SPEED.
            </h2>
            <p className="text-base leading-relaxed max-w-md mb-8" style={{ color: 'var(--text-secondary)' }}>
              Purpose-built stack for sub-50ms vote propagation. Redis caches analytics, PostgreSQL stores everything durable, Socket.IO rooms broadcast updates instantly.
            </p>
            <div className="space-y-3">
              {['Redis-cached analytics with 30s TTL', 'Socket.IO rooms per poll ; zero broadcast overlap', 'JWT + refresh token rotation for security', 'Rate-limited vote submission prevents abuse'].map(item => (
                <div key={item} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle size={14} style={{ color: 'var(--jade)', flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <div className="card p-6 relative overflow-hidden" style={{ borderColor: 'var(--border-default)' }}>
              <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'var(--brand)' }} />
              <p className="text-xs font-mono uppercase tracking-widest mb-6 ml-4" style={{ color: 'var(--text-muted)' }}>Request flow</p>
              <div className="ml-4 space-y-0">
                {[
                  { step: 'User submits vote', tech: 'React → POST /api/votes', color: 'var(--azure)' },
                  { step: 'Auth & rate-limit check', tech: 'JWT middleware + Redis counter', color: 'var(--brand)' },
                  { step: 'Persist to database', tech: 'PostgreSQL via Drizzle ORM', color: 'var(--violet)' },
                  { step: 'Invalidate cache', tech: 'Redis analytics key evict', color: 'var(--jade)' },
                  { step: 'Broadcast to room', tech: 'Socket.IO → analytics-updated', color: 'var(--signal-dark)' },
                ].map((row, i, arr) => (
                  <div key={row.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: row.color }} />
                      {i < arr.length - 1 && <div className="w-px flex-1 my-1" style={{ background: 'var(--border-subtle)' }} />}
                    </div>
                    <div className={`pb-4 ${i === arr.length - 1 ? '' : ''}`}>
                      <p className="text-xs font-semibold leading-none mb-0.5" style={{ color: 'var(--text-primary)' }}>{row.step}</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{row.tech}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

function WorkflowSection() {
  return (
    <section id="workflow" className="relative py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection>
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-sm"
              style={{ background: 'var(--jade-dim)', border: '1px solid var(--jade-border)' }}>
              <ChevronRight size={12} style={{ color: 'var(--jade)' }} />
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--jade)' }}>How It Works</span>
            </div>
            <h2 className="font-display text-6xl lg:text-7xl tracking-wider leading-none" style={{ color: 'var(--text-primary)' }}>
              FOUR<br />
              <span style={{ color: 'var(--brand)' }}>STEPS.</span>
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: 'var(--border-subtle)' }}>
          {workflow.map((step, i) => (
            <AnimatedSection key={step.n} delay={i * 80}>
              <div className="p-7 h-full relative group" style={{ background: 'var(--card-bg)' }}>
                <div className="text-4xl font-semibold tabular-nums mb-5 leading-none" style={{ color: i === 0 ? 'var(--brand)' : 'var(--border-default)' }}>
                  {step.n}
                </div>
                <h3 className="text-lg font-semibold tracking-wide mb-2" style={{ color: 'var(--text-primary)' }}>{step.title.toUpperCase()}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="relative py-28 overflow-hidden" style={{ background: 'var(--surface-800)', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg className="w-full h-full">
          <defs>
            <pattern id="cta-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="var(--border-subtle)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-dots)" />
        </svg>
        <div className="absolute right-0 top-0 bottom-0 w-1" style={{ background: 'var(--brand)', opacity: 0.4 }} />
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'var(--brand)', opacity: 0.4 }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <AnimatedSection>
          <h2 className="font-display text-7xl sm:text-8xl lg:text-9xl tracking-wider leading-none mb-8" style={{ color: 'var(--text-primary)' }}>
            START<br />
            <span style={{ color: 'var(--brand)' }}>NOW.</span>
          </h2>
          <p className="text-lg max-w-lg mx-auto mb-12 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Your first poll live in under 60 seconds. No credit card, no setup. Real-time polling that just works.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2.5 px-8 py-4 font-semibold text-base rounded-sm transition-all duration-200"
              style={{ background: 'var(--brand)', color: 'var(--text-inverse)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-light)'; e.currentTarget.style.boxShadow = '0 0 0 5px var(--brand-glow), 0 4px 20px var(--brand-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              Create your first poll
              <ArrowRight size={16} />
            </Link>
            <Link to="/help" className="inline-flex items-center gap-2 px-8 py-4 text-base rounded-sm transition-all"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-700)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = '' }}>
              Read the guide
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="relative py-16" style={{ borderTop: '1px solid var(--border-subtle)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 flex items-center justify-center" style={{ background: 'var(--brand)' }}>
                <BarChart2 size={14} color="var(--text-inverse)" strokeWidth={2.5} />
              </div>
              <span className="font-display text-2xl tracking-wider" style={{ color: 'var(--text-primary)' }}>POLLNOW</span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Real-time polling with Bauhaus geometry and Swiss typographic precision.
            </p>
          </div>

          <div>
            <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Product</p>
            <div className="space-y-2.5">
              {[['Discover Polls', '/discover'], ['Create Poll', '/create'], ['Sign In', '/auth']].map(([item, to]) => (
                <div key={item}>
                  <Link to={to} className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
                    {item}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Resources</p>
            <div className="space-y-2.5">
              {[['Features', '#features'], ['Architecture', '#architecture'], ['Guide', '/help'], ['How It Works', '#workflow']].map(([item, href]) => (
                <div key={item}>
                  <a href={href} className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
                    {item}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>© 2025 PollNow. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ background: 'var(--jade)' }} />
            <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>System operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--page-bg)' }}>
      <LandingNavbar />
      <HeroSection />
      <MarqueeSection />
      <FeaturesSection />
      <ArchitectureSection />
      <WorkflowSection />
      <CTASection />
      <Footer />
    </div>
  )
}