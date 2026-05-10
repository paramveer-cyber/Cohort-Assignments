# ChaiAuth — OAuth 2.1 / OIDC Authorization Server

ChaiAuth is a self-hosted authorization server implementing OAuth 2.1 and OpenID Connect (OIDC). It issues RS256-signed ID tokens and access tokens, supports PKCE for public clients, and exposes a standard discovery document so any OIDC-aware library can integrate with zero custom code.

---

## Table of Contents

1. [How it works](#1-how-it-works)
2. [Running the server](#2-running-the-server)
3. [Environment variables](#3-environment-variables)
4. [Database setup](#4-database-setup)
5. [Registering a client application](#5-registering-a-client-application)
6. [Integration guide](#6-integration-guide)
   - [Public client (SPA / mobile) with PKCE](#6a-public-client-spa--mobile-with-pkce)
   - [Confidential client (server-side app)](#6b-confidential-client-server-side-app)
   - [Using an OIDC library (recommended)](#6c-using-an-oidc-library-recommended)
7. [Endpoints reference](#7-endpoints-reference)
8. [Token reference](#8-token-reference)
9. [User profile fields](#9-user-profile-fields)
10. [Protecting your own API with ChaiAuth tokens](#10-protecting-your-own-api-with-chaiauth-tokens)
11. [Admin operations](#11-admin-operations)
12. [Security notes](#12-security-notes)

---

## 1. How it works

ChaiAuth follows the standard **Authorization Code flow**:

```
Your App                    ChaiAuth                      User
   |                            |                            |
   |-- redirect to /signin ---> |                            |
   |                            |---- show login page -----> |
   |                            |<--- username + password ---|
   |                            |                            |
   |<-- redirect ?code=xxx ---- |                            |
   |                            |                            |
   |-- POST /token (code) ----> |                            |
   |<-- access_token, id_token--|                            |
```

- The authorization endpoint (`/signin`) shows ChaiAuth's hosted login UI.
- After a user logs in, ChaiAuth redirects back to your app with a short-lived **authorization code**.
- Your app exchanges that code at `/token` for an **access token** and an **ID token**.
- The ID token is a signed JWT containing the user's identity claims.
- The access token is used to call protected APIs.

---

## 2. Running the server

**Prerequisites:** Node.js 18+, PostgreSQL database.

```bash
# Install dependencies
npm install

# Generate RSA key pair (one-time setup)
# Place private-key.pem and public-key.pub in ./cert/

# Push schema to database
npx drizzle-kit push

# Start
node index.js
```

The server starts on `PORT` (default `8080`).

**Health check:**
```
GET /health  →  200 OK
```

---

## 3. Environment variables

Create a `.env` file at the project root:

```env
# Server
PORT=8080
NODE_ENV=production          # set to production for secure cookies
ISSUER=https://auth.yourdomain.com   # must match your public URL exactly
CORS_ORIGIN=https://yourapp.com      # your frontend origin

# Database
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=verify-full

# JWT secrets — use long, random strings (openssl rand -hex 64)
JWT_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<different-random-64-char-string>

# Optional token expiry overrides
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

> **Important:** `ISSUER` must be the exact URL clients will discover the server at. It is embedded in ID tokens as the `iss` claim and validated by every OIDC client library.

---

## 4. Database setup

ChaiAuth uses **Drizzle ORM** with PostgreSQL. Run migrations before first start:

```bash
npx drizzle-kit push
```

If upgrading an existing deployment with the new profile fields, run:

```sql
-- migrations/0002_user_profile_fields.sql
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS display_name  VARCHAR(100),
    ADD COLUMN IF NOT EXISTS email         VARCHAR(255) UNIQUE,
    ADD COLUMN IF NOT EXISTS avatar_url    TEXT,
    ADD COLUMN IF NOT EXISTS bio           VARCHAR(280),
    ADD COLUMN IF NOT EXISTS organization  VARCHAR(100);
```

---

## 5. Registering a client application

Every app that wants to use ChaiAuth must be registered first. This creates a `client_id` (and optionally a `client_secret`) that your app uses to identify itself.

You need an **admin access token** to call these endpoints (see [Admin operations](#11-admin-operations)).

### Register a public client (SPA, mobile, CLI)

Public clients cannot securely store a secret. They must use **PKCE**.

```http
POST /clients
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "client_name": "My React App",
  "client_type": "public",
  "redirect_uris": ["https://myapp.com/callback"],
  "allowed_scopes": "openid profile email",
  "pkce_required": true
}
```

Response:
```json
{
  "success": true,
  "data": {
    "client_id": "550e8400-e29b-41d4-a716-446655440000",
    "client_name": "My React App",
    "client_type": "public",
    "pkce_required": true,
    ...
  }
}
```

Save `client_id`. You will not receive a `client_secret` — public clients don't have one.

### Register a confidential client (server-side app)

Server-side apps can store a secret securely.

```http
POST /clients
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "client_name": "My Next.js Backend",
  "client_type": "confidential",
  "redirect_uris": ["https://myapp.com/api/auth/callback"],
  "allowed_scopes": "openid profile email",
  "client_secret": "my-very-long-secret-at-least-16-chars"
}
```

Save both `client_id` and your `client_secret`. The secret is stored hashed and cannot be retrieved later.

---

## 6. Integration guide

### 6a. Public client (SPA / mobile) with PKCE

PKCE (Proof Key for Code Exchange) prevents authorization code interception. It is **required** for all public clients.

**Step 1 — Generate PKCE pair**

```javascript
// Generate a cryptographically random code_verifier
function generateCodeVerifier() {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Derive code_challenge = BASE64URL(SHA256(verifier))
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

const codeVerifier  = generateCodeVerifier();
const codeChallenge = await generateCodeChallenge(codeVerifier);

// Persist verifier — you'll need it when the redirect comes back
sessionStorage.setItem('pkce_verifier', codeVerifier);
```

**Step 2 — Redirect user to ChaiAuth**

```javascript
const params = new URLSearchParams({
  clientId:              'YOUR_CLIENT_ID',
  redirect_uri:          'https://myapp.com/callback',
  scope:                 'openid profile email',
  state:                 crypto.randomUUID(),   // store this to verify later
  nonce:                 crypto.randomUUID(),
  code_challenge:        codeChallenge,
  code_challenge_method: 'S256',
});

window.location.href = `https://auth.yourdomain.com/signin?${params}`;
```

**Step 3 — Handle the callback**

After login, ChaiAuth redirects to your `redirect_uri`:
```
https://myapp.com/callback?code=abc123&state=xyz
```

```javascript
// In your /callback route or page:
const urlParams  = new URLSearchParams(window.location.search);
const code       = urlParams.get('code');
const state      = urlParams.get('state');
const verifier   = sessionStorage.getItem('pkce_verifier');

// Verify state matches what you sent (CSRF protection)
// if (state !== sessionStorage.getItem('oauth_state')) throw ...
```

**Step 4 — Exchange code for tokens**

```javascript
const response = await fetch('https://auth.yourdomain.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type:    'authorization_code',
    code:          code,
    redirect_uri:  'https://myapp.com/callback',
    client_id:     'YOUR_CLIENT_ID',
    code_verifier: verifier,         // PKCE — no secret needed
  }),
});

const { access_token, id_token, expires_in, scope } = await response.json();
```

**Step 5 — Read user identity from ID token**

```javascript
// Decode the ID token (verify signature in production — see below)
const [, payload] = id_token.split('.');
const user = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

console.log(user.sub);                // user UUID
console.log(user.preferred_username); // username
console.log(user.name);               // display name (if set)
console.log(user.email);              // email (if set)
console.log(user.picture);            // avatar URL (if set)
```

> **Production:** Always verify the ID token signature using the JWKS endpoint. Use a library like `jose` — see [Section 6c](#6c-using-an-oidc-library-recommended).

---

### 6b. Confidential client (server-side app)

For server-side apps (Next.js API routes, Express, Django, etc.) the flow is identical but you send your `client_secret` instead of a PKCE verifier. PKCE is optional but still recommended.

**Redirect user to ChaiAuth** (no PKCE fields needed, but you can add them):

```javascript
// server-side — Node.js example
const params = new URLSearchParams({
  clientId:     'YOUR_CLIENT_ID',
  redirect_uri: 'https://myapp.com/api/auth/callback',
  scope:        'openid profile email',
  state:        randomState,   // store in session
  nonce:        randomNonce,
});

res.redirect(`https://auth.yourdomain.com/signin?${params}`);
```

**Exchange code for tokens** (server-side, never expose the secret to the browser):

```javascript
const response = await fetch('https://auth.yourdomain.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type:    'authorization_code',
    code:          req.query.code,
    redirect_uri:  'https://myapp.com/api/auth/callback',
    client_id:     'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
  }),
});

const tokens = await response.json();
```

---

### 6c. Using an OIDC library (recommended)

Because ChaiAuth exposes a standard discovery document, any OIDC-compliant library works out of the box. This is the easiest integration path — the library handles PKCE, state, nonce, token validation, and refresh automatically.

**Discovery URL:** `https://auth.yourdomain.com/.well-known/openid-configuration`

#### Next.js — NextAuth.js / Auth.js

```javascript
// auth.js (or pages/api/auth/[...nextauth].js)
import NextAuth from 'next-auth';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id:            'chaiauth',
      name:          'ChaiAuth',
      type:          'oidc',
      issuer:        'https://auth.yourdomain.com',
      clientId:      process.env.CHAIAUTH_CLIENT_ID,
      clientSecret:  process.env.CHAIAUTH_CLIENT_SECRET,  // omit for public client
    },
  ],
});
```

#### React SPA — oidc-client-ts

```bash
npm install oidc-client-ts
```

```javascript
import { UserManager } from 'oidc-client-ts';

const userManager = new UserManager({
  authority:              'https://auth.yourdomain.com',
  client_id:              'YOUR_CLIENT_ID',
  redirect_uri:           'https://myapp.com/callback',
  scope:                  'openid profile email',
  response_type:          'code',
  // PKCE is enabled by default in oidc-client-ts
});

// Trigger login
await userManager.signinRedirect();

// Handle callback
const user = await userManager.signinRedirectCallback();
console.log(user.profile);   // { sub, name, email, preferred_username, ... }
```

#### Python — Authlib

```python
from authlib.integrations.flask_client import OAuth

oauth = OAuth(app)
oauth.register(
    name='chaiauth',
    server_metadata_url='https://auth.yourdomain.com/.well-known/openid-configuration',
    client_id=os.environ['CHAIAUTH_CLIENT_ID'],
    client_secret=os.environ['CHAIAUTH_CLIENT_SECRET'],
    client_kwargs={'scope': 'openid profile email'},
)

@app.route('/login')
def login():
    redirect_uri = url_for('callback', _external=True)
    return oauth.chaiauth.authorize_redirect(redirect_uri)

@app.route('/callback')
def callback():
    token = oauth.chaiauth.authorize_access_token()
    user  = token['userinfo']
    return f"Hello {user['preferred_username']}"
```

#### Go — coreos/go-oidc

```go
provider, err := oidc.NewProvider(ctx, "https://auth.yourdomain.com")

config := oauth2.Config{
    ClientID:     os.Getenv("CHAIAUTH_CLIENT_ID"),
    ClientSecret: os.Getenv("CHAIAUTH_CLIENT_SECRET"),
    Endpoint:     provider.Endpoint(),
    RedirectURL:  "https://myapp.com/callback",
    Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
}

// Redirect
http.Redirect(w, r, config.AuthCodeURL(state), http.StatusFound)

// Callback
oauth2Token, _ := config.Exchange(ctx, r.URL.Query().Get("code"))
idToken, _     := provider.Verifier(&oidc.Config{ClientID: clientID}).Verify(ctx, rawIDToken)

var claims struct {
    Sub               string `json:"sub"`
    PreferredUsername string `json:"preferred_username"`
    Email             string `json:"email"`
}
idToken.Claims(&claims)
```

---

## 7. Endpoints reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/.well-known/openid-configuration` | None | OIDC discovery document |
| `GET`  | `/open-certs` | None | JWKS — public keys for ID token verification |
| `GET`  | `/signin` | None | Hosted login UI (redirect users here) |
| `POST` | `/signin` | None | Login form submission (called by the login UI) |
| `POST` | `/token` | Client credentials | Exchange authorization code for tokens |
| `POST` | `/auth/signup` | None | Direct user registration (no OIDC flow) |
| `POST` | `/auth/login` | None | Direct login, returns access + refresh tokens |
| `POST` | `/auth/refresh` | Refresh cookie | Rotate refresh token |
| `POST` | `/auth/logout` | Refresh cookie | Revoke session |
| `POST` | `/clients` | Admin Bearer | Register new client |
| `GET`  | `/clients` | Admin Bearer | List all clients |
| `GET`  | `/clients/:id` | Admin Bearer | Get client by ID |
| `GET`  | `/health` | None | Health check |

### `GET /signin` — Authorization endpoint

Query parameters:

| Parameter | Required | Description |
|-----------|----------|-------------|
| `clientId` | Yes | Your `client_id` |
| `redirect_uri` | Yes | Must match a registered URI exactly |
| `scope` | Yes | Space-separated. Must include `openid`. Also: `profile`, `email` |
| `state` | Recommended | Random value. Returned unchanged on redirect. Use for CSRF protection |
| `nonce` | Recommended | Random value. Embedded in ID token. Prevents replay |
| `code_challenge` | PKCE | BASE64URL(SHA256(code_verifier)) |
| `code_challenge_method` | PKCE | Must be `S256` |

### `POST /token` — Token endpoint

Body (JSON):

| Field | Required | Description |
|-------|----------|-------------|
| `grant_type` | Yes | Must be `authorization_code` |
| `code` | Yes | The code received from the callback |
| `redirect_uri` | Yes | Must match exactly what was used in `/signin` |
| `client_id` | Yes | Your client ID |
| `client_secret` | Confidential clients | Your client secret |
| `code_verifier` | Public clients (PKCE) | The original code verifier |

Response:
```json
{
  "access_token": "eyJ...",
  "id_token":     "eyJ...",
  "token_type":   "Bearer",
  "expires_in":   900,
  "scope":        "openid profile email"
}
```

---

## 8. Token reference

### ID token claims

| Claim | Scope | Description |
|-------|-------|-------------|
| `sub` | `openid` | User UUID — stable, use as primary identifier |
| `iss` | `openid` | Issuer URL |
| `aud` | `openid` | Your `client_id` |
| `iat` | `openid` | Issued-at timestamp |
| `exp` | `openid` | Expiry timestamp (1 hour) |
| `nonce` | `openid` | Echo of the nonce you sent (if any) |
| `preferred_username` | `profile` | Username |
| `name` | `profile` | Display name (if set) |
| `picture` | `profile` | Avatar URL (if set) |
| `organization` | `profile` | Organization / school (if set) |
| `email` | `email` | Email address (if set) |

### Token lifetimes

| Token | Lifetime | Notes |
|-------|----------|-------|
| OIDC access token | 15 minutes | Verify with RS256 public key |
| OIDC ID token | 1 hour | Contains identity claims |
| Internal access token | 15 minutes | HS256, for `/auth/*` routes only |
| Refresh token | 7 days | httpOnly cookie, rotated on each use |

### Verifying the ID token signature

Never trust an ID token without verifying its signature. Use the JWKS endpoint:

```javascript
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(
  new URL('https://auth.yourdomain.com/open-certs')
);

const { payload } = await jwtVerify(idToken, JWKS, {
  issuer:   'https://auth.yourdomain.com',
  audience: 'YOUR_CLIENT_ID',
});

console.log(payload.sub);   // user UUID
console.log(payload.email); // user email
```

---

## 9. User profile fields

When users create an account, ChaiAuth accepts these fields:

| Field | Required | Max length | Notes |
|-------|----------|------------|-------|
| `username` | Yes | 50 | Letters, numbers, `_`, `.`, `-` only |
| `password` | Yes | 255 | Min 8 chars, must include upper, lower, digit |
| `display_name` | No | 100 | Human-facing name, shown in `name` claim |
| `email` | No | 255 | Must be unique across all users |
| `avatar_url` | No | 2048 | URL only, no file uploads |
| `bio` | No | 280 | Short bio |
| `organization` | No | 100 | Company, school, or team |

All optional fields default to `null` and are omitted from tokens if not set.

---

## 10. Protecting your own API with ChaiAuth tokens

If you have a backend API and want to verify that incoming requests are authenticated via ChaiAuth, validate the Bearer token:

```javascript
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(
  new URL('https://auth.yourdomain.com/open-certs')
);

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });

  try {
    const { payload } = await jwtVerify(header.slice(7), JWKS, {
      issuer: 'https://auth.yourdomain.com',
    });
    req.user = payload;  // { sub, scope, role, client_id, ... }
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

You can also check `scope` to gate specific resources:

```javascript
function requireScope(scope) {
  return (req, res, next) => {
    const scopes = (req.user?.scope || '').split(' ');
    if (!scopes.includes(scope)) return res.status(403).json({ error: 'Insufficient scope' });
    next();
  };
}

app.get('/profile', authenticate, requireScope('profile'), (req, res) => {
  res.json({ userId: req.user.sub });
});
```

---

## 11. Admin operations

Some endpoints (client registration, listing clients) require an admin token. To create an admin user:

1. Register a user normally via `POST /auth/signup`.
2. Manually update their role in the database:
   ```sql
   UPDATE users SET role = 'admin' WHERE username = 'youradmin';
   ```
3. Log in via `POST /auth/login` to get an access token with `role: admin`.
4. Use that token as `Authorization: Bearer <token>` for `/clients` endpoints.

---

## 12. Security notes

**Use HTTPS in production.** Cookies are marked `Secure` when `NODE_ENV=production`. Never run ChaiAuth over plain HTTP with real users.

**Rotate your JWT secrets.** If `JWT_SECRET` or `JWT_REFRESH_SECRET` is compromised, all active sessions must be considered compromised. Rotate by updating the env variable and restarting — existing tokens will be immediately rejected.

**RSA key pair.** The `cert/` directory holds the private key used to sign OIDC tokens. Back it up securely. If it changes, all previously issued ID tokens will fail verification.

**Refresh token rotation.** ChaiAuth implements refresh token rotation with reuse detection. If a previously used refresh token is presented again, the entire session is immediately revoked (all refresh tokens for that user are invalidated).

**state and nonce.** Always validate `state` in your callback to prevent CSRF. Always validate `nonce` in the ID token to prevent replay attacks. OIDC libraries handle this automatically.

**redirect_uri exact match.** ChaiAuth rejects any `redirect_uri` not registered for the client, including minor variations (trailing slashes, query strings). Register every URI you use exactly.

**PKCE for all public clients.** Never build a public client (SPA, mobile) without PKCE. ChaiAuth enforces this when `pkce_required: true` is set on the client record.
