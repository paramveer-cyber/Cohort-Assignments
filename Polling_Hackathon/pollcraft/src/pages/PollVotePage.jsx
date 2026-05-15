import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { pollsApi } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useSocket } from '../hooks/useSocket.js'
import Navbar from '../components/layout/Navbar.jsx'
import { ToastProvider } from '../components/ui/Toast.jsx'
import { BauhausCorner } from '../components/ui/BauhausAccents.jsx'
import { CheckCircle, AlertCircle, Lock, Clock, ArrowRight, Archive, BarChart2 } from 'lucide-react'

function ReadonlyBanner({ reason }) {
  const configs = {
    submitted: {
      icon: <CheckCircle size={16} className="text-signal shrink-0" />,
      bg: '[background:var(--signal-dim)] [border-color:var(--signal-dim)]',
      text: 'text-signal',
      label: 'Your response is recorded',
      sub: 'Answers shown below are what you submitted.',
    },
    expired: {
      icon: <Clock size={16} className="[color:var(--text-muted)] shrink-0" />,
      bg: 'bg-surface-600/40 border-border-default',
      text: 'text-surface-secondary',
      label: 'This poll has ended',
      sub: 'It is no longer accepting responses.',
    },
    published: {
      icon: <Archive size={16} className="text-jade shrink-0" />,
      bg: '[background:var(--jade-dim)] [border-color:var(--jade-border)]',
      text: 'text-jade',
      label: 'Results have been published',
      sub: 'This poll is now closed. View the results below.',
    },
    auth: {
      icon: <Lock size={16} className="text-azure shrink-0" />,
      bg: '[background:var(--azure-dim)] [border-color:var(--azure-border)]',
      text: 'text-azure',
      label: 'Sign in required',
      sub: 'This poll requires authentication to respond.',
    },
  }
  const cfg = configs[reason] || configs.expired
  return (
    <div className={`flex items-start gap-3 px-4 py-3 border rounded-sm mb-6 ${cfg.bg}`}>
      {cfg.icon}
      <div>
        <p className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{cfg.sub}</p>
      </div>
    </div>
  )
}

