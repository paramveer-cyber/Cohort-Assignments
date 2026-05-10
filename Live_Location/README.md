# LiveTrack

Real-time live location tracking. Authenticated users share their GPS position every 10 seconds. All connected users see each other moving on a Leaflet map. Location events flow through Kafka — one consumer broadcasts updates via Socket.IO, a separate consumer batches writes to Postgres.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express, Socket.IO |
| Auth | ChaiAuth OIDC (Authorization Code Flow) |
| Events | Kafka (KafkaJS) |
| Database | PostgreSQL |
| Map | Leaflet.js |
| Session | In-memory (signed cookies, no Redis) |

---

## Project Structure

```
livetrack/
├── server/
│   ├── index.js              # Express + Socket.IO + Kafka consumer (socket broadcaster)
│   ├── routes/auth.js        # OIDC login / callback / logout
│   ├── lib/
│   │   ├── session.js        # In-memory session store + signed cookies
│   │   ├── kafka.js          # Kafka producer + consumer factory
│   │   ├── db.js             # Postgres pool + schema init
│   │   └── sockets.js        # Socket.IO event handlers
│   └── consumers/
│       └── db.js             # Separate process: batched DB writes from Kafka
├── public/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── .env.example
└── package.json
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

```
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000

SESSION_SECRET=<random 32+ char string>

OIDC_ISSUER=http://localhost:8080
OIDC_CLIENT_ID=<from ChaiAuth>
OIDC_CLIENT_SECRET=<from ChaiAuth>

KAFKA_BROKERS=localhost:9092
KAFKA_USERNAME=
KAFKA_PASSWORD=
KAFKA_TOPIC=location-updates

DATABASE_URL=postgresql://user:pass@localhost:5432/livetrack
```

### 3. Kafka setup

**Local (Docker):**
```bash
docker run -d --name kafka -p 9092:9092 \
  -e KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181 \
  apache/kafka:3.7.0
```

Or use **Upstash Kafka** (free, no card): [upstash.com](https://upstash.com) → Create Kafka cluster → copy brokers, username, password into `.env`. Set `KAFKA_BROKERS`, `KAFKA_USERNAME`, `KAFKA_PASSWORD`.

The topic `location-updates` is created automatically on first publish.

### 4. Postgres setup

```bash
# Create database
createdb livetrack

# Tables are created automatically on server start (initDB)
```

Or use **Neon** (free): [neon.tech](https://neon.tech) → copy connection string into `DATABASE_URL`.

### 5. Register ChaiAuth OIDC client

```bash
# Login to get token
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin1234"}'

# Register client
curl -X POST http://localhost:8080/clients \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "LiveTrack",
    "client_type": "confidential",
    "redirect_uris": ["http://localhost:3000/auth/callback"],
    "allowed_scopes": "openid profile email",
    "client_secret": "your-client-secret"
  }'
```

Copy the returned `client_id` and your chosen `client_secret` into `.env`.

---

## Running

**Terminal 1 — main server:**
```bash
npm run dev
```

**Terminal 2 — DB consumer (separate Kafka consumer group):**
```bash
npm run db:consumer
```

Both must run for the full flow. The main server handles socket broadcasting; the DB consumer handles persistence.

---

## Event Flow

```
Browser
  │  (every 10s)
  ▼
socket.emit('location:send', { lat, lng })
  │
Socket.IO server
  │  validates session → gets user.sub
  ▼
Kafka producer → topic: location-updates
  │
  ├──▶ Consumer group: livetrack-socket-broadcaster
  │       io.emit('location:update', { userId, lat, lng, … })
  │       → all connected browsers update marker on map
  │
  └──▶ Consumer group: livetrack-db-writer
          batches events for 5 seconds
          → bulk INSERT into location_history
```

### Why Kafka here

Every GPS ping from every user hitting the DB directly would cause a write spike. Kafka absorbs the burst. The socket broadcaster consumer processes events immediately for real-time UX. The DB consumer batches them (5s windows) for efficient bulk inserts — same pattern used in ride-tracking apps like Uber/Ola.

### Consumer groups

Two consumer groups subscribe to the same topic independently:
- `livetrack-socket-broadcaster` — real-time, processes every message immediately
- `livetrack-db-writer` — persistence, batches and flushes every 5s

Each group gets its own offset — adding consumers does not affect the other group.

---

## Auth Flow

1. User clicks Sign In → `GET /auth/login`
2. Server generates `state` + `nonce`, redirects to ChaiAuth `/signin`
3. ChaiAuth authenticates user, redirects to `GET /auth/callback?code=…&state=…`
4. Server validates state, exchanges code for tokens via `POST /token`
5. Verifies `id_token` signature using ChaiAuth JWKS (`/open-certs`)
6. Creates in-memory session, sets signed HttpOnly cookie
7. Socket.IO reads the same cookie on `connection` to identify the user

Anonymous users are disconnected immediately on socket connect.

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default 3000) |
| `APP_URL` | Full public URL of this app |
| `SESSION_SECRET` | ≥32 char random string for cookie signing |
| `OIDC_ISSUER` | ChaiAuth base URL |
| `OIDC_CLIENT_ID` | From ChaiAuth client registration |
| `OIDC_CLIENT_SECRET` | From ChaiAuth client registration |
| `KAFKA_BROKERS` | Comma-separated broker addresses |
| `KAFKA_USERNAME` | Kafka SASL username (Upstash / cloud) |
| `KAFKA_PASSWORD` | Kafka SASL password (Upstash / cloud) |
| `KAFKA_TOPIC` | Topic name (default: `location-updates`) |
| `DATABASE_URL` | Postgres connection string |

---

## Assumptions & Limitations

- Sessions are in-memory — restarts clear all sessions (users need to re-login)
- Stale users (no update for 40s) are removed from the map automatically
- Location is sent every 10 seconds while sharing is active
- No location history UI — history is stored in DB but not visualised
- Single-server only — for multi-server, the socket broadcaster consumer would need sticky sessions or a pub/sub layer
