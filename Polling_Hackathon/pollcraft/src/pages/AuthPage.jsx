import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext.jsx'
import { ApiError } from '../api/index.js'
import { Eye, EyeOff, BarChart2, ArrowRight, AlertCircle } from 'lucide-react'
import { GeoBg } from '../components/ui/BauhausAccents.jsx'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const { login, register, googleAuth } = useAuth()
  const navigate = useNavigate()

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true)
    setServerError('')
    try {
      await googleAuth(credentialResponse.credential)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.message || 'Google sign-in failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  const set = (k) => (e) => {
    setForm(prev => ({ ...prev, [k]: e.target.value }))
    setErrors(prev => ({ ...prev, [k]: '' }))
    setServerError('')
  }

  const validate = () => {
    const e = {}
    if (mode === 'register' && !form.name.trim()) e.name = 'Name required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (form.password.length < 8) e.password = 'At least 8 characters'
    return e
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setServerError('')
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.name, form.email, form.password)
      }
      navigate('/dashboard')
    } catch (err) {
      if (err instanceof ApiError && err.errors?.length) {
        const fieldErrors = {}
        err.errors.forEach(e => { fieldErrors[e.path] = e.message })
        setErrors(fieldErrors)
      } else {
        setServerError(err.message || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--page-bg)" }}>
      <div className="hidden lg:flex flex-col justify-between w-1/2 [background:var(--surface-800)] border-r [border-color:var(--border-default)] p-12 relative overflow-hidden">
        <GeoBg variant="auth" />
        <div style={{ position: 'relative', zIndex: 1 }} className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center">
            <BarChart2 size={16} className="[color:var(--text-inverse)]" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl tracking-wider" style={{ color: "var(--text-primary)" }}>POLLNOW</span>
        </div>

        <div className="relative" style={{ zIndex: 1 }}>
          <div className="grid grid-cols-2 gap-px [background:var(--surface-600)] mb-12">
            {['01', '02', '03', '04'].map((n, i) => (
              <div key={n} className={`p-6 ${i === 1 ? '[background:var(--signal-dim)]' : '[background:var(--surface-800)]'}`}>
                <p className="text-3xl font-semibold tabular-nums text-signal opacity-40">{n}</p>
                {i === 1 && <div className="w-6 h-6 rounded-full border [border-color:var(--signal-dim)] mt-2" />}
                {i === 3 && <div className="w-6 h-1 [background:var(--surface-600)] mt-3" />}
              </div>
            ))}
          </div>
          <h2 className="font-display text-5xl [color:var(--text-primary)] leading-none tracking-wide mb-4">
            REALTIME<br />POLLING<br />PLATFORM
          </h2>
          <p className="[color:var(--text-muted)] text-sm max-w-xs leading-relaxed">
            Create polls, collect responses, and watch live analytics update in real time.
          </p>
        </div>

        <div className="flex gap-3">
          {['Active now', 'Live updates', 'Analytics'].map(tag => (
            <span key={tag} className="text-xs font-mono [color:var(--text-muted)] border [border-color:var(--border-default)] px-2.5 py-1 rounded-sm">{tag}</span>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-6 h-6 flex items-center justify-center">
              <BarChart2 size={13} className="[color:var(--text-inverse)]" />
            </div>
            <span className="font-display text-xl tracking-wider" style={{ color: "var(--text-primary)" }}>POLLNOW</span>
          </div>

          <div className="flex gap-px mb-8 [background:var(--surface-600)] rounded-sm overflow-hidden">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrors({}); setServerError('') }}
                className={`flex-1 py-2.5 text-sm font-mono uppercase tracking-wider transition-colors ${
                  mode === m ? 'bg-signal [color:var(--text-inverse)] font-semibold' : '[background:var(--surface-800)] [color:var(--text-muted)] hover:[color:var(--text-primary)]'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {serverError && (
            <div className="flex items-center gap-2 [background:var(--crimson-dim)] border [border-color:var(--crimson-border)] rounded-sm px-4 py-3 mb-5">
              <AlertCircle size={14} className="text-crimson shrink-0" />
              <p className="text-sm text-crimson">{serverError}</p>
            </div>
          )}

          <div className="mb-6">
            {googleLoading ? (
              <div className="flex items-center justify-center gap-2 py-3 text-xs [color:var(--text-muted)] font-mono">
                <span className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1 h-1 rounded-full animate-pulse" style={{ background: 'var(--text-muted)', animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
                Signing in with Google...
              </div>
            ) : (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setServerError('Google sign-in failed')}
                  text={mode === 'login' ? 'signin_with' : 'signup_with'}
                  shape="rectangular"
                  theme="filled_black"
                  size="large"
                  width="320"
                  use_fedcm_for_prompt={false}
                  itp_support={false}
                />
              </div>
            )}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px [background:var(--surface-600)]" />
              <span className="text-xs font-mono [color:var(--text-muted)] uppercase tracking-widest">or</span>
              <div className="flex-1 h-px [background:var(--surface-600)]" />
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="label-base">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Your name"
                  className={`input-base ${errors.name ? 'border-crimson' : ''}`}
                />
                {errors.name && <p className="text-xs text-crimson mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="label-base">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                autoComplete="email"
                className={`input-base ${errors.email ? 'border-crimson' : ''}`}
              />
              {errors.email && <p className="text-xs text-crimson mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="label-base">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className={`input-base pr-10 ${errors.password ? 'border-crimson' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 [color:var(--text-muted)] hover:[color:var(--text-primary)]"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-crimson mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-signal [color:var(--text-inverse)] font-semibold text-sm rounded-sm hover:[background:var(--signal-dark)] transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 [background:var(--surface-900)] rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}