# Pollnow — Architecture & Developer Guide

## Quick Start

```bash
# 1. Clone & install
git clone <repo> && cd Polling_Hackathon
cd backend && npm install
cd ../pollcraft && npm install

# 2. Configure environment
cp backend/.env.example backend/.env
# Set: DATABASE_URL, JWT_SECRET, REFRESH_SECRET, REDIS_URL

# 3. Database setup
cd backend
npm run db:generate
npm run db:migrate

# 4. Start services (need PostgreSQL + Redis running)
cd backend && npm run dev      # :3000
cd pollcraft && npm run dev     # :5173
```

**Minimum env vars to run locally:**

| Variable | Example |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/..` |
| `JWT_SECRET` | any random string |
| `REFRESH_SECRET` | any different random string |
| `REDIS_URL` | `redis://localhost:6379` |

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Repository Layout](#2-repository-layout)
3. [Backend Architecture](#3-backend-architecture)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Database Design](#5-database-design)
6. [Redis Architecture](#6-redis-architecture)
7. [Authentication & Security](#7-authentication--security)
8. [Poll Lifecycle & State Machine](#8-poll-lifecycle--state-machine)
9. [Analytics System](#9-analytics-system)
10. [Socket.IO / Realtime Layer](#10-socketio--realtime-layer)
11. [Rate Limiting](#11-rate-limiting)
12. [End-to-End Request Flows](#12-end-to-end-request-flows)
13. [File-by-File Reference](#13-file-by-file-reference)
14. [Function-Level Reference](#14-function-level-reference)
15. [Scalability Discussion](#15-scalability-discussion)
16. [Developer Modification Guide](#16-developer-modification-guide)
17. [Environment Variables](#17-environment-variables)

---

## 1. System Overview

**Stack:** Node.js/Express + PostgreSQL (Drizzle ORM) + Redis + Socket.IO on the backend; React 18/Vite/Tailwind on the frontend.

```
┌──────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              React SPA (Vite/CSR)                   │    │
│  │                                                     │    │
│  │  ThemeContext ──► AuthContext ──► AppRoutes (lazy)  │    │
│  │       │               │               │             │    │
│  │  CSS vars        tokenStore      ProtectedRoute     │    │
│  │                       │               │             │    │
│  │              api/index.js        useSocket.js       │    │
│  └──────────────────┬────────────────────┬────────────┘    │
│                     │ HTTP/REST           │ WebSocket        │
└─────────────────────┼────────────────────┼──────────────────┘
                      │                    │
┌─────────────────────▼────────────────────▼──────────────────┐
│                   Express HTTP Server                        │
│                                                              │
│  helmet ──► cors ──► cookieParser ──► routes                 │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │  /auth/*    │    │  /polls/*   │    │   Socket.IO     │  │
│  │  controller │    │  controller │    │   handlers.js   │  │
│  │  services   │    │  services   │    │   rooms/events  │  │
│  │  queries    │    │  queries    │    └────────┬────────┘  │
│  └──────┬──────┘    └──────┬──────┘             │           │
│         └──────────────────┘                    │           │
│                     │                           │           │
│              Drizzle ORM                  lifecycle/         │
│                     │                    worker.js          │
│               PostgreSQL                 (5s timer)         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                      Redis                           │  │
│  │  poll cache │ analytics cache │ mutex locks │ rl     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Repository Layout

```
Polling_Hackathon/
├── backend/
│   ├── server.js              Entry: httpServer, Socket.IO, graceful shutdown
│   ├── app.js                 Express app factory (middleware, routes, CORS)
│   ├── config/redis.js        Redis client singleton
│   ├── db/
│   │   ├── index.js           Drizzle db instance (pg pool)
│   │   └── schema.js          Table definitions + enums + relations
│   ├── modules/
│   │   ├── auth/              controller · services · queries · routes · schemas · middleware
│   │   ├── poll/              controller · services · queries · routes · schemas
│   │   └── analytics/         service · queries
│   ├── socket/
│   │   ├── index.js           io singleton + room/emit helpers
│   │   └── handlers.js        Event handlers + abuse prevention
│   ├── lifecycle/worker.js    Background: auto-activate + auto-expire polls
│   └── common/
│       ├── middleware/        errorHandler · rateLimiter · validate
│       └── utils/             api-error · response · slugify · tokenLogic
│
└── pollcraft/
    └── src/
        ├── api/index.js       fetch wrapper + token store + auto-refresh
        ├── context/           AuthContext · ThemeContext
        ├── hooks/useSocket.js Socket.IO connection hook
        ├── pages/             LandingPage · AuthPage · DashboardPage · CreatePollPage
        │                      EditPollPage · AnalyticsPage · PublicAnalyticsPage
        │                      PollVotePage · DiscoverPage · UserPage · HelpPage
        └── components/        analytics/ · layout/ · poll/ · ui/
```

---

## 3. Backend Architecture

### Layer Pattern (all modules)

```
routes.js      declares HTTP path + middleware chain
    │
controller.js  extracts req params → calls service → sends response
    │
services.js    business logic, cache ops, socket emits
    │
queries.js     raw Drizzle calls only — no Redis, no sockets
```

### Request Lifecycle

```
HTTP Request
    │
    ▼
Middleware pipeline
    helmet() → cors() → express.json() → cookieParser()
    │
    ▼
Route-specific middleware (in order)
    rateLimiter → optionalAuth/authMiddleware → validate(schema)
    │
    ▼
controller → service → query → response helper
```

### Standard Response Envelope

```json
// Success
{ "success": true, "message": "...", "data": { ... } }

// Error
{ "success": false, "message": "...", "errors": [...] }
```

---

## 4. Frontend Architecture

### Provider Tree

```
<BrowserRouter>
  <ThemeProvider>     CSS variable injection, persists to localStorage
    <AuthProvider>    user state, access token in memory, refresh on boot
      <AppRoutes />   lazy code-split pages
    </AuthProvider>
  </ThemeProvider>
</BrowserRouter>
```

### Auth State Hydration (on every page load)

```
AuthProvider mounts
    │
    ▼
POST /auth/refresh  (sends httpOnly refreshToken cookie)
    │
    ├── 401 ──► user = null, loading = false ──► redirect to /auth
    │
    └── 200 ──► tokenStore.set(accessToken)
                    │
                    ▼
               GET /auth/me
                    │
                    └── setUser(user) ──► loading = false ──► render page
```

### Token Storage

Access tokens live in a JS module-level variable — not `localStorage` (XSS risk) or cookies (CSRF risk). On tab close the token is gone; the `httpOnly` refresh cookie handles persistence.

```js
let _token = null
export const tokenStore = {
  get: () => _token,
  set: (t) => { _token = t },
  clear: () => { _token = null },
}
```

### 401 Auto-Refresh Flow

```
API request fires
    │
    ├── 401 received
    │       │
    │       ▼
    │   tryRefresh() ──► POST /auth/refresh
    │       │
    │       ├── success ──► retry original request with new token
    │       └── failure ──► tokenStore.clear()
    │                           │
    │                           ▼
    │                      dispatch 'auth:expired'
    │                           │
    │                           ▼
    │                      AuthContext ──► setUser(null)
    │
    └── other status ──► throw ApiError
```

> **Concurrent refresh deduplication:** `_refreshPromise` coalesces multiple simultaneous 401s into a single `/auth/refresh` call.

---

## 5. Database Design

### Schema

```
┌──────────┐       ┌──────────┐       ┌────────────┐
│  users   │──1:N──│  polls   │──1:N──│ questions  │
│          │       │          │       │            │
│ id PK    │       │ id PK    │       │ id PK      │
│ email    │       │creator_id│       │ poll_id FK │
│ password │       │ title    │       │ content    │
│ provider │       │ slug     │       │ options ◄──┼── JSONB (not a table)
│refresh_  │       │ status   │       │ is_mand.   │
│  token   │       │anon_allow│       │ disp_order │
└──────────┘       │expires_at│       └────────────┘
                   │publish_on│
                   │results_  │
                   │  visib.  │
                   └──────┬───┘
                          │
              ┌───────────┴──────────┐
              │                      │
        ┌─────▼──────┐         ┌─────▼──────┐
        │ responses  │──1:N───►│  answers   │
        │            │         │            │
        │ id PK      │         │ id PK      │
        │ poll_id FK │         │response_id │
        │ user_id FK │         │question_id │
        │session_tok │         │selected_   │
        │submitted_at│         │  option_id │
        └────────────┘         └────────────┘
```

### Key Design Decisions

**Options as JSONB** — Options are immutable once a poll goes active. Storing them on `questions` avoids an extra join on every analytics query and keeps the question self-contained for caching.

**Partial unique indexes on responses** — Database-level duplicate vote prevention, the last line of defense after the Redis lock:
```sql
UNIQUE (poll_id, user_id)       WHERE user_id IS NOT NULL
UNIQUE (poll_id, session_token) WHERE session_token IS NOT NULL
```

**Cascade deletes:**
```
users ──cascade──► polls ──cascade──► questions
                        └──cascade──► responses ──cascade──► answers
```
`responses.user_id` uses `SET NULL` (not cascade) so analytics survive account deletion.

### Indexes

| Index | Rationale |
|---|---|
| `polls_slug_idx` | Slug lookups on every vote page load |
| `polls_status_idx` | Lifecycle worker queries |
| `polls_creator_idx` | Dashboard queries |
| `responses_poll_idx` | Analytics aggregation |
| `answers_question_idx` | `GROUP BY question_id` in vote counts |

---

## 6. Redis Architecture

### Key Map

| Key Pattern | Type | TTL | Purpose |
|---|---|---|---|
| `poll:{slug}` | JSON string | 60s | Cached poll + questions |
| `analytics:{pollId}` | JSON string | 30s | Fresh analytics |
| `analytics:stale:{pollId}` | JSON string | 120s | Stale fallback |
| `analytics:lock:{pollId}` | String | 10s | Stampede mutex |
| `lock:response:{pollId}:{id}` | String | 15s | Submission mutex |
| `rl:{prefix}:{userId\|ip}` | Counter | window | Rate limiter |

### Analytics Cache — Stampede Protection

```
getAnalytics(pollId)
    │
    ├── redis.get(analytics:{pollId}) ──► HIT ──► return
    │
    └── MISS
            │
            ▼
        SET analytics:lock:{pollId} NX EX 10
            │
            ├── ACQUIRED ──► buildAnalytics()
            │                    │
            │                    └──► write fresh (30s) + stale (120s) ──► return
            │
            └── TAKEN (another process computing)
                    │
                    ▼
                Poll every 100ms, up to 3s
                    │
                    ├── fresh key appears ──► return it
                    └── timeout ──► read analytics:stale:{pollId}
                                        │
                                        ├── found ──► return stale data
                                        └── nothing ──► compute directly
```

### Submission Mutex

```
SET lock:response:{pollId}:{userId} NX EX 15
    │
    ├── acquired ──► check DB ──► insert ──► release (finally)
    └── not acquired ──► 409 Conflict
```

---

## 7. Authentication & Security

### Token Architecture

```
┌──────────────────┬─────────────────┬─────────┬──────────────┐
│ Token            │ Storage         │ TTL     │ Secret       │
├──────────────────┼─────────────────┼─────────┼──────────────┤
│ Access JWT       │ JS memory       │ 15m     │ JWT_SECRET   │
│ Refresh JWT      │ httpOnly cookie │ 7d      │ REFRESH_SEC. │
│ Anonymous JWT    │ httpOnly cookie │ 30d     │ JWT_SECRET   │
└──────────────────┴─────────────────┴─────────┴──────────────┘
```

### Refresh Token Rotation

```
POST /auth/refresh
    │
    ├── verify JWT + expiry
    ├── generate newRefreshToken
    │
    ▼
UPDATE users SET refresh_token = $new WHERE refresh_token = $old RETURNING id
    │
    ├── returns row ──► set new cookie + issue new access token
    │
    └── returns null ──► TOKEN REUSE DETECTED
                             │
                             └──► clearCookie + 401
```

If an attacker uses a stolen refresh token first, the legitimate user's next refresh gets `null` back, forcing re-login and invalidating the stolen token.

### Anonymous Voting

```
POST /auth/anon-token
    │
    ├── valid anonToken cookie ──► reuse existing anonId
    └── missing/invalid ──► new UUID ──► sign JWT ──► set 30d httpOnly cookie

anonId stored as session_token in responses table
```

### Security Matrix

| Vector | Mitigation |
|---|---|
| XSS token theft | Access token in JS memory, not localStorage |
| CSRF | `SameSite=strict` cookies; Bearer token required for mutations |
| Refresh token replay | Rotation with DB invalidation + reuse detection |
| Duplicate vote | Redis mutex + DB unique partial index (two layers) |
| Rate abuse (auth) | 20 req / 5 min per IP |
| Rate abuse (submit) | 5 req / 1 min per user/IP |
| Oversized body | 50 KB `express.json` limit |
| Socket flooding | 100 events/sec per socket before disconnect |
| Socket room abuse | Max 20 joins per socket lifetime |

---

## 8. Poll Lifecycle & State Machine

```
                         ┌─────────────────────────┐
                         │     Lifecycle Worker     │
                         │   (setInterval 5s)       │
                         │  checks publishOn        │
                         │  and expiresAt           │
                         └────────┬────────┬────────┘
                    auto-activate │        │ auto-expire
                                  │        │
  PATCH /activate                 │        │
  (manual)                        │        │
       │                          │        │
       ▼                          ▼        ▼
   [DRAFT] ──────────────► [ACTIVE] ────────────► [EXPIRED]
      │                       │                       │
      │                       │                       │
      │         PATCH /publish│         PATCH /publish│
      └───────────────────────┴───────────────────────┘
                              │
                              ▼
                         [PUBLISHED]
```

**Valid transitions:**
- `draft → active`: manual activate OR lifecycle worker when `publishOn ≤ now`
- `active → expired`: lifecycle worker when `expiresAt ≤ now`
- `active / expired → published`: manual publish

**Rules enforced in `poll.services.js`:**

| Action | Allowed statuses |
|---|---|
| Edit poll | `draft` only |
| Publish | `active` or `expired` |
| Vote | `active` only |
| View (public) | `active` or `published` |

**On any status change, the worker:**
1. Updates DB status
2. Invalidates Redis poll cache
3. Emits socket events to connected clients

---

## 9. Analytics System

### Data Shape

```json
{
  "pollId": "uuid",
  "totalResponses": 42,
  "questions": [
    {
      "questionId": "uuid",
      "content": "...",
      "options": [
        { "id": "opt1", "text": "Option A", "votes": 18 },
        { "id": "opt2", "text": "Option B", "votes": 24 }
      ]
    }
  ],
  "participation": [
    { "hour": "2025-01-01T14:00:00Z", "count": 5 }
  ],
  "computedAt": "2025-01-01T15:32:00Z"
}
```

### Computation Pipeline

```
buildAnalytics(pollId)
    │
    └── Promise.all([                    ← all 4 run in parallel
            getResponseCount(pollId),
            getOptionCounts(pollId),
            getParticipationOverTime(pollId),
            findPollById(pollId)
        ])
            │
            ▼
        Build questionMap (scaffold all options with 0 votes)
            │
            ▼
        Overlay actual vote counts
            │
            ▼
        Return analytics object
```

### Visibility Rules

| Setting | Who can view |
|---|---|
| `all` | Anyone (including unauthenticated) |
| `respondents` | Creator OR users who submitted a response |
| `private` | Creator only |

### When Analytics Recompute

1. After every successful vote submission (synchronous, in request path)
2. On cache miss (with mutex lock)
3. After poll expires (cache invalidated → next read recomputes)

---

## 10. Socket.IO / Realtime Layer

### Room Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Socket.IO Rooms                    │
│                                                     │
│  public:poll:{pollId}          private:poll:{pollId}│
│  ┌────────────────────┐        ┌───────────────────┐│
│  │ Any visitor to a   │        │ Authenticated     ││
│  │ poll (vote page,   │        │ creator of that   ││
│  │ public results)    │        │ poll only         ││
│  └────────────────────┘        └───────────────────┘│
│                                                     │
│  Events flow one way: server emits, clients listen  │
│  Clients only send: join / leave events             │
└─────────────────────────────────────────────────────┘
```

### Event Reference

| Event | Direction | Room | Payload |
|---|---|---|---|
| `join:poll:public` | Client→Server | – | `pollId` |
| `join:poll:admin` | Client→Server | – | `pollId` |
| `analytics-updated` | Server→Client | admin | full analytics object |
| `response-count-updated` | Server→Client | public | `{pollId, totalResponses}` |
| `viewer-count-updated` | Server→Client | public | `{pollId, count}` |
| `poll-expired` | Server→Client | public | `{pollId, status}` |
| `poll-published` | Server→Client | public | `{pollId, status}` |
| `poll-status-changed` | Server→Client | admin | `{pollId, status}` |
| `error:admin-join` | Server→Client | socket | `{message}` |

### Abuse Prevention (per-socket, in-process Maps)

```
socketJoinCounts     max 20 rooms joined per socket lifetime
socketEventBucket    max 100 events / second → disconnect on breach
socketPublicRooms    Set of joined public room IDs
socketAdminRooms     Set of joined admin room IDs
```

> These are in-process, not Redis-backed — they don't survive restarts or work across multiple server instances. See [Scalability](#15-scalability-discussion) for the fix.

### useSocket Hook (Frontend)

```js
useSocket(pollId, handlers, token)
// token present  → joins admin room
// token absent   → joins public room
// handlersRef    → handlers update without reconnecting
// cleanup        → leave + disconnect on unmount
```

---

## 11. Rate Limiting

| Limiter | Window | Max | Route |
|---|---|---|---|
| `authRateLimiter` | 5 min | 20 | POST /auth/register, /login, /google |
| `submitRateLimiter` | 1 min | 5 | POST /polls/:slug/respond |
| `readRateLimiter` | 1 min | 120 | GET /polls, /polls/:slug |
| `analyticsRateLimiter` | 1 min | 60 | GET /polls/:id/analytics |

**Key:** `req.user?.userId ?? req.ip` — authenticated users keyed by userId; anonymous by IP.

**Fail-open:** Redis error → log + pass request through. Availability over strict enforcement.

**Lua script (atomic INCR + EXPIRE):**
```lua
local v = redis.call('INCR', KEYS[1])
if v == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return v
```

---

## 12. End-to-End Request Flows

### Poll Vote Submission

```
User selects answers → Submit
    │
    ▼
Client validates mandatory questions answered
    │
    ▼
POST /polls/:slug/respond
    │
    ▼
submitRateLimiter (5 req/min)
    │
    ▼
optionalAuth → extract userId if logged in
    │
    ▼
validate(SubmitResponseSchema)
    │
    ▼
submitResponse(service):
    │
    ├── findPollBySlug → status === 'active'? → else 400
    ├── expiresAt < now? → 400
    ├── anonymous not allowed + no userId? → 401
    ├── extract anonId from cookie if anon
    │
    ├── SET lock:response:{pollId}:{id} NX EX 15
    │       └── not acquired → 409
    │
    ├── findExistingResponse → exists → 409
    ├── validate mandatory questions covered
    ├── validate all selectedOptionIds exist in question options
    │
    ├── insertResponse (transaction):
    │       INSERT INTO responses
    │       INSERT INTO answers (one per answer)
    │
    ├── invalidateAnalyticsCache → del both analytics keys
    ├── computeAndCacheAnalytics → build + write Redis
    ├── emitAnalyticsUpdate:
    │       ├── admin room: analytics-updated (full object)
    │       └── public room: response-count-updated (count only)
    │
    └── DEL lockKey (always in finally)
    │
    ▼
201 { responseId }
```

### Realtime Analytics Flow

```
Vote submitted
    │
    ▼
emitAnalyticsUpdate(pollId, analytics)
    │
    ├── private:poll:{pollId} ──► "analytics-updated"
    │       │
    │       ▼
    │   AnalyticsPage.handleAnalyticsUpdate()
    │       throttled 500ms → setAnalytics() → charts re-render
    │
    └── public:poll:{pollId} ──► "response-count-updated"
            │
            ▼
        PollVotePage / PublicAnalyticsPage
            → update live counter display
```

### Poll Auto-Expire Flow

```
lifecycle/worker.js tick() every 5s
    │
    ├── findActivePollsDueForExpiry()
    │   WHERE status='active' AND expires_at <= now()
    │
    └── for each poll:
            updatePollStatus(id, 'expired')
            redis.del(poll:{slug})
            invalidateAnalyticsCache(id)
                │
                ├── public room ──► "poll-expired"
                │       └── PollVotePage: show expired banner
                │
                └── admin room ──► "poll-status-changed"
                        └── Dashboard: update status pill
```

### Refresh Token Rotation Flow

```
Access token expires → next API call → 401
    │
    ▼
tryRefresh() [deduped via _refreshPromise]
    │
    ▼
POST /auth/refresh (sends httpOnly refreshToken cookie)
    │
    ▼
UPDATE users SET refresh_token=$new WHERE refresh_token=$old RETURNING id
    │
    ├── row returned → set new cookie → return new access token
    │       │
    │       ▼
    │   tokenStore.set(newToken) → retry original request
    │
    └── null → REUSE DETECTED → clearCookie + 401
```

---

## 13. File-by-File Reference

### Backend

| File | Responsibility |
|---|---|
| `server.js` | Creates http.Server, initializes Socket.IO, starts Redis + lifecycle worker, registers shutdown handlers |
| `app.js` | Express factory: middleware stack, route mounting, 404 + error handler |
| `db/schema.js` | Single source of truth: tables, enums, indexes, Drizzle relations |
| `db/index.js` | `pg.Pool` wrapped with `drizzle()` → typed `db` instance |
| `modules/auth/auth.controller.js` | Auth HTTP handlers; defines cookie options (`COOKIE_OPTS` 7d, `ANON_COOKIE_OPTS` 30d) |
| `modules/auth/auth.services.js` | `registerLocalUser`, `loginLocalUser`, `verifyGoogleToken`, `findOrCreateGoogleUser` |
| `modules/auth/auth.queries.js` | User-table DB ops; `rotateRefreshToken` (atomic token swap) |
| `modules/poll/poll.services.js` | Most complex file: poll CRUD, voting (Redis lock), cache, socket emits |
| `modules/poll/poll.queries.js` | Poll/question/response/answer DB ops; `insertPoll` + `insertResponse` use transactions |
| `modules/analytics/analytics.service.js` | Cache stampede protection; `getAnalytics` lock-poll-stale pattern |
| `modules/analytics/analytics.queries.js` | 3 parallel aggregate queries: response count, option counts, participation timeline |
| `socket/index.js` | IO singleton; `publicRoom()` / `adminRoom()` helpers; emit helpers |
| `socket/handlers.js` | Socket event handling; per-socket state Maps; abuse prevention |
| `lifecycle/worker.js` | `activateDuePolls` + `expireActivePolls` on 5s interval |
| `common/middleware/rateLimiter.js` | Factory `createRateLimiter`; Lua INCR+EXPIRE; 4 named exports |
| `common/utils/tokenLogic.js` | `generateToken`, `generateRefreshToken`, `verifyToken`, `verifyRefreshToken` |

### Frontend

| File | Responsibility |
|---|---|
| `api/index.js` | `_token` in-memory store; `_refreshPromise` coalescing; `req()` with 401 recovery; `authApi` + `pollsApi` |
| `context/AuthContext.jsx` | Bootstrap: `refresh()` → `me()`; listens for `auth:expired` window event; exposes `login`, `logout`, `getToken` |
| `hooks/useSocket.js` | Lifecycle-managed connection; `handlersRef` for stable handlers; joins public or admin room |
| `pages/AnalyticsPage.jsx` | Creator analytics view; `handleAnalyticsUpdate` throttled 500ms; CSV export; falls back to polling on socket disconnect |
| `pages/PollVotePage.jsx` | Vote page; parallel load of poll + submission status; listens for `poll-expired` / `poll-published` |
| `pages/DashboardPage.jsx` | Mounts one `PollStatusWatcher` per poll (each runs `useSocket`); handles activate/publish/delete |

---

## 14. Function-Level Reference

### `submitResponse` — `poll.services.js`

**Input:** `{ slug, userId, anonToken, answers: [{questionId, selectedOptionId}] }`

**Validation order:** poll exists → active → not expired → anon allowed → Redis lock → no existing response → mandatory questions → valid option IDs

**Side effects:** DB write, Redis cache invalidate + recompute, socket emit

**Concurrency:** `SET NX EX 15` lock; DB unique index as fallback

---

### `getAnalytics` — `analytics.service.js`

**Input:** `pollId: string`

Returns cached analytics or triggers `computeAndCacheAnalytics`. Uses Redis mutex to prevent stampede; stale fallback prevents empty response under lock contention.

---

### `rotateRefreshToken` — `auth.queries.js`

```sql
UPDATE users SET refresh_token = $new WHERE refresh_token = $old RETURNING id
```

Returns `{ id }` on success, `null` on reuse detection. The WHERE clause matching `oldToken` ensures only the current token holder can rotate.

---

### `buildAnalytics` — `analytics.service.js`

Runs 4 DB queries in parallel via `Promise.all`. The poll fetch retrieves question/option structure (including options with 0 votes not yet selected), then vote counts are merged in.

---

### `tryRefresh` — `api/index.js`

Deduplicates concurrent refresh calls via `_refreshPromise`. If refresh is already in-flight, returns the same promise. Resets to `null` in `.finally()`.

---

### `useSocket` — `useSocket.js`

Effect triggers on `[pollId, token]` change — connection tears down and rebuilds if either changes. Handlers are stored in `handlersRef` so they can be updated without reconnecting. Cleanup: `leave:poll:public` + `socket.disconnect()`.

---

## 15. Scalability Discussion

### What's Already Optimized

- **Poll cache (60s)** — 1000 concurrent voters → ~1 DB query per minute instead of 1000
- **Analytics cache (30s + stale)** — Eliminates redundant aggregate queries
- **Stampede mutex** — Prevents thundering herd on cache expiry
- **Submission mutex** — Prevents double-vote race without relying on DB error path
- **Parallel analytics queries** — `Promise.all` for ~4x speedup vs sequential
- **Code splitting** — Only landing + auth JS sent to unauthenticated visitors

### Current Bottlenecks

```
Single process
    │
    ├── Socket.IO room state in-process Maps
    │       → sockets on server A don't know about server B
    │       → fix: add @socket.io/redis-adapter + move Maps to Redis
    │
    ├── Lifecycle worker runs everywhere if you scale out
    │       → fix: distributed lock or external cron
    │
    └── Analytics recompute is synchronous in submission path
            → under high velocity: adds latency + DB load
            → fix: debounce recompute (accept N-second analytics lag)
```

### Frontend Bottlenecks

- `DashboardPage` creates one socket connection per poll — refactor to single connection for multiple polls
- Charts re-render on every analytics update — 500ms throttle helps; consider `React.memo` on chart components

---

## 16. Developer Modification Guide

### Adding a New API Route

1. Zod schema in `*.schemas.js`
2. Query in `*.queries.js` (pure Drizzle only)
3. Service function in `*.services.js`
4. Controller function in `*.controller.js`
5. Mount in `*.routes.js`

> **Never:** cache ops in `queries.js` · DB calls in `controller.js` · socket emits in `queries.js` or `controller.js`

### Adding a New Poll Status

1. Update `pollStatusEnum` in `db/schema.js`
2. Add transition logic in `poll.services.js`
3. Add route + controller
4. Invalidate cache in service
5. Emit socket event if clients need realtime update

### Adding a New Socket Event

**Backend:** Add emit helper in `socket/index.js` → call from service → add handler in `socket/handlers.js` (with rate check) if client-initiated.

**Frontend:** Add handler property to `useSocket` handlers object → add `socket.on(eventName, ...)` in `useSocket.js` → pass handler from page component.

### Adding a Database Column

1. Add to `schema.js`
2. `npm run db:generate` then `npm run db:migrate`
3. Update queries, services, Zod schemas, frontend API types

### Cache Staleness Rules

- After any poll data change → `invalidatePollCache(slug)`
- After any analytics data change → `invalidateAnalyticsCache(pollId)`
- **Always read from DB for mutation checks** — never use `poll:*` cache to decide whether to write

### Common Pitfalls

| Pitfall | Fix |
|---|---|
| Flash-of-wrong-route | Gate route guards on `!loading`, not just `!user` |
| setState on unmounted component | Use `cancelled` flag in data-fetching effects |
| Stale socket handlers | Store handlers in `useRef`, not effect deps |
| Socket not cleaned up | Always return cleanup from socket `useEffect`s |
| Token rotation null | Check return value of `rotateRefreshToken` — null = reuse, clear cookie immediately |

---

## 17. Environment Variables

### Backend

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | – | PostgreSQL connection string |
| `JWT_SECRET` | **Yes** | – | Access + anon token signing |
| `REFRESH_SECRET` | **Yes** | – | Refresh token signing |
| `PORT` | No | `3000` | HTTP listen port |
| `NODE_ENV` | No | `development` | Affects cookie `secure` flag |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection |
| `JWT_EXPIRY` | No | `15m` | Access token lifetime |
| `REFRESH_EXPIRY` | No | `7d` | Refresh token lifetime |
| `GOOGLE_CLIENT_ID` | No | – | Required for Google OAuth |
| `CLIENT_ORIGIN` | No | `http://localhost:5173` | CORS allowed origin |
| `TRUST_PROXY_HOPS` | No | `0` | Set to `1` behind a reverse proxy |

### Frontend (Vite)

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_API_URL` | No | `http://localhost:3000` | Backend base URL |
| `VITE_GOOGLE_CLIENT_ID` | No | – | Google OAuth client ID |

---

## Quick Reference

| Concern | Location |
|---|---|
| JWT sign/verify | `common/utils/tokenLogic.js` |
| Cookie options | `modules/auth/auth.controller.js` |
| Rate limit config | `common/middleware/rateLimiter.js` |
| Redis key names | `poll.services.js` + `analytics.service.js` |
| Poll status transitions | `modules/poll/poll.services.js` |
| Analytics computation | `analytics.service.js → buildAnalytics` |
| Socket room names | `socket/index.js` |
| Socket abuse limits | `socket/handlers.js` |
| DB schema | `db/schema.js` |
| Auto-expire / auto-activate | `lifecycle/worker.js` |
| Token rotation (server) | `auth.queries.js → rotateRefreshToken` |
| Token refresh (client) | `api/index.js → tryRefresh` |
| Auth state hydration | `context/AuthContext.jsx` |
| Duplicate vote prevention | `poll.services.js` (Redis lock) + `schema.js` (unique index) |
