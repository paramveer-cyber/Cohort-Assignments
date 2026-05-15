import { useState, useRef } from 'react'
import { Search, ChevronRight, BookOpen, Zap, BarChart2, Globe, Shield, Clock, X, ArrowRight, Users } from 'lucide-react'
import Navbar from '../components/layout/Navbar.jsx'

const SECTIONS = [
  {
    id: 'getting-started',
    icon: <Zap size={16} />,
    title: 'Getting Started',
    articles: [
      {
        id: 'create-poll',
        title: 'Creating a Poll',
        content: `
A poll lets you collect structured responses from any audience. To create one:

1. Sign in and navigate to **Dashboard → New Poll**.
2. Enter a **title** — this is what respondents see.
3. Add at least one **question** with at least two options.
4. Configure optional settings: anonymous mode, expiry date, or a custom slug.
5. Click **Create** — your poll is saved as a Draft.

**Tips:**
- Titles should be clear and specific. Avoid ambiguous questions.
- Add multiple questions if you need richer data.
- Custom slugs make sharing easier: \`/view-yourname\` instead of a random ID.
- Mark questions as mandatory if a response without them is not useful.
        `.trim(),
      },
      {
        id: 'anonymous-vs-auth',
        title: 'Anonymous vs Authenticated Polls',
        content: `
**Anonymous polls** allow anyone to respond without logging in. Each vote is tracked by a session token the client generates — respondents remain completely private, but duplicate submissions are still prevented per device/session.

Use anonymous polls when:
- You want maximum participation with no friction
- Respondent privacy is critical
- You are running public surveys or quick sentiment checks

When submitting anonymously, the client sends a \`sessionToken\` alongside answers. This token is tied to the browser session and is used solely for duplicate prevention — no identity is stored.

**Authenticated polls** require a signed-in account to respond. Each vote is linked to a verified user ID.

Use authenticated polls when:
- You need strict one-vote-per-account enforcement
- Responses should be tied to known identities
- You want to control who can participate

You can toggle anonymous mode in the Create Poll form. This setting is locked once the poll is activated.
        `.trim(),
      },
    ],
  },
  {
    id: 'voting',
    icon: <Users size={16} />,
    title: 'Voting & Responses',
    articles: [
      {
        id: 'voting-anonymous',
        title: 'Voting Without an Account',
        content: `
If a poll has anonymous mode enabled, you can vote without signing in.

**How it works:**
1. Open the poll link — no login prompt appears.
2. Select your answers and submit.
3. The app generates a \`sessionToken\` unique to your browser session and sends it with your answers.
4. The server records your response tied to that token instead of a user account.

**Duplicate prevention:**
The session token is stored in your browser. If you return to the same poll URL, the page checks your previous submission and shows what you already answered. You cannot submit twice from the same session.

**Limitations:**
- Clearing browser storage resets the session token. A new token is treated as a new session by the server, but the database unique constraint prevents double-counting from the same token.
- Switching devices means a new session token — anonymous responses cannot be merged across devices.
- If you are signed in when submitting to an anonymous poll, your user account is used instead of a session token, giving you a persistent submission record across devices.
        `.trim(),
      },
      {
        id: 'voting-authenticated',
        title: 'Voting with an Account',
        content: `
For authenticated polls, you must be signed in to submit a response.

1. Open the poll link. If you are not signed in, you will be prompted to log in first.
2. Select your answers and submit.
3. Your response is stored against your user ID.

**Submission tracking:**
After voting, you can return to the poll page to review what you submitted. The page fetches your existing submission and displays your selected options.

**Duplicate prevention:**
The database enforces a unique constraint on (pollId, userId). A second submission attempt returns a conflict error — no duplicates are possible even if the client submits twice simultaneously (a server-side lock prevents races).
        `.trim(),
      },
      {
        id: 'mandatory-questions',
        title: 'Mandatory Questions',
        content: `
Poll creators can mark individual questions as **mandatory**. A submission that omits any mandatory question is rejected by the server with a clear error listing which question IDs are missing.

On the vote page, mandatory questions are visually marked. The submit button stays disabled until all mandatory questions have a selected option.

Optional questions can be skipped — they are included in analytics only when answered.
        `.trim(),
      },
    ],
  },
  {
    id: 'poll-lifecycle',
    icon: <Clock size={16} />,
    title: 'Poll Lifecycle',
    articles: [
      {
        id: 'statuses',
        title: 'Poll Statuses Explained',
        content: `
Every poll moves through a defined lifecycle:

**Draft**
The poll exists but is not accepting responses. You can edit all settings, questions, and options in this state. Nothing is public.

**Active**
The poll is live and accepting responses. Respondents can vote. You cannot edit questions or options while active. Real-time analytics update with every vote.

**Expired**
A poll enters Expired when its expiry time passes while still Active. It stops accepting new responses automatically. Analytics are preserved. You can then publish.

**Published**
The poll is closed and results are visible based on the visibility setting you choose:
- **Public** — anyone can view results at the public analytics URL
- **Respondents only** — only those who voted can view results
- **Private** — only you (the creator) can view results

Transitions: Draft → Active → (Expired or manually closed) → Published.
        `.trim(),
      },
      {
        id: 'activating',
        title: 'Activating a Poll',
        content: `
To activate a Draft poll and begin accepting responses:

1. Open your Dashboard.
2. Find the poll card with **Draft** status.
3. Click **Activate**.

The poll immediately becomes live. A shareable link is displayed — this is the URL respondents visit to vote.

Once active, question content and options cannot be changed. If you need to make changes, you must deactivate (this clears all responses) or create a new poll.
        `.trim(),
      },
      {
        id: 'publishing',
        title: 'Publishing Results',
        content: `
After a poll ends (via expiry or manual close), you publish it to finalize results and share them.

**To publish:**
1. Find the poll in Dashboard with **Expired** or **Active** status.
2. Click **Publish**.
3. Choose visibility: Public, Respondents Only, or Private.
4. Confirm — results are now locked and accessible.

Published polls have a permanent public analytics URL you can share. The URL format is: \`/results/:pollId\`

Publishing is irreversible. Once published, status cannot return to Active.
        `.trim(),
      },
    ],
  },
  {
    id: 'sharing',
    icon: <Globe size={16} />,
    title: 'Sharing',
    articles: [
      {
        id: 'sharing-polls',
        title: 'Sharing an Active Poll',
        content: `
Each active poll has a unique vote URL. Share this link with your intended respondents.

**URL formats:**
- Custom slug: \`/view-yourslug\`
- Token-based: \`/view-abc123\`

You can find the share link on:
- The poll card in your Dashboard (copy icon)
- The analytics page for that poll

**Best practices:**
- Use a custom slug for branded or recurring polls
- Share via direct link — no account required if anonymous mode is on
- For authenticated polls, remind respondents they will need to sign in
        `.trim(),
      },
      {
        id: 'public-results',
        title: 'Sharing Results',
        content: `
After publishing with **Public** visibility, anyone with the results link can view the final analytics.

The results page shows:
- Vote distribution per option (bar chart)
- Total response count
- Participation rate
- Hourly response trend

Results links follow the format \`/results/:pollId\` and work without login.

For **Respondents Only** visibility, respondents who voted are automatically granted access when they are signed in. Anonymous respondents are granted access if their session token matches a recorded submission.
        `.trim(),
      },
    ],
  },
  {
    id: 'analytics',
    icon: <BarChart2 size={16} />,
    title: 'Analytics',
    articles: [
      {
        id: 'realtime-analytics',
        title: 'Real-time Analytics',
        content: `
While a poll is Active, analytics update live via WebSocket without any page refresh.

**What updates in real time:**
- **Response count** — total votes cast
- **Live viewer count** — how many people have the analytics page open right now
- **Option distribution** — percentage and vote count per option, updating instantly
- **Hourly trend chart** — votes per hour as they arrive

Real-time updates use Socket.IO room subscriptions. Each poll has its own room. When you open the analytics page, you join the room and receive all subsequent updates automatically.

The system uses Redis with a 30-second cache TTL for analytics aggregation, and a 60-second TTL for poll data — keeping broadcast overhead minimal at scale.
        `.trim(),
      },
      {
        id: 'analytics-metrics',
        title: 'Understanding Metrics',
        content: `
**Response Count**
The total number of votes submitted. In anonymous mode, this is session-based. In authenticated mode, this is unique accounts.

**Participation Rate**
Shown on public analytics. Calculated as responses divided by estimated reach, where applicable.

**Option Distribution**
Each option's percentage of total votes, updated in real time. Displayed as a bar chart and raw counts.

**Hourly Trend**
A time-series chart showing votes per hour. Useful for identifying when engagement peaked.

**Live Viewer Count**
The number of users currently viewing the analytics page for this poll. Updated via WebSocket presence tracking.
        `.trim(),
      },
    ],
  },
  {
    id: 'security',
    icon: <Shield size={16} />,
    title: 'Security & Auth',
    articles: [
      {
        id: 'authentication',
        title: 'Authentication Methods',
        content: `
PollNow supports two authentication methods:

**Email + Password**
Register with your name, email, and a password of at least 8 characters. Passwords are hashed server-side. On login, a short-lived JWT is issued and stored in memory (not localStorage). A longer-lived refresh token is stored in an HTTP-only cookie.

**Google Sign-In**
Click "Sign in with Google" on the auth page. You are redirected through Google's OAuth consent screen. On return, Google issues an ID token that is verified server-side. A PollNow JWT and refresh cookie are then issued the same way as email login.

No Google credentials are stored — only the verified user identity (name, email) returned by Google.

**Session Management**
JWTs expire after a short window. The app automatically refreshes them using the HTTP-only cookie before expiry. If the cookie is missing or expired, you are signed out and redirected to the login page.
        `.trim(),
      },
      {
        id: 'rate-limiting',
        title: 'Rate Limiting',
        content: `
The API applies rate limiting to protect against abuse:

**Submission endpoint**
A per-IP rate limiter applies to poll response submissions. Hitting the limit returns a 429 error. The limit resets after a short window.

**Read endpoints**
Poll and analytics read endpoints have a separate, more permissive rate limiter.

**Analytics endpoints**
Creator analytics and published results endpoints have their own limit to prevent scraping.

In addition to IP-level limits, the server acquires a short-lived Redis lock per (pollId, userId/sessionToken) when processing a submission. This prevents duplicate submissions from simultaneous requests even when the rate limiter has not yet triggered.
        `.trim(),
      },
    ],
  },
  {
    id: 'glossary',
    icon: <BookOpen size={16} />,
    title: 'Glossary',
    articles: [
      {
        id: 'terms',
        title: 'Key Terms',
        content: `
**Poll** — A collection of one or more questions with predefined options. Respondents select from these options.

**Question** — A single prompt within a poll. Each question has 2 or more options.

**Option** — A selectable answer for a question.

**Draft** — A poll that has been created but not yet activated. Editable.

**Active** — A live poll currently accepting responses.

**Expired** — A poll that reached its expiry time while Active. No longer accepting responses.

**Published** — A closed poll with finalized results made visible at a chosen visibility level.

**Anonymous Mode** — A poll setting that allows voting without a user account. Responses are tracked by session token instead of user ID.

**Session Token** — A client-generated identifier sent with anonymous submissions for duplicate prevention. Stored in browser storage.

**Slug** — A human-readable URL segment for a poll. Format: \`view-yourname\`.

**Response Count** — The total number of votes cast on a poll.

**Participation Rate** — Ratio of responses to estimated audience reach.

**WebSocket** — The real-time communication protocol used to broadcast vote and analytics updates instantly.

**Socket.IO Room** — A named channel on the server that a poll's viewers subscribe to. Broadcasts are scoped to this room.

**Redis** — In-memory data store used for analytics caching, submission locks, and rate limiting.

**JWT** — JSON Web Token. Used for authentication. Refreshed automatically to keep sessions alive.

**Refresh Token** — A long-lived token stored in an HTTP-only cookie. Used to obtain a new JWT without re-login.
        `.trim(),
      },
    ],
  },
]

