# Pokédex

A full-stack Pokédex app built with Next.js 15, featuring Pokémon browsing, a party builder, a "Who's That Pokémon?" quiz, and a complete authentication system. Built as a demonstration of core Next.js concepts including file-based routing, multiple rendering strategies, API routes, server actions, and database integration.

---

## Features

- Browse all Pokémon with pagination and type filtering
- View detailed stats, moves, evolution chains, and flavor text for every Pokémon
- Build a party of up to 6 Pokémon — adding costs XP based on their base stats
- Drag-and-drop party reordering
- "Who's That Pokémon?" silhouette quiz with XP rewards and penalties
- Full authentication: email/password registration & login, Google OAuth, JWT + refresh token rotation
- Share your team as a generated image card

---

## Tech Stack

| Layer         | Technology                                  |
| ------------- | ------------------------------------------- |
| Framework     | Next.js 16 (App Router)                     |
| Language      | TypeScript                                  |
| Database      | Neon (serverless Postgres)                  |
| ORM           | Drizzle ORM                                 |
| Auth          | JWT (access + refresh tokens), Google OAuth |
| Validation    | Zod                                         |
| Styling       | Tailwind CSS v4                             |
| External data | PokéAPI                                     |

---

## Project Structure

```
├── actions/          # Server Actions ('use server')
│   ├── auth.ts       # signIn, signUp
│   └── party.ts      # swapPartySlots, updateXP
├── app/
│   ├── layout.tsx    # Root layout — Navbar, Footer, AuthProvider
│   ├── page.tsx      # Home (SSR)
│   ├── explore/      # Paginated Pokémon browser (SSR)
│   ├── poke/[id]/    # Pokémon detail (SSG + ISR)
│   ├── my-team/      # Party builder (SSR)
│   ├── quiz/         # Silhouette quiz (CSR)
│   ├── (auth)/       # Route group — signin, signup, profile
│   └── api/          # API Routes
│       ├── auth/     # login, register, logout, refresh, me, google, delete-account
│       └── poke/     # party CRUD, XP
├── components/       # UI components, split by feature area
├── context/          # AuthContext (client-side session store)
├── db/               # Drizzle schema + db client
├── hooks/            # useParty, useSearch, useTypeFilter
└── lib/              # Services, queries, helpers
    ├── auth/
    └── poke/
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) Postgres database
- A Google Cloud project with an OAuth 2.0 client ID (for Google sign-in)

### Installation

```bash
git clone <repo-url>
cd pokedex
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable                       | Description                         |
| ------------------------------ | ----------------------------------- |
| `DATABASE_URL`                 | Neon connection string              |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID              |
| `JWT_SECRET`                   | Secret for signing access tokens    |
| `JWT_REFRESH_SECRET`           | Secret for signing refresh tokens   |
| `NEXT_PUBLIC_APP_URL`          | Your deployed URL (for share links) |

### Database Setup

```bash
# Push the schema to your Neon database
npm run db:push

# Or generate and run migrations
npm run db:gen
npm run db:mig
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
npm run start
```

---

## Next.js Concepts Demonstrated

### File-based Routing

Every page lives in `app/` and maps directly to a URL. Dynamic segments (`/poke/[id]`), route groups (`(auth)/`), and nested layouts are all used.

### Layouts

`app/layout.tsx` is the single root layout wrapping every page with the `Navbar`, `Footer`, `AuthProvider`, and `GoogleOAuthProvider`. This means auth state and navigation are available everywhere without repeating markup.

### Rendering Strategies

| Page         | Strategy  | Reason                                                                                                            |
| ------------ | --------- | ----------------------------------------------------------------------------------------------------------------- |
| `/`          | SSR       | Fetches the full Pokémon name list and suggested Pokémon per request                                              |
| `/explore`   | SSR       | Pagination is driven by `searchParams`, so each page number is server-rendered                                    |
| `/poke/[id]` | SSG + ISR | First 151 Pokémon are pre-built at build time; all others are generated on first visit and revalidated every hour |
| `/my-team`   | SSR       | Fetches the complete name list server-side to power client-side search                                            |
| `/quiz`      | CSR       | Entirely client-driven — random Pokémon selection and game state live in the browser                              |

**SSG with `generateStaticParams`** — `/poke/[id]/page.tsx` pre-builds pages for the original 151 Pokémon at build time:

```ts
export async function generateStaticParams() {
    const list = await fetchPokemonList(151, 0);
    return list.map((entry) => {
        const id = entry.url.split('/').filter(Boolean).pop()!;
        return { id };
    });
}
```

**ISR** — the same page revalidates every hour so any upstream data changes propagate without a full rebuild:

```ts
export const revalidate = 3600;
```

### API Routes

REST API built entirely with Next.js Route Handlers under `app/api/`. Every route returns a consistent `{ success: boolean, ...data }` shape, uses Zod for request validation, and delegates all business logic to a service layer.

**Auth routes**

