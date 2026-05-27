# FormCraft

**FormCraft** is a production-style Typeform-inspired form builder SaaS built as a Turborepo monorepo, where authenticated creators can design dynamic multi-field forms with conditional logic, apply themed visuals, publish forms as public or unlisted links, collect responses from unauthenticated respondents, and analyse submission trends — all backed by a fully type-safe tRPC + Zod API, a Drizzle ORM–managed PostgreSQL schema, rate-limited public endpoints, Scalar-powered API documentation, and a Minecraft-themed Next.js frontend complete with a landing page, pricing page, explore gallery, admin dashboard, and seeded demo data ready for immediate review.

**Tech Stack:** Turborepo, Next.js 16, React 19, TypeScript, tRPC v11, Zod v4, Drizzle ORM, PostgreSQL, Express 5, Scalar, TanStack Query, Tailwind CSS v4, Radix UI, GSAP, Recharts, Brevo (email), Google OAuth, bcryptjs, jsonwebtoken, express-rate-limit, pnpm workspaces

---

## Monorepo Structure

```
formcraft/
├── apps/
│   ├── api/          # Express + tRPC backend (port 8000)
│   └── web/          # Next.js frontend (port 3000)
└── packages/
    ├── database/     # Drizzle ORM schema, migrations, seed
    ├── trpc/         # Shared tRPC router, procedures, OpenAPI meta
    ├── services/     # Business logic: auth, forms, analytics, email
    ├── logger/       # Shared logger utility
    ├── eslint-config/
    └── typescript-config/
```

---

## Demo Credentials

| Field    | Value                |
| -------- | -------------------- |
| Email    | `demo@formcraft.app` |
| Password | `Demo1234!`          |

The demo account includes three pre-seeded themed forms (Anime, Startup, Developer), multiple responses per form, and pre-computed analytics — no manual setup required.

---

## API Documentation

Interactive Scalar API docs are served at:

```
http://localhost:8000/docs
```

OpenAPI JSON schema available at:

```
http://localhost:8000/openapi.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database (e.g. [Neon](https://neon.tech))

### 1. Clone & install

```bash
git clone <repo-url>
cd formcraft
pnpm install
```

### 2. Configure environment variables

**`apps/api/.env`** — copy from `.env.example`:

```env
DATABASE_URL=postgresql://user:password@host/formcraft?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-here
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-your-google-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:8000/auth/google/callback
BREVO_API_KEY=xkeysib-your-brevo-api-key        # optional — emails skipped if unset
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BASE_URL=http://localhost:8000
NEXT_PUBLIC_WEB_URL=http://localhost:3000
```

**`apps/web/.env`** — copy from `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WEB_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. Run database migrations

```bash
cd packages/database
pnpm db:migrate
```

### 4. Seed demo data

```bash
cd packages/database
pnpm db:seed
```

This creates the demo user, 8 themes, 3 published forms, and ~14 sample responses.

### 5. Start development servers

From the repo root:

```bash
pnpm dev
```

Turborepo starts both apps in parallel:

| App      | URL                        |
| -------- | -------------------------- |
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:8000      |
| API Docs | http://localhost:8000/docs |

---

## Features

### Creator (authenticated)

- Register / login with email+password or Google OAuth
- Create, edit, publish, unpublish, clone, archive, and delete forms
- 11 field types: short text, long text, email, number, single select, multi select, checkbox, dropdown, rating, date, page break
- Per-field validation rules (min/max, required/optional)
- Conditional logic — show fields based on previous answers
- Multi-page forms via page break fields
- Form settings: custom slug, success/closed message, expiry date, response limit, password protection, collect-email toggle, multiple submissions toggle
- 8 built-in themes with custom colour and font support
- Form preview before publishing
- QR code sharing
- Response management: view, filter, delete individual or all responses
- CSV export of responses
- Analytics dashboard: total views, responses, 7/30-day trends, daily chart, per-field completion rates and value breakdowns
- Email notifications on new responses (via Brevo); per-user email preferences

