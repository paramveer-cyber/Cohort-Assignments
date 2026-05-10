import { createHmac, timingSafeEqual, randomUUID } from 'crypto';
import { db } from './redis.js';

const TTL = 24 * 60 * 60;

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

export function setCookie(res, name, value) {
  const parts = [
    `${name}=${sign(value)}`, 'HttpOnly', 'Path=/', `Max-Age=${TTL}`,
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

export async function createSession(user) {
  const id = randomUUID();
  await db.set(`sess:${id}`, JSON.stringify(user), 'EX', TTL);
  return id;
}

export async function getSession(id) {
  if (!id) return null;
  const raw = await db.get(`sess:${id}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function destroySession(id) {
  if (id) await db.del(`sess:${id}`);
}
