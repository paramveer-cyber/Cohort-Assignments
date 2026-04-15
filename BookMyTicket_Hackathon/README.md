# ChaiCode Cinema 🎟️

A full-stack, concurrent-safe seat booking system built as a hackathon project. It features a secure JWT-based authentication flow, a server-rendered frontend, and PostgreSQL-backed seat management with pessimistic locking to prevent double-bookings under race conditions.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Authentication Flow](#authentication-flow)
- [Security](#security)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Scripts](#scripts)

---

## Overview

ChaiCode Cinema is a Node.js/Express REST API that allows authenticated users to view available seats and book one by locking it to their account. The system is designed to be race-condition-safe: concurrent booking attempts on the same seat are resolved at the database level using `SELECT ... FOR UPDATE` within an explicit transaction, ensuring only one request succeeds while others receive a clean `409 Conflict` response.

The application serves a built-in HTML frontend at the root (`/`) — there is no separate frontend build step or separate origin, which is why CORS is intentionally disabled.

---

## Features

- **JWT Authentication** — Short-lived access tokens (15m) paired with long-lived refresh tokens (7d), stored as `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
- **Automatic Token Rotation** — On access token expiry, the `verifyJWT` middleware transparently issues a new access/refresh token pair and communicates the new access token via the `X-New-Access-Token` response header without requiring a separate client-side refresh call.
- **Refresh Token Reuse Detection** — If a refresh token that has already been rotated is presented again, the system immediately invalidates the entire session by nulling the stored token (protection against token theft).
- **Race-Condition-Safe Seat Booking** — Uses `BEGIN` / `SELECT ... FOR UPDATE` / `COMMIT` to prevent concurrent double-bookings at the database level.
- **Input Validation** — All incoming user data is validated with [Zod](https://zod.dev/) before reaching business logic (min/max length, uppercase, lowercase, digit password rules).
- **Structured Error Handling** — A custom `ApiError` class distinguishes operational errors (400, 401, 404, 409) from unexpected errors, routing them through a centralized Express error handler.
- **Drizzle ORM** — Type-safe schema definition and query building via Drizzle ORM over a `pg` connection pool targeting [Neon](https://neon.tech/) (serverless Postgres).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM, `"type": "module"`) |
| Framework | Express 5 |
| Database | PostgreSQL (via Neon serverless) |
| ORM / Query Builder | Drizzle ORM + drizzle-kit |
| DB Driver | `pg` (connection pool) + `@neondatabase/serverless` |
| Authentication | `jsonwebtoken` (JWT) |
| Password Hashing | `bcrypt` (cost factor 12) |
| Validation | Zod |
| Cookie Parsing | `cookie-parser` |
| Config | `dotenv` |

---

## Project Structure

```
.
├── index.mjs                    # App entry point: Express setup, seat routes
├── index.html                   # Served frontend (SSR-style, single file)
├── drizzle.config.js            # Drizzle Kit configuration for migrations
├── package.json
│
├── auth/
│   ├── auth.routes.js           # /auth/* route definitions
│   ├── auth.controllers.js      # Request/response handlers
│   ├── auth.services.js         # Business logic (create, login, logout, token refresh)
│   └── auth.middleware.js       # Zod validation + refresh cookie guard
│
└── common/
    ├── db/
    │   ├── db.js                # pg Pool, Drizzle instance, DB helper functions
    │   └── schema.js            # Drizzle table schemas: users, seats
    ├── middleware/
    │   ├── verifyJWT.js         # Auth guard with silent token rotation
    │   └── errorHandler.js      # Centralized Express error handler
    └── utils/
        ├── jwt.utils.js         # Token generation and verification helpers
        ├── apiError.js          # Custom operational error class
        └── apiResponse.js       # Standardized success response helpers
```

---

## Database Schema

### `users`

| Column | Type | Constraints |
|---|---|---|
| `user_id` | `uuid` | Primary key, default random |
| `username` | `varchar(155)` | Unique, not null |
| `password` | `text` | Not null (bcrypt hash) |
| `refresh_token` | `text` | Nullable (null = logged out) |
| `created_at` | `timestamp` | Default now |

### `seats`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key, default random |
| `seat_no` | `serial` | Auto-incrementing seat number |
| `name` | `varchar(255)` | Name of the person who booked |
| `isbooked` | `integer` | `0` = available, `1` = booked |
| `booked_by` | `uuid` | Foreign key → `users.user_id` |

> Migrations are managed via `drizzle-kit`. Run `npx drizzle-kit generate` to generate SQL migrations from the schema, then `npx drizzle-kit migrate` to apply them.

---

## API Reference

All endpoints return JSON unless noted. Protected endpoints require a `Bearer <accessToken>` `Authorization` header.

### Auth — `/auth`

#### `GET /auth/health`
Health check for the auth service.

**Response:** `200 OK` — plain text `OK`

---

#### `POST /auth/signup`
Register a new user.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "Password1"
}
```

**Validation Rules:**
- `username`: 2–100 characters
- `password`: 8–255 characters, must include at least one uppercase letter, one lowercase letter, and one digit

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Registration success",
  "data": {
    "user_id": "uuid",
    "username": "john_doe",
    "created_at": "2026-04-15T00:00:00.000Z"
  }
}
```

**Error Responses:** `400 Bad Request` (validation failure), `409 Conflict` (username taken)

---

#### `POST /auth/login`
Authenticate a user and receive tokens.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "Password1"
}
```

**Response `200 OK`:**
```json
{
  "user": {
    "user_id": "uuid",
    "username": "john_doe",
    "created_at": "2026-04-15T00:00:00.000Z"
  },
  "accessToken": "<jwt>"
}
```

The refresh token is set as a `Set-Cookie: refreshToken=<jwt>; HttpOnly; Secure; SameSite=Strict` header.

**Error Responses:** `400 Bad Request`, `401 Unauthorized` (wrong credentials), `404 Not Found` (user doesn't exist)

---

#### `POST /auth/logout`
Invalidate the session. Requires `refreshToken` cookie.

**Response:** `302 Redirect` to `/`. Clears the `refreshToken` cookie.

---

#### `POST /auth/refresh`
Manually rotate tokens. Requires `refreshToken` cookie.

**Response `200 OK`:**
```json
{
  "accessToken": "<new_jwt>"
}
```

A new `refreshToken` cookie is also set. Reuse of an already-rotated token returns `401` and invalidates the session entirely.

---

### Seats

#### `GET /seats` 🔒
Fetch all seats ordered by `seat_no`.

**Response `200 OK`:**
```json
[
  {
    "id": "uuid",
    "seat_no": 1,
    "name": null,
    "isbooked": 0,
    "booked_by": null
  },
  ...
]
```

---

#### `PUT /:id/:name` 🔒
Book a specific seat.

| Param | Location | Description |
|---|---|---|
| `id` | URL path | UUID of the seat to book |
| `name` | URL path | Name to associate with the booking |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Seat booked!",
  "data": {
    "id": "uuid",
    "seat_no": 5,
    "name": "john_doe",
    "isbooked": 1,
    "booked_by": "user-uuid"
  }
}
```

**Error Responses:** `401 Unauthorized` (invalid/missing token), `409 Conflict` (seat already booked)

> Concurrency note: This endpoint uses `SELECT ... FOR UPDATE` inside an explicit `BEGIN/COMMIT` transaction. If two requests arrive simultaneously for the same seat, one will acquire the row lock and succeed; the other will find `rowCount === 0` after the lock is released and return `409`.

---

### Serve Frontend

#### `GET /`
Returns the built-in `index.html` frontend.

---

## Authentication Flow

```
Client                           Server
  |                                 |
  |-- POST /auth/login ------------>|
  |                         Issues access token (15m)
  |                         Issues refresh token (7d)
  |                         Stores refresh token in DB
  |<-- 200: { accessToken } --------|
  |<-- Set-Cookie: refreshToken ----|
  |                                 |
  |-- GET /seats                    |
  |   Authorization: Bearer <at> -->|
  |                         verifyJWT: valid → pass through
  |<-- 200: seats ------------------|
  |                                 |
  |   (access token expires)        |
  |                                 |
  |-- GET /seats                    |
  |   Authorization: Bearer <exp>   |
  |   Cookie: refreshToken -------->|
  |                         verifyJWT: access token expired
  |                         → verifies refresh token
  |                         → rotates both tokens
  |                         → stores new refresh token in DB
  |<-- 200: seats ------------------|
  |<-- X-New-Access-Token: <new_at>-|
  |<-- Set-Cookie: refreshToken ----|
```

---

## Security

| Concern | Mitigation |
|---|---|
| Password storage | bcrypt with cost factor 12 |
| Token transport | Access token in `Authorization` header; refresh token in `HttpOnly` cookie (inaccessible to JS) |
| CSRF | `SameSite=Strict` cookie attribute |
| Token theft | Refresh token reuse detection: presenting a stale token invalidates the whole session |
| XSS | Refresh token never exposed to JavaScript |
| Double booking | Pessimistic row-level locking (`SELECT FOR UPDATE`) |
| Input injection | All user input validated and sanitized by Zod before reaching DB layer |
| CORS | Intentionally disabled — frontend and API share the same origin |
| Operational errors | Separated from unexpected errors via `ApiError.isOperational`; stack traces never leaked to clients |

---

## Environment Variables

Create a `.env` file in the project root. All variables are required.

```env
# PostgreSQL connection string (Neon or standard Postgres)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# JWT secrets — use long, random strings (e.g. openssl rand -hex 64)
JWT_SECRET=your_access_token_secret_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here

# Token expiry durations (optional — defaults shown)
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Server port (optional — defaults to 8080)
PORT=8080

# Set to "production" to enable Secure flag on cookies in verifyJWT middleware
NODE_ENV=production
```

> **Important:** `JWT_SECRET` and `JWT_REFRESH_SECRET` must be different. Using the same secret for both tokens undermines refresh token invalidation.

---

## Running the Project

**Prerequisites:** Node.js 18+ (for native ESM support)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your values

# 3. Push schema to your database (first time)
npx drizzle-kit push

# 4. Start the development server (with file watching)
npm run dev

# 5. Or start in production mode
npm start
```

The server will be available at `http://localhost:8080` (or the port defined in `PORT`).

---

## Scripts

The following scripts are defined in `package.json`:

| Script | Command | Description |
|---|---|---|
| `dev` | `node --watch index.mjs` | Start with Node's built-in file watcher (auto-restart on changes) |
| `start` | `node index.mjs` | Start in production mode |

For database management, `drizzle-kit` is available as a dev dependency and can be invoked directly:

```bash
# Generate SQL migration files from the schema
npx drizzle-kit generate

# Push schema changes directly to the DB (useful during development, skips migration files)
npx drizzle-kit push

# Open Drizzle Studio — a visual browser for your database
npx drizzle-kit studio
```

---

## Conclusion

ChaiCode Cinema demonstrates a production-quality approach to a seemingly simple problem. The seat booking system is not just a CRUD app — it is deliberately designed around the hard parts: concurrent writes, token lifecycle management, and clean separation between operational and unexpected failures.

The layered architecture (routes → controllers → services → db) keeps each concern isolated and testable. The authentication system goes beyond basic JWT by implementing transparent token rotation and reuse detection, making session handling both seamless for the client and resilient against token theft. At the data layer, explicit transactions with pessimistic locking ensure correctness under load without relying on application-level retries.

The codebase is intentionally minimal — no unnecessary abstractions, no bloated dependencies — making it a solid foundation to extend with features like booking cancellation, seat categories, admin dashboards, or a decoupled frontend.