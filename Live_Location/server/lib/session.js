import { createHmac, timingSafeEqual, randomUUID } from 'crypto';

const TTL_MS  = 24 * 60 * 60 * 1000;
const store   = new Map(); // sid -> { user, expiresAt }

// ── cookie signing ────────────────────────────────────────────────
function sign(value) {
  const sig = createHmac('sha256', process.env.SESSION_SECRET)
    .update(value).digest('base64url');
  return `${value}.${sig}`;
}

function unsign(signed) {
  const dot = signed.lastIndexOf('.');
  if (dot === -1) return null;
  const value = signed.slice(0, dot);
  try {
    if (!timingSafeEqual(Buffer.from(signed), Buffer.from(sign(value)))) return null;
  } catch { return null; }
  return value;
}

// ── cookie helpers ────────────────────────────────────────────────
export function setCookie(res, name, value) {
  const maxAge = TTL_MS / 1000;
  const parts  = [
    `${name}=${sign(value)}`, 'HttpOnly', 'Path=/', `Max-Age=${maxAge}`,
    `SameSite=${process.env.NODE_ENV === 'production' ? 'None' : 'Lax'}`,
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
  ];
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearCookie(res, name) {
  res.setHeader('Set-Cookie', `${name}=; HttpOnly; Path=/; Max-Age=0`);
}

export function getCookieValue(cookieHeader, name) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k.trim() === name) return unsign(rest.join('=').trim());
  }
  return null;
}

// ── session store (in-memory) ─────────────────────────────────────
export function createSession(user) {
  const id = randomUUID();
  store.set(id, { user, expiresAt: Date.now() + TTL_MS });
  return id;
}

export function getSession(id) {
  if (!id) return null;
  const entry = store.get(id);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { store.delete(id); return null; }
  return entry.user;
}

export function destroySession(id) {
  if (id) store.delete(id);
}

// Sweep expired sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of store.entries()) {
    if (now > entry.expiresAt) store.delete(id);
  }
}, 60 * 60 * 1000);
