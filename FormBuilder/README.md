# FormCraft

A production-style form builder SaaS built with Turborepo, tRPC, Zod, Drizzle ORM, and Next.js.

---

## Demo Credentials

```
Email:    demo@formcraft.app
Password: Demo1234!
```

## Live Demo

- **Frontend**: https://formcraft.vercel.app  
- **API**: https://formcraft-api.onrender.com  
- **API Docs**: https://formcraft-api.onrender.com/docs

---

## Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo |
| Frontend | Next.js 16, React 19 |
| Backend | Express + tRPC |
| Database | PostgreSQL (Neon) via Drizzle ORM |
| Validation | Zod (everywhere) |
| Auth | JWT + Google OAuth |
| Email | Brevo |
| API Docs | Scalar (OpenAPI) |
| Rate Limiting | express-rate-limit |

---

## Project Structure

```
formbuilder/
├── apps/
│   ├── api/          # Express + tRPC backend
│   └── web/          # Next.js frontend
└── packages/
    ├── database/     # Drizzle schema, migrations, seed
    ├── trpc/         # tRPC router, context, all routes
    ├── services/     # auth, forms, analytics, email
    └── logger/
```

---

## Local Setup

### 1. Install

```bash
pnpm install
```

### 2. Env

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Required vars:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `JWT_SECRET` — any 32+ char secret

Optional:
- `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` — for Google login
- `BREVO_API_KEY` / `BREVO_SENDER_EMAIL` — for email notifications

### 3. Database

```bash
pnpm --filter @repo/database db:generate
pnpm --filter @repo/database db:migrate
pnpm --filter @repo/database db:seed
```

### 4. Dev

```bash
pnpm dev
```

- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## API Endpoints

Full interactive docs at `/docs` (Scalar).

### Auth
| Method | Path | Description |
|---|---|---|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login → JWT |
| POST | /api/auth/google | Google OAuth |
| GET | /api/auth/me | Current user |

### Forms (auth required)
| Method | Path | Description |
|---|---|---|
| POST | /api/forms | Create form |
| GET | /api/forms | List my forms |
| GET | /api/forms/{formId} | Get form + fields |
| PATCH | /api/forms/{formId} | Update settings |
| PUT | /api/forms/{formId}/fields | Replace fields |
| POST | /api/forms/{formId}/publish | Publish |
| POST | /api/forms/{formId}/unpublish | Unpublish |
| DELETE | /api/forms/{formId} | Delete |

### Public (no auth)
| Method | Path | Description |
|---|---|---|
| GET | /api/public/explore | Browse public forms |
| GET | /api/public/forms/{slug} | Get form to fill |
| POST | /api/public/forms/{slug}/submit | Submit response |

Rate limit: 20 submits / 15 min / IP

### Analytics (auth required)
| Method | Path | Description |
|---|---|---|
| GET | /api/analytics/dashboard | Overview stats |
| GET | /api/analytics/forms/{formId} | Form analytics |
| GET | /api/analytics/forms/{formId}/responses | All responses |

---

## Form Visibility

| Status | Visibility | Accessible | Explore page |
|---|---|---|---|
| draft | — | No | No |
| published | public | Yes | Yes |
| published | unlisted | Yes (link only) | No |
| archived | — | No | No |

---

## Deployment

### Render (API)
1. New Web Service, root `apps/api`
2. Build: `pnpm install && pnpm build --filter @repo/api`
3. Start: `node apps/api/dist/index.js`

### Railway (API)
1. New service, root `apps/api`
2. Same build/start commands above

### Vercel (Frontend)
1. Import repo, root directory `apps/web`
2. Set `NEXT_PUBLIC_API_URL` to your API URL

---

## Seeded Demo Data

| Form | Visibility | Responses |
|---|---|---|
| Anime Personality Quiz | Public | 5 |
| Startup Market Fit Survey | Public | 6 |
| Developer Experience Survey | Unlisted | 3 |

Login as `demo@formcraft.app` / `Demo1234!` to explore.