### Respondent (no login required)

- Fill and submit any published form at `/f/[slug]`
- Password-unlock flow for protected forms
- Conditional field visibility
- Multi-page form navigation with progress bar
- Themed form rendering matching creator's chosen theme
- Thank-you / success screen after submission

### Public

- Landing page with animated GSAP hero and feature grid
- Pricing page (Free / Pro / Team)
- Explore page listing all public-visibility published forms
- Form template gallery — clone a template to your own account

### Admin

- Admin dashboard (role-gated): platform-wide user and form stats, manage/delete any user or form, promote forms to templates

---

## API Routes (tRPC + OpenAPI)

All routes are also available as REST endpoints via the OpenAPI adapter and documented at `/docs`.

| Namespace   | Highlights                                                                       |
| ----------- | -------------------------------------------------------------------------------- |
| `auth`      | register, login, Google OAuth, me, logout, forgot/reset password, delete account |
| `forms`     | CRUD, publish/unpublish, clone, archive, updateFields, themes, templates         |
| `public`    | exploreForms, getForm, unlockForm, submitForm                                    |
| `responses` | list (paginated), deleteOne, deleteAll                                           |
| `analytics` | dashboard stats, per-form stats + field breakdown, user profile stats            |
| `user`      | email preferences                                                                |
| `admin`     | platform stats, list/delete users & forms, set template flag                     |
| `health`    | health check                                                                     |

---

## Rate Limiting

| Endpoint                              | Limit                |
| ------------------------------------- | -------------------- |
| `POST /api/public/forms/:slug/submit` | 20 requests / 15 min |
| All other routes                      | 200 requests / min   |

---

## Database Schema

Managed with Drizzle ORM. Key tables:

- `users` — creators with role, Google ID, email preferences, soft-delete
- `sessions` — refresh token store
- `themes` — reusable visual theme definitions
- `forms` — form metadata, visibility, status, expiry, response limit, password hash
- `form_fields` — ordered fields with type, validation rules, and config (options, max, conditional logic)
- `form_responses` — submitted answers (JSONB), respondent email, IP, user agent

Run `pnpm db:generate` after schema changes, then `pnpm db:migrate` to apply.

---

## Environment Variables Reference

| Variable                       | App | Required | Description                            |
| ------------------------------ | --- | -------- | -------------------------------------- |
| `DATABASE_URL`                 | api | ✅       | PostgreSQL connection string           |
| `JWT_SECRET`                   | api | ✅       | Secret for access + refresh tokens     |
| `GOOGLE_OAUTH_CLIENT_ID`       | api | ❌       | Google OAuth app client ID             |
| `GOOGLE_OAUTH_CLIENT_SECRET`   | api | ❌       | Google OAuth app client secret         |
| `GOOGLE_OAUTH_REDIRECT_URI`    | api | ❌       | OAuth callback URL                     |
| `BREVO_API_KEY`                | api | ❌       | Brevo transactional email key          |
| `BREVO_SENDER_EMAIL`           | api | ❌       | From address for outgoing email        |
| `BASE_URL`                     | api | ✅       | Public URL of the API server           |
| `NEXT_PUBLIC_WEB_URL`          | api | ✅       | Public URL of the frontend             |
| `NEXT_PUBLIC_API_URL`          | web | ✅       | API base URL used by the frontend      |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | web | ❌       | Google OAuth client ID for the browser |

---

## Scripts

| Command (from root) | Description                              |
| ------------------- | ---------------------------------------- |
| `pnpm dev`          | Start all apps in development mode       |
| `pnpm build`        | Build all apps                           |
| `pnpm lint`         | Lint all packages                        |
| `pnpm check-types`  | Type-check all packages                  |
| `pnpm db:migrate`   | Run pending Drizzle migrations           |
| `pnpm db:generate`  | Generate new migration from schema diff  |
| `pnpm db:seed`      | Seed demo user, themes, forms, responses |
