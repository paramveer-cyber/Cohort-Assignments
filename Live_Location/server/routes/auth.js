import { randomBytes } from 'crypto';
import { Router } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import {
  setCookie, clearCookie, getCookieValue,
  createSession, getSession, destroySession,
} from '../lib/session.js';

export const COOKIE_NAME = 'lt_sid';

const ISSUER = process.env.OIDC_ISSUER;
const CLIENT_ID = process.env.OIDC_CLIENT_ID;
const CLIENT_SECRET = process.env.OIDC_CLIENT_SECRET;

const pending = new Map();
setTimeout(() => {
  setInterval(() => {
    const cutoff = Date.now() - 5 * 60 * 1000;
    for (const [k, v] of pending.entries()) {
      if (v.ts < cutoff) pending.delete(k);
    }
  }, 10 * 60 * 1000);
}, 0);

let JWKS;
async function getJWKS() {
  if (JWKS) return JWKS;
  const discovery = await fetch(`${ISSUER}/.well-known/openid-configuration`);
  const config = await discovery.json();
  JWKS = createRemoteJWKSet(new URL(config.jwks_uri));
  return JWKS;
}

export async function sessionMiddleware(req, res, next) {
  const sid = getCookieValue(req.headers.cookie, COOKIE_NAME);
  req.user = getSession(sid);
  req.sessionId = sid;
  next();
}

export const router = Router();

router.get('/login', (req, res) => {
  const state = randomBytes(16).toString('hex');
  const nonce = randomBytes(16).toString('hex');
  pending.set(state, { nonce, ts: Date.now() });

  const params = new URLSearchParams({
    clientId: CLIENT_ID,
    redirect_uri: `${process.env.APP_URL}/auth/callback`,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    nonce,
  });
  res.redirect(`${ISSUER}/signin?${params}`);
});

router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  if (error || !code || !state) return res.redirect('/?auth_error=1');

  const entry = pending.get(state);
  if (!entry) return res.redirect('/?auth_error=invalid_state');
  pending.delete(state);

  try {
    const tokenRes = await fetch(`${ISSUER}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.APP_URL}/auth/callback`,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('[auth] token exchange failed', tokens);
      return res.redirect('/?auth_error=token_failed');
    }

    const { payload } = await jwtVerify(tokens.id_token, await getJWKS(), {
      issuer: ISSUER,
      audience: CLIENT_ID,
    });

    if (payload.nonce !== entry.nonce) return res.redirect('/?auth_error=nonce_mismatch');

    const user = {
      sub: payload.sub,
      username: payload.preferred_username,
      name: payload.name || payload.preferred_username,
      email: payload.email || null,
      picture: payload.picture || null,
    };

    const sid = createSession(user);
    setCookie(res, COOKIE_NAME, sid);
    res.redirect('/');
  } catch (err) {
    console.error('[auth] callback error', err);
    res.redirect('/?auth_error=server_error');
  }
});

router.post('/logout', (req, res) => {
  destroySession(req.sessionId);
  clearCookie(res, COOKIE_NAME);
  res.json({ ok: true });
});