import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pollsApi, ApiError } from '../api/index.js'
import Navbar from '../components/layout/Navbar.jsx'
import { ToastProvider, useToast } from '../components/ui/Toast.jsx'
import QRShare from '../components/poll/QRShare.jsx'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, ArrowLeft, Globe, Users, Lock, Calendar, CheckCircle, LayoutDashboard } from 'lucide-react'
import { v4 as uuid } from 'uuid'

const makeOption = () => ({ id: uuid().slice(0, 8), text: '' })
const makeQuestion = () => ({
  _key: uuid(),
  content: '',
  isMandatory: true,
  options: [makeOption(), makeOption()],
})

const VISIBILITY_OPTS = [
  { val: 'all', label: 'Public', desc: 'Any authenticated user', Icon: Globe, color: 'text-jade', border: '[border-color:var(--jade-border)]', bg: '[background:var(--jade-dim)]' },
  { val: 'respondents', label: 'Respondents', desc: 'Only people who voted (auth required)', Icon: Users, color: 'text-azure', border: '[border-color:var(--azure-border)]', bg: '[background:var(--azure-dim)]', requiresAuth: true },
  { val: 'private', label: 'Private', desc: 'Only you (creator)', Icon: Lock },
]

function CreatePollContent() {
  const navigate = useNavigate()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [anonymousAllowed, setAnonymousAllowed] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [publishOn, setPublishOn] = useState('')
  const [resultsVisibility, setResultsVisibility] = useState('all')
  const [questions, setQuestions] = useState([makeQuestion()])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [expandedQ, setExpandedQ] = useState({})
  const [createdPoll, setCreatedPoll] = useState(null)

  const setQ = (key, field, val) => {
    setQuestions(prev => prev.map(q => q._key === key ? { ...q, [field]: val } : q))
  }

  const addOption = (key) => {
    setQuestions(prev => prev.map(q =>
      q._key === key ? { ...q, options: [...q.options, makeOption()] } : q
    ))
  }

  const removeOption = (key, oid) => {
    setQuestions(prev => prev.map(q =>
      q._key === key ? { ...q, options: q.options.filter(o => o.id !== oid) } : q
    ))
  }

  const setOption = (key, oid, text) => {
    setQuestions(prev => prev.map(q =>
      q._key === key
        ? { ...q, options: q.options.map(o => o.id === oid ? { ...o, text } : o) }
        : q
    ))
  }

  const removeQuestion = (key) => {
    if (questions.length === 1) return
    setQuestions(prev => prev.filter(q => q._key !== key))
  }

  const toggleExpand = (key) => {
    setExpandedQ(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const generateSlug = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let r = ''
    for (let i = 0; i < 6; i++) r += chars[Math.floor(Math.random() * chars.length)]
    return `view-${r}`
  }

  const setAnon = (val) => {
    setAnonymousAllowed(val)
    if (val && resultsVisibility === 'respondents') setResultsVisibility('all')
  }

  const validate = () => {
    const e = {}
    if (!title.trim()) e.title = 'Title required'
    if (slug && !/^view-[a-z0-9]{4,12}$/.test(slug)) e.slug = 'Format: view-xxxxxx (lowercase + digits)'
    questions.forEach((q) => {
      if (!q.content.trim()) e[`q_${q._key}`] = 'Question text required'
      if (q.options.length < 2) e[`opts_${q._key}`] = 'At least 2 options required'
      q.options.forEach(o => {
        if (!o.text.trim()) e[`opt_${o.id}`] = 'Option text required'
      })
    })
    return e
  }

  const submit = async () => {
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      const firstQ = questions.find(q => errs[`q_${q._key}`] || errs[`opts_${q._key}`] || q.options.some(o => errs[`opt_${o.id}`]))
      if (firstQ) setExpandedQ(prev => ({ ...prev, [firstQ._key]: true }))
      return
    }

    setLoading(true)
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        slug: slug.trim() || undefined,
        anonymousAllowed,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        publishOn: publishOn ? new Date(publishOn).toISOString() : undefined,
        resultsVisibility,
        questions: questions.map(q => ({
          content: q.content.trim(),
          isMandatory: q.isMandatory,
          options: q.options.map(o => ({ id: o.id, text: o.text.trim() })),
        })),
      }

      const { poll } = await pollsApi.create(payload)
      toast.success('Poll created successfully')
      setCreatedPoll(poll)
    } catch (err) {
      if (err instanceof ApiError && err.errors?.length) {
        const e = {}
        err.errors.forEach(er => { e[er.path] = er.message })
        setErrors(e)
        toast.error('Please fix validation errors')
      } else if (err.status === 409 || (err.message || '').toLowerCase().includes('slug')) {
        const newSlug = generateSlug()
        setSlug(newSlug)
        setSlugManuallyEdited(false)
        setErrors(prev => ({ ...prev, slug: 'Slug was taken — a new one was generated. You can customize it.' }))
        toast.error('Slug was already taken — try again with the new one')
      } else {
        toast.error(err.message || 'Failed to create poll')
      }
    } finally {
      setLoading(false)
    }
  }

  if (createdPoll) {
    return (
      <div className="min-h-screen pt-14" style={{ background: 'var(--page-bg)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <div className="card p-8 text-center mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--signal), transparent)' }} />
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--signal-dim)' }}>
              <CheckCircle size={24} className="text-signal" />
            </div>
            <h1 className="font-display text-3xl tracking-wider mb-1" style={{ color: 'var(--text-primary)' }}>POLL CREATED</h1>
            <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{createdPoll.title}</p>
          </div>

          <QRShare pollSlug={createdPoll.slug} pollId={createdPoll.id} />

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 flex items-center justify-center gap-2 py-3 font-body font-semibold text-sm rounded-sm transition-colors"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const visibilityOpts = VISIBILITY_OPTS.filter(o => !o.requiresAuth || !anonymousAllowed)

  return (
    <div className="min-h-screen pt-14" style={{ background: 'var(--page-bg)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/dashboard')} className="transition-colors" style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-display text-4xl tracking-wider" style={{ color: 'var(--text-primary)' }}>CREATE POLL</h1>
        </div>

        <div className="space-y-6">
          <section className="card p-6 space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-widest pb-3" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>Poll Details</h2>

            <div>
              <label className="label-base">Title *</label>
              <input
                value={title}
                onChange={e => {
                  setTitle(e.target.value)
                  if (!slugManuallyEdited) setSlug(generateSlug())
                  setErrors(prev => ({ ...prev, title: '' }))
                }}
                placeholder="What do you want to ask?"
                className={`input-base ${errors.title ? 'border-crimson' : ''}`}
              />
              {errors.title && <p className="text-xs text-crimson mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="label-base">Description (optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add context or details about this poll..."
                rows={2}
                className="input-base resize-none"
              />
            </div>

            <div>
              <label className="label-base">Slug (optional)</label>
              <input
                value={slug}
                onChange={e => {
                  setSlug(e.target.value)
                  setSlugManuallyEdited(true)
                  setErrors(prev => ({ ...prev, slug: '' }))
                }}
                placeholder="view-xxxxxx (auto-generated)"
                className={`input-base font-mono ${errors.slug ? 'border-crimson' : ''}`}
              />
              {errors.slug && <p className="text-xs text-crimson mt-1">{errors.slug}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-base">Expires At (optional)</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  className="input-base"
                />
              </div>

              <div>
                <label className="label-base flex items-center gap-1.5">
                  <Calendar size={11} />
                  Publish On (optional)
                </label>
                <input
                  type="datetime-local"
                  value={publishOn}
                  onChange={e => setPublishOn(e.target.value)}
                  className="input-base"
                />
              </div>
            </div>

            <div>
              <label className="label-base">Response Type</label>
              <div className="flex gap-2 pt-1">
                {[
                  { val: false, label: 'Auth Required' },
                  { val: true, label: 'Anonymous OK' },
                ].map(opt => (
                  <button
                    key={String(opt.val)}
                    onClick={() => setAnon(opt.val)}
                    className={`flex-1 py-2 text-xs font-mono border rounded-sm transition-colors ${
                      anonymousAllowed === opt.val
                        ? 'border-signal [background:var(--signal-dim)] [color:var(--signal)]'
                        : ''
                    }`}
                    style={anonymousAllowed === opt.val ? {} : {
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-base">Results Visibility</label>
              {anonymousAllowed && (
                <p className="text-xs font-mono mb-2 mt-1 px-2 py-1.5 rounded-sm" style={{ background: 'var(--azure-dim)', color: 'var(--azure)', border: '1px solid var(--azure-border)' }}>
                  "Respondents only" unavailable for anonymous polls
                </p>
              )}
              <div className="flex gap-2 pt-1">
                {visibilityOpts.map(opt => {
                  const active = resultsVisibility === opt.val
                  const Icon = opt.Icon
                  return (
                    <button
                      key={opt.val}
                      onClick={() => setResultsVisibility(opt.val)}
                      className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 text-xs font-mono border rounded-sm transition-colors ${
                        active && opt.border ? `${opt.border} ${opt.bg} ${opt.color}` : ''
                      }`}
                      style={active && !opt.border ? {
                        borderColor: 'var(--border-default)',
                        background: 'var(--surface-700)',
                        color: 'var(--text-secondary)',
                      } : active ? {} : {
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-muted)',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border-default)' }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
                    >
                      <Icon size={13} />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs font-mono mt-1.5" style={{ color: 'var(--text-muted)' }}>
                {VISIBILITY_OPTS.find(o => o.val === resultsVisibility)?.desc}
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Questions ({questions.length})
              </h2>
              <button
                onClick={() => {
                  const q = makeQuestion()
                  setQuestions(prev => [...prev, q])
                  setExpandedQ(prev => ({ ...prev, [q._key]: true }))
                }}
                className="flex items-center gap-1.5 text-xs font-mono text-signal hover:text-signal-dark transition-colors"
              >
                <Plus size={13} />
                Add Question
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((q, qi) => (
                <div key={q._key} className={`card border ${errors[`q_${q._key}`] || errors[`opts_${q._key}`] ? '[border-color:var(--crimson-border)]' : ''}`}>
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                    onClick={() => toggleExpand(q._key)}
                  >
                    <GripVertical size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Q{qi + 1}</span>
                    <span className="flex-1 text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                      {q.content || <span className="italic" style={{ color: 'var(--text-muted)' }}>Untitled question</span>}
                    </span>
                    <div className="flex items-center gap-2">
                      {questions.length > 1 && (
                        <button
                          onClick={e => { e.stopPropagation(); removeQuestion(q._key) }}
                          className="transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--crimson)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                      {expandedQ[q._key]
                        ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
                        : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                      }
                    </div>
                  </div>

                  {(expandedQ[q._key] || qi === 0) && (
                    <div className="px-4 pb-4 space-y-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <div className="pt-3">
                        <label className="label-base">Question *</label>
                        <input
                          value={q.content}
                          onChange={e => { setQ(q._key, 'content', e.target.value); setErrors(prev => ({ ...prev, [`q_${q._key}`]: '' })) }}
                          placeholder="Enter your question..."
                          className={`input-base ${errors[`q_${q._key}`] ? 'border-crimson' : ''}`}
                        />
                        {errors[`q_${q._key}`] && <p className="text-xs text-crimson mt-1">{errors[`q_${q._key}`]}</p>}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="label-base mb-0">Options *</label>
                          <button
                            onClick={() => addOption(q._key)}
                            className="text-xs font-mono text-signal hover:text-signal-dark transition-colors flex items-center gap-1"
                          >
                            <Plus size={11} /> Add Option
                          </button>
                        </div>

                        <div className="space-y-2">
                          {q.options.map((opt, oi) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <span className="text-xs font-mono w-6 shrink-0" style={{ color: 'var(--text-muted)' }}>{oi + 1}.</span>
                              <input
                                value={opt.text}
                                onChange={e => { setOption(q._key, opt.id, e.target.value); setErrors(prev => ({ ...prev, [`opt_${opt.id}`]: '' })) }}
                                placeholder={`Option ${oi + 1}`}
                                className={`input-base flex-1 ${errors[`opt_${opt.id}`] ? 'border-crimson' : ''}`}
                              />
                              {q.options.length > 2 && (
                                <button
                                  onClick={() => removeOption(q._key, opt.id)}
                                  className="transition-colors"
                                  style={{ color: 'var(--text-muted)' }}
                                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--crimson)' }}
                                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {errors[`opts_${q._key}`] && <p className="text-xs text-crimson mt-1">{errors[`opts_${q._key}`]}</p>}
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={q.isMandatory}
                            onChange={e => setQ(q._key, 'isMandatory', e.target.checked)}
                            className="accent-signal"
                          />
                          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Mandatory</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="flex gap-3 pt-2">
            <button onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-signal [color:var(--text-inverse)] font-body font-semibold text-sm rounded-sm hover:[background:var(--signal-dark)] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex gap-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 [background:var(--surface-900)] rounded-full animate-pulse" style={{ animationDelay: `${i*0.15}s` }} />
                  ))}
                </span>
              ) : 'Create Poll'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CreatePollPage() {
  return (
    <ToastProvider>
      <Navbar />
      <CreatePollContent />
    </ToastProvider>
  )
}