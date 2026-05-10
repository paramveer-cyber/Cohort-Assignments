# Million Checkboxes

Real-time collaborative grid of 1,000,000 checkboxes. Built with Node.js, Express, WebSockets, Redis, and ChaiAuth OIDC. Designed with Bauhaus principles.

---

## Tech Stack

- **Backend** — Node.js, Express, `ws` (WebSocket), `ioredis`
- **Auth** — ChaiAuth OIDC (Authorization Code Flow), `jose` for JWT verification
- **State** — Redis bitfield (125 KB for 1M checkboxes)
- **Realtime** — WebSocket + Redis Pub/Sub for multi-instance broadcasting
- **Frontend** — Vanilla HTML/CSS/JS, virtualised grid renderer

---

## Features

- 1,000,000 checkbox grid with virtualised rendering (only visible rows in DOM)
- Real-time updates via WebSocket broadcast across all connected clients
- Redis Pub/Sub for broadcasting across multiple server instances
- ChaiAuth OIDC login — anonymous users read-only, signed-in users can toggle
- Custom rate limiting (no external packages): 15 toggles / 10 sec per user (WS), 120 req / min per IP (HTTP), 5 req / 5 min per IP (auth)
- Signed session cookies stored in Redis
- Bauhaus-styled UI — geometric, minimal, primary colours

---

## Prerequisites

- Node.js 18+
- Redis 6+
- A registered ChaiAuth client (confidential type)

---

## Installation

```bash
git clone <repo-url>
cd million-checkboxes
npm install
```

---

## Environment Configuration

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default `3000`) |
| `NODE_ENV` | `development` or `production` |
| `APP_URL` | Full public URL of this app, e.g. `http://localhost:3000` |
| `REDIS_URL` | Redis connection string, e.g. `redis://localhost:6379` |
| `SESSION_SECRET` | Random string ≥ 32 chars for signing session cookies |
| `OIDC_ISSUER` | ChaiAuth base URL, e.g. `https://auth.yourdomain.com` |
| `OIDC_CLIENT_ID` | Client ID from ChaiAuth registration |
| `OIDC_CLIENT_SECRET` | Client secret (confidential client) |
| `TOTAL_CHECKBOXES` | Optional, defaults to `1000000` |

---

## ChaiAuth Setup

1. Register a **confidential** client with ChaiAuth:

```http
POST /clients
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "client_name": "Million Checkboxes",
  "client_type": "confidential",
  "redirect_uris": ["http://localhost:3000/auth/callback"],
  "allowed_scopes": "openid profile email",
  "client_secret": "your-strong-secret"
}
```

2. Copy `client_id` and `client_secret` into `.env`.

3. Set `OIDC_ISSUER` to your ChaiAuth server's base URL (must match exactly).

---

## Redis Setup

```bash
# macOS
brew install redis && brew services start redis

# Ubuntu
sudo apt install redis-server && sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:7
```

Verify: `redis-cli ping` → `PONG`

---

## Running

```bash
# Development (auto-restart on file change, requires Node 18+)
npm run dev

# Production
npm start
```

App available at `http://localhost:3000`.

---

## Architecture

### State Storage

1M checkboxes stored as a single Redis bitfield key (`cbx:bits`). Each checkbox = 1 bit → 125 KB total. Toggle uses `BITFIELD GET` then `BITFIELD SET` atomically.

### WebSocket Flow

1. Client connects → server reads session cookie → resolves user from Redis
2. Server sends full state as base64-encoded bitfield
3. Client toggles checkbox → WebSocket `toggle` message → server validates auth + rate limit → `BITFIELD SET` → publishes to Redis Pub/Sub channel `cbx:updates`
4. All server instances receive from Pub/Sub → broadcast `update` to all connected WebSocket clients
5. Client applies update to in-memory bit array and patches visible DOM

### Rate Limiting

Redis fixed-window counter: key = `rl:{scope}:{userId_or_IP}:{window_slot}`. Incremented with `INCR`, expired with `EXPIRE`. No external packages.

- WS toggles: 15 per 10 sec per `userId`
- HTTP API: 120 per 60 sec per IP
- Auth endpoints: 5 per 300 sec per IP

### Auth Flow

1. User clicks Sign In → redirect to `GET /auth/login`
2. Server generates `state` + `nonce`, stores in Redis for 5 min, redirects to ChaiAuth `/signin`
3. ChaiAuth authenticates user, redirects to `GET /auth/callback?code=...&state=...`
4. Server validates `state`, exchanges `code` for tokens via `POST /OIDC_ISSUER/token`
5. Verifies `id_token` signature using ChaiAuth JWKS (`/open-certs`)
6. Creates session in Redis (24h TTL), sets signed httpOnly cookie
7. WebSocket connections read the same session cookie for user identity

---

## Project Structure

```
checkboxes/
├── server/
│   ├── index.js          # Express app + HTTP server
│   ├── routes/
│   │   └── auth.js       # OIDC login/callback/logout + session middleware
│   └── lib/
│       ├── redis.js       # ioredis clients (command + pub/sub)
│       ├── checkboxes.js  # Bitfield state operations
│       ├── ratelimit.js   # Custom rate limiter
│       ├── session.js     # Cookie signing + Redis session store
│       └── websocket.js   # WS server + Pub/Sub broadcaster
├── public/
│   ├── index.html
│   ├── css/style.css      # Bauhaus design system
│   └── js/app.js          # Grid renderer + WS client
├── .env.example
└── package.json
```
