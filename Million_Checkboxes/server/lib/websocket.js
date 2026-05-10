import { randomUUID } from 'crypto';
import { db, sub } from './redis.js';
import { getState, toggle, TOTAL } from './checkboxes.js';
import { wsCheck } from './ratelimit.js';
import { getCookieValue, getSession } from './session.js';
import { COOKIE_NAME } from '../routes/auth.js';

const CHANNEL = 'cbx:updates';
const clients = new Map(); 

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  for (const { ws } of clients.values()) {
    if (ws.readyState === 1) ws.send(msg);
  }
}

function uniqueUserCount() {
  const subs = new Set();
  for (const { user } of clients.values()) {
    subs.add(user ? user.sub : '__anon__');
  }
  return subs.size;
}

function broadcastCount() {
  broadcast({ type: 'users', count: uniqueUserCount() });
}

async function resolveUser(req) {
  const sid = getCookieValue(req.headers.cookie, COOKIE_NAME);
  return getSession(sid);
}

export function initWebSocket(wss) {
  sub.subscribe(CHANNEL, (err) => {
    if (err) console.error('[ws] subscribe error', err);
  });

  sub.on('message', (_ch, raw) => {
    try {
      const msg = JSON.parse(raw);
      broadcast({ type: 'update', index: msg.index, value: msg.value });
    } catch { }
  });

  wss.on('connection', async (ws, req) => {
    const id = randomUUID();
    const user = await resolveUser(req);
    clients.set(id, { ws, user });

    try {
      const buf = await getState();
      ws.send(JSON.stringify({ type: 'state', data: buf.toString('base64') }));
      ws.send(JSON.stringify({ type: 'users', count: uniqueUserCount() }));
    } catch (err) {
      console.error('[ws] state error', err);
    }

    broadcastCount();

    ws.on('message', async (raw) => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }

      if (msg.type === 'ping') {
        return ws.send(JSON.stringify({ type: 'pong', ts: msg.ts }));
      }

      if (msg.type === 'toggle') {
        if (!user) {
          return ws.send(JSON.stringify({ type: 'error', code: 'auth_required' }));
        }
        const allowed = await wsCheck(user.sub);
        if (!allowed) {
          return ws.send(JSON.stringify({ type: 'error', code: 'rate_limited' }));
        }
        const index = parseInt(msg.index, 10);
        if (!Number.isFinite(index) || index < 0 || index >= TOTAL) return;
        try {
          const value = await toggle(index);
          await db.publish(CHANNEL, JSON.stringify({ index, value }));
        } catch (err) {
          console.error('[ws] toggle error', err);
        }
      }
    });

    ws.on('close', () => { clients.delete(id); broadcastCount(); });
    ws.on('error', () => { clients.delete(id); broadcastCount(); });
  });
}