| Method | Route                      | Description                                  |
| ------ | -------------------------- | -------------------------------------------- |
| POST   | `/api/auth/register`       | Create a new local account                   |
| POST   | `/api/auth/login`          | Sign in with email + password                |
| POST   | `/api/auth/logout`         | Invalidate the refresh token                 |
| POST   | `/api/auth/refresh`        | Rotate refresh token, issue new access token |
| GET    | `/api/auth/me`             | Return the current user                      |
| POST   | `/api/auth/google`         | Sign in or register via Google OAuth         |
| DELETE | `/api/auth/delete-account` | Permanently delete the account               |

**Party routes**

| Method | Route                     | Description                                 |
| ------ | ------------------------- | ------------------------------------------- |
| GET    | `/api/poke/party`         | Fetch the user's current party and XP total |
| POST   | `/api/poke/party/add`     | Add a Pokémon to the party (costs XP)       |
| DELETE | `/api/poke/party/remove`  | Remove a single Pokémon from the party      |
| DELETE | `/api/poke/party/empty`   | Clear the entire party                      |
| PATCH  | `/api/poke/party/reorder` | Move a slot to a new position               |
| POST   | `/api/poke/xp/add`        | Add or deduct XP (positive/negative delta)  |

### Server Actions

Server Actions handle mutations that originate from user interactions but don't need a full HTTP response — they run on the server, have direct database access, and return plain objects to the client.

**`actions/auth.ts`** — `signIn` and `signUp`

Used by the sign-in and sign-up forms. The action validates the submitted data with Zod, calls the same service functions used by the API routes, sets the httpOnly refresh-token cookie via Next.js's `cookies()` API, and returns `{ success, token, user }`. No `fetch` to an API route needed.

```ts
// In signin/page.tsx
const result = await signIn(form);
if (!result.success) {
    setError(result.message);
    return;
}
setSession(result.token, result.user);
```

**`actions/party.ts`** — `swapPartySlots` and `updateXP`

`swapPartySlots` handles drag-and-drop reordering of the party grid using a three-step order-ID swap to avoid unique-constraint violations.

`updateXP` is called by the quiz after every answer. The client already knows the result; it just needs to persist the delta. No HTTP status code or structured response body is needed — a Server Action returning `{ success, newXP }` is cleaner than a `fetch` with headers and JSON serialisation.

```ts
// In QuizClient.tsx
await updateXP(accessToken, delta);
dispatchXpToast(delta);
```

**API Routes vs Server Actions — the distinction in this project**

| Concern                           | API Route                                                                         | Server Action                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Party CRUD (add, remove, reorder) | ✓ — used by hooks that need HTTP status codes for error branching                 |                                                                                |
| Auth (Google OAuth)               | ✓ — OAuth flow returns a browser-side token; an API route is the natural receiver |                                                                                |
| Auth (email/password forms)       |                                                                                   | ✓ — form data maps directly to action arguments; cookie can be set server-side |
| XP persistence after quiz answer  |                                                                                   | ✓ — fire-and-forget delta with no HTTP semantics needed                        |
| Drag-and-drop slot swap           |                                                                                   | ✓ — UI event with direct DB write, no HTTP round-trip                          |

### Database Integration

Schema defined with Drizzle ORM in `db/schema.ts`. Two tables:

**`users`** — stores credentials, provider type, refresh token, and XP total. A `CHECK` constraint enforces `user_xp >= 0` at the database level.

**`user_party`** — stores up to 6 Pokémon slots per user with a `numeric` `order_id` (e.g. `1.000`). Database-level constraints:

- `CHECK` on `pokemon_id` (1–99999) and `order_id` (0–6)
- `UNIQUE (user_id, order_id)` — prevents two Pokémon in the same slot even under concurrent writes

The data layer is split into three levels for every domain:

```
party.queries.ts   ← raw Drizzle queries, no business logic
party.services.ts  ← business rules (party size, XP cost, error types)
API route / SA     ← HTTP or action boundary, input validation only
```

`PartyServiceError` carries a typed error code (`PARTY_FULL`, `INSUFFICIENT_XP`, etc.) so route handlers can map codes to HTTP status codes without inspecting error messages.

### Error Handling

- Zod validates every incoming request body before it reaches service logic
- `partyErrorResponse` maps `PartyServiceError` codes to appropriate HTTP status codes
- `mapServiceError` in `lib/auth/helpers.ts` maps auth service errors to user-facing messages
- `notFound()` is called on invalid Pokémon IDs so Next.js renders the 404 page
- All JSON parsing is wrapped in `.catch(() => null)` to handle malformed request bodies gracefully

---

## Available Scripts

| Script            | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start the development server                     |
| `npm run build`   | Build for production                             |
| `npm run start`   | Start the production server                      |
| `npm run lint`    | Run ESLint                                       |
| `npm run db:push` | Push the Drizzle schema directly to the database |
| `npm run db:gen`  | Generate migration files                         |
| `npm run db:mig`  | Run pending migrations                           |

---

## Data Source

Pokémon data is fetched from the public [PokéAPI](https://pokeapi.co) — no API key required.