function renderContent(raw) {
  const lines = raw.split('\n')
  const result = []
  let listItems = []

  const flushList = (key) => {
    if (listItems.length) {
      result.push(
        <ol key={`list-${key}`} className="space-y-1.5 ml-4">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-mono text-xs mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{i + 1}.</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      )
      listItems = []
    }
  }

  lines.forEach((line, i) => {
    if (/^\d+\./.test(line)) {
      listItems.push(line.replace(/^\d+\.\s*/, ''))
    } else {
      flushList(i)
      if (!line.trim()) {
        result.push(<div key={`sp-${i}`} className="h-3" />)
      } else if (line.startsWith('**') && line.endsWith('**')) {
        result.push(
          <p key={i} className="text-xs font-mono uppercase tracking-widest mt-4 mb-1.5" style={{ color: 'var(--text-muted)' }}>
            {line.replace(/\*\*/g, '')}
          </p>
        )
      } else if (line.startsWith('- ')) {
        result.push(
          <div key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--brand)' }} />
            <span>{renderInline(line.slice(2))}</span>
          </div>
        )
      } else {
        result.push(
          <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {renderInline(line)}
          </p>
        )
      }
    }
  })
  flushList('end')
  return result
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="font-mono text-xs px-1.5 py-0.5 rounded-sm" style={{ background: 'var(--surface-600)', color: 'var(--text-primary)' }}>{part.slice(1, -1)}</code>
    }
    return part
  })
}

