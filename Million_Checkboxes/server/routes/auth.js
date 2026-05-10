import { randomBytes } from 'crypto';
import { Router } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { db } from '../lib/redis.js';
import { setCookie, clearCookie, getCookieValue, createSession, getSession, destroySession } from '../lib/session.js';

export const COOKIE_NAME = 'cbx_sid';

const ISSUER = process.env.OIDC_ISSUER;
const CLIENT_ID = process.env.OIDC_CLIENT_ID;
const CLIENT_SECRET = process.env.OIDC_CLIENT_SECRET;

let JWKS;
function getJWKS() {
  if (!JWKS) JWKS = createRemoteJWKSet(new URL(`${ISSUER}/open-certs`));
  return JWKS;
}

export async function sessionMiddleware(req, res, next) {
  const sid = getCookieValue(req.headers.cookie, COOKIE_NAME);
  req.user = await getSession(sid);
  req.sessionId = sid;
  next();
}

export const router = Router();

router.get('/login', async (req, res) => {
  const state = randomBytes(16).toString('hex');
  const nonce = randomBytes(16).toString('hex');
  await db.set(`oidc:state:${state}`, nonce, 'EX', 300);

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

  const nonce = await db.get(`oidc:state:${state}`);
  if (!nonce) return res.redirect('/?auth_error=invalid_state');
  await db.del(`oidc:state:${state}`);

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

    const { payload } = await jwtVerify(tokens.id_token, getJWKS(), {
      issuer: ISSUER,
      audience: CLIENT_ID,
    });

    if (payload.nonce !== nonce) return res.redirect('/?auth_error=nonce_mismatch');

    const user = {
      sub: payload.sub,
      username: payload.preferred_username,
      name: payload.name || payload.preferred_username,
      email: payload.email || null,
      picture: payload.picture || null,
    };

    const sid = await createSession(user);
    setCookie(res, COOKIE_NAME, sid);
    res.redirect('/');
  } catch (err) {
    console.error('[auth] callback error', err);
    res.redirect('/?auth_error=server_error');
  }
});

router.post('/logout', async (req, res) => {
  await destroySession(req.sessionId);
  clearCookie(res, COOKIE_NAME);
  res.json({ ok: true });
});