function OptionRow({ opt, selected, readonly, onSelect }) {
  const baseStyle = 'w-full text-left flex items-center gap-3 px-4 py-3 border rounded-sm transition-all duration-150'

  if (readonly) {
    if (selected) {
      return (
        <div className={`${baseStyle} [border-color:var(--signal-dim)] cursor-default`} style={{ background: 'var(--signal-dim)' }}>
          <span className="w-4 h-4 rounded-full border-2 border-signal bg-signal shrink-0 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--page-bg)' }} />
          </span>
          <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{opt.text}</span>
          <CheckCircle size={13} className="text-signal shrink-0" />
        </div>
      )
    }
    return (
      <div className={`${baseStyle} cursor-default opacity-40`} style={{ borderColor: 'var(--border-default)' }}>
        <span className="w-4 h-4 rounded-full border-2 shrink-0" style={{ borderColor: 'var(--border-default)' }} />
        <span className="text-sm flex-1 line-through" style={{ color: 'var(--text-muted)' }}>{opt.text}</span>
      </div>
    )
  }

  return (
    <button
      onClick={onSelect}
      className={`${baseStyle} ${
        selected
          ? 'border-signal [background:var(--signal-dim)]'
          : 'hover:border-[var(--border-default)]'
      }`}
      style={{
        borderColor: selected ? undefined : 'var(--border-subtle)',
        color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
      }}
    >
      <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
        selected ? 'border-signal bg-signal' : ''
      }`} style={selected ? {} : { borderColor: 'var(--border-default)' }}>
        {selected && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--page-bg)' }} />}
      </span>
      <span className="text-sm flex-1">{opt.text}</span>
    </button>
  )
}

function VoteContent() {
  const { token, slug } = useParams()
  const pollKey = token ? `view-${token}` : slug
  const navigate = useNavigate()
  const { user } = useAuth()

  const [poll, setPoll] = useState(null)
  const [pollId, setPollId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [readonlyReason, setReadonlyReason] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [pollResult, submissionResult] = await Promise.allSettled([
          pollsApi.getBySlug(pollKey),
          pollsApi.checkSubmission(pollKey),
        ])

        if (cancelled) return

        if (pollResult.status === 'rejected') {
          setError(pollResult.reason?.message || 'Poll not found')
          return
        }

        const p = pollResult.value.poll
        setPoll(p)
        setPollId(p.id)

        if (submissionResult.status === 'fulfilled' && submissionResult.value?.submitted) {
          const sub = submissionResult.value
          const answerMap = {}
          if (sub.answers) {
            sub.answers.forEach(a => {
              answerMap[a.questionId] = a.selectedOptionId
            })
          }
          setAnswers(answerMap)
          setReadonlyReason('submitted')
        } else if (p.status === 'expired') {
          setReadonlyReason('expired')
        } else if (p.status === 'published') {
          setReadonlyReason('published')
        } else if (!p.anonymousAllowed && !user) {
          setReadonlyReason('auth')
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Poll not found')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [pollKey, user])

  useSocket(pollId, null, {
    onExpired: () => {
      if (!readonlyReason) setReadonlyReason('expired')
    },
    onPublished: () => {
      if (!readonlyReason) setReadonlyReason('published')
    },
  })

  const readonly = !!readonlyReason

  const select = (questionId, optionId) => {
    if (readonly) return
    setAnswers(prev => ({ ...prev, [questionId]: optionId }))
    setValidationErrors(prev => ({ ...prev, [questionId]: '' }))
  }

  const validate = () => {
    const errs = {}
    poll.questions.forEach(q => {
      if (q.isMandatory && !answers[q.id]) errs[q.id] = 'Required'
    })
    return errs
  }

  const submit = async () => {
    if (readonly) return
    const errs = validate()
    if (Object.keys(errs).length) { setValidationErrors(errs); return }

    setSubmitting(true)
    try {
      await pollsApi.respond(pollKey,
        Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId, selectedOptionId,
        })),
      )
      setReadonlyReason('submitted')
    } catch (err) {
      if (err.status === 409) {
        setReadonlyReason('submitted')
      } else if (err.status === 401) {
        setReadonlyReason('auth')
      } else if (err.status === 400 && err.message === 'This poll has expired') {
        setReadonlyReason('expired')
      } else {
        setValidationErrors({ _global: err.message || 'Submission failed' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-bg)' }}>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-signal rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--page-bg)' }}>
        <div className="card p-8 max-w-sm w-full text-center relative overflow-hidden">
          <BauhausCorner position="tr" color="crimson" />
          <AlertCircle size={32} className="text-crimson mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>UNACTIVATED POLL</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{error}</p>
          <button onClick={() => navigate('/discover')} className="btn-secondary w-full justify-center">
            Browse Polls
          </button>
        </div>
      </div>
    )
  }

  if (!poll) return null

  const sortedQuestions = [...poll.questions].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

  return (
    <div className="min-h-screen pt-14" style={{ background: 'var(--page-bg)' }}>
      <div className="relative max-w-xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {poll.status === 'active' && !readonly && (
              <span className="flex items-center gap-1.5 text-xs font-mono text-signal">
                <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse-slow" />
                LIVE
              </span>
            )}
            {poll.expiresAt && (
              <span className="flex items-center gap-1.5 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                <Clock size={11} />
                {readonly ? 'Ended' : 'Expires'} {new Date(poll.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-wide leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>
            {poll.title.toUpperCase()}
          </h1>
          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {sortedQuestions.length} {sortedQuestions.length === 1 ? 'question' : 'questions'}
          </p>
        </div>

        {readonlyReason && <ReadonlyBanner reason={readonlyReason} />}

        {readonlyReason === 'auth' && (
          <button
            onClick={() => navigate('/auth')}
            className="w-full flex items-center justify-center gap-2 py-3 mb-6 [background:var(--azure-dim)] border [border-color:var(--azure-border)] text-azure text-sm font-mono rounded-sm hover:[background:var(--azure-dim-strong)] transition-colors"
          >
            Sign in to respond <ArrowRight size={14} />
          </button>
        )}

        {readonlyReason === 'published' && (
          <button
            onClick={() => navigate(`/results/${poll.id}`)}
            className="w-full flex items-center justify-center gap-2 py-3 mb-6 [background:var(--jade-dim)] border [border-color:var(--jade-border)] text-jade text-sm font-mono rounded-sm hover:[background:var(--jade-dim-strong)] transition-colors"
          >
            <BarChart2 size={14} />
            View Published Results <ArrowRight size={14} />
          </button>
        )}

        {validationErrors._global && (
          <div className="flex items-center gap-2 [background:var(--crimson-dim)] border [border-color:var(--crimson-border)] px-4 py-3 rounded-sm mb-5">
            <AlertCircle size={14} className="text-crimson" />
            <p className="text-sm text-crimson">{validationErrors._global}</p>
          </div>
        )}

        <div className="space-y-4">
          {sortedQuestions.map((q, qi) => (
            <div key={q.id} className={`card p-5 relative overflow-hidden transition-opacity ${
              readonly ? 'opacity-90' : ''
            } ${validationErrors[q.id] ? '[border-color:var(--crimson-border)]' : ''}`}>
              {qi === 0 && !readonly && <BauhausCorner position="tr" color="signal" />}
              <div className="flex items-start gap-3 mb-4">
                <span className="text-base font-semibold font-mono shrink-0 leading-none mt-0.5" style={{ color: readonly ? 'var(--text-muted)' : 'var(--signal)' }}>
                  {qi + 1}
                </span>
                <div>
                  <p className="font-body text-sm leading-snug" style={{ color: readonly ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{q.content}</p>
                  {q.isMandatory && !readonly && (
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Required</span>
                  )}
                </div>
              </div>

              <div className="space-y-2 ml-7">
                {q.options.map(opt => (
                  <OptionRow
                    key={opt.id}
                    opt={opt}
                    selected={answers[q.id] === opt.id}
                    readonly={readonly}
                    onSelect={() => select(q.id, opt.id)}
                  />
                ))}
              </div>

              {validationErrors[q.id] && (
                <p className="text-xs text-crimson mt-2 ml-7 flex items-center gap-1">
                  <AlertCircle size={11} /> {validationErrors[q.id]}
                </p>
              )}
            </div>
          ))}
        </div>

        {!readonly && (
          <div className="mt-6">
            <button
              onClick={submit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-signal [color:var(--text-inverse)] font-semibold rounded-sm hover:[background:var(--signal-dark)] transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex gap-1">
                  {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 [background:var(--surface-900)] rounded-full animate-pulse" style={{ animationDelay: `${i*0.15}s` }} />)}
                </span>
              ) : <>Submit Response <ArrowRight size={16} /></>}
            </button>
          </div>
        )}

        {readonlyReason === 'submitted' && (
          <div className="flex gap-3 mt-6 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button onClick={() => navigate('/discover')} className="btn-secondary flex-1 justify-center text-xs">
              More Polls
            </button>
            {user && (
              <button onClick={() => navigate('/dashboard')} className="btn-primary flex-1 justify-center text-xs">
                Dashboard
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PollVotePage() {
  return (
    <ToastProvider>
      <Navbar />
      <VoteContent />
    </ToastProvider>
  )
}