export default function HelpPage() {
  const [query, setQuery] = useState('')
  const [activeSection, setActiveSection] = useState('getting-started')
  const [activeArticle, setActiveArticle] = useState('create-poll')
  const [mobileNav, setMobileNav] = useState(false)
  const inputRef = useRef(null)

  const allArticles = SECTIONS.flatMap(s => s.articles.map(a => ({ ...a, sectionId: s.id, sectionTitle: s.title })))

  const searchResults = query.trim().length > 1
    ? allArticles.filter(a =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.content.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const currentSection = SECTIONS.find(s => s.id === activeSection)
  const currentArticle = currentSection?.articles.find(a => a.id === activeArticle) || currentSection?.articles[0]

  const selectArticle = (sectionId, articleId) => {
    setActiveSection(sectionId)
    setActiveArticle(articleId)
    setQuery('')
    setMobileNav(false)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>
      <Navbar />
      <div className="pt-14 min-h-screen flex flex-col">
        <div className="border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-800)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand)' }}>
                <BookOpen size={14} color="var(--text-inverse)" />
              </div>
              <h1 className="font-display text-3xl tracking-wider" style={{ color: 'var(--text-primary)' }}>GUIDE</h1>
            </div>
            <p className="text-sm max-w-lg mb-6" style={{ color: 'var(--text-muted)' }}>
              Everything you need to create, manage, and share polls.
            </p>
            <div className="relative max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search documentation…"
                className="input-base pl-9 pr-9"
                aria-label="Search documentation"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors focus-ring rounded-sm"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mt-2 card rounded-sm max-w-md" style={{ border: '1px solid var(--border-default)', zIndex: 10 }}>
                {searchResults.map(a => (
                  <button key={a.id} onClick={() => selectArticle(a.sectionId, a.id)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-700)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '' }}>
                    <span className="text-xs font-mono mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{a.sectionTitle}</span>
                    <span className="text-sm font-body" style={{ color: 'var(--text-primary)' }}>{a.title}</span>
                  </button>
                ))}
              </div>
            )}
            {query.trim().length > 1 && searchResults.length === 0 && (
              <p className="mt-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>No results for "{query}"</p>
            )}
          </div>
        </div>

        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex gap-8">
          <button className="md:hidden flex items-center gap-2 text-sm font-mono mb-4" style={{ color: 'var(--text-secondary)' }}
            onClick={() => setMobileNav(true)}>
            <ChevronRight size={14} /> Browse sections
          </button>

          {mobileNav && (
            <div className="fixed inset-0 z-50 flex" onClick={() => setMobileNav(false)}>
              <div className="w-72 h-full overflow-y-auto p-6" style={{ background: 'var(--card-bg)', borderRight: '1px solid var(--border-default)' }}
                onClick={e => e.stopPropagation()}>
                <button onClick={() => setMobileNav(false)} className="mb-6" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
                <SideNav sections={SECTIONS} activeSection={activeSection} activeArticle={activeArticle} onSelect={selectArticle} />
              </div>
            </div>
          )}

          <aside className="hidden md:block w-56 flex-shrink-0">
            <SideNav sections={SECTIONS} activeSection={activeSection} activeArticle={activeArticle} onSelect={selectArticle} />
          </aside>

          <main className="flex-1 min-w-0 max-w-2xl">
            {currentArticle ? (
              <article>
                <div className="mb-6">
                  <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                    {currentSection?.title}
                  </p>
                  <h2 className="font-display text-3xl tracking-wider" style={{ color: 'var(--text-primary)' }}>
                    {currentArticle.title.toUpperCase()}
                  </h2>
                </div>
                <div className="space-y-1">
                  {renderContent(currentArticle.content)}
                </div>

                <div className="mt-10 pt-8 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <div />
                  <div className="flex items-center gap-2">
                    {currentSection?.articles.findIndex(a => a.id === activeArticle) < (currentSection?.articles.length || 0) - 1 && (() => {
                      const nextIdx = currentSection.articles.findIndex(a => a.id === activeArticle) + 1
                      const next = currentSection.articles[nextIdx]
                      return (
                        <button onClick={() => selectArticle(activeSection, next.id)}
                          className="inline-flex items-center gap-2 text-sm font-body transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}>
                          {next.title} <ArrowRight size={14} />
                        </button>
                      )
                    })()}
                  </div>
                </div>
              </article>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  )
}

function SideNav({ sections, activeSection, activeArticle, onSelect }) {
  return (
    <nav className="space-y-6">
      {sections.map(section => (
        <div key={section.id}>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: 'var(--text-muted)' }}>{section.icon}</span>
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{section.title}</span>
          </div>
          <div className="space-y-px">
            {section.articles.map(article => (
              <button
                key={article.id}
                onClick={() => onSelect(section.id, article.id)}
                className="w-full text-left px-3 py-2 text-sm rounded-sm transition-all"
                style={{
                  color: activeSection === section.id && activeArticle === article.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: activeSection === section.id && activeArticle === article.id ? 'var(--surface-700)' : 'transparent',
                  borderLeft: activeSection === section.id && activeArticle === article.id ? '2px solid var(--brand)' : '2px solid transparent',
                  paddingLeft: '10px',
                }}
                onMouseEnter={e => { if (!(activeSection === section.id && activeArticle === article.id)) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-700)' } }}
                onMouseLeave={e => { if (!(activeSection === section.id && activeArticle === article.id)) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent' } }}
              >
                {article.title}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}