import { getCookieValue, getSession } from '../lib/session.js';
import { producer, TOPIC } from '../lib/kafka.js';
import { COOKIE_NAME } from '../routes/auth.js';

const STALE_MS = 40_000;
const liveUsers = new Map();

setInterval(() => {
  const cutoff = Date.now() - STALE_MS;
  for (const [userId, data] of liveUsers.entries()) {
    if (data.updatedAt < cutoff) liveUsers.delete(userId);
  }
}, 15_000);

function snapshot() {
  return [...liveUsers.entries()].map(([userId, data]) => ({ userId, ...data }));
}

export function initSockets(io, kafkaConsumer) {
  kafkaConsumer.run({
    eachMessage: async ({ message }) => {
      try {
        const event = JSON.parse(message.value.toString());
        const { userId, username, lat, lng, picture, updatedAt } = event;
        liveUsers.set(userId, { username, lat, lng, picture, updatedAt });
        io.emit('location:update', { userId, username, lat, lng, picture, updatedAt });
      } catch (err) {
        console.error('[sockets] kafka parse error', err.message);
      }
    },
  });

  io.on('connection', (socket) => {
    const sid  = getCookieValue(socket.handshake.headers.cookie, COOKIE_NAME);
    const user = getSession(sid);

    socket.data.user = user || null;
    socket.emit('location:snapshot', snapshot());

    socket.on('location:send', async (payload) => {
      if (!socket.data.user) {
        return socket.emit('error', { code: 'auth_required' });
      }

      const { lat, lng } = payload || {};
      if (typeof lat !== 'number' || typeof lng !== 'number') return;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;

      const event = {
        userId:   socket.data.user.sub,
        username: socket.data.user.username || socket.data.user.name,
        picture:  socket.data.user.picture || null,
        lat,
        lng,
        updatedAt: Date.now(),
      };

      try {
        await producer.send({
          topic:    TOPIC,
          messages: [{ key: socket.data.user.sub, value: JSON.stringify(event) }],
        });
      } catch (err) {
        console.error('[sockets] kafka publish error', err.message);
      }
    });

    socket.on('user:leave', () => {
      if (!socket.data.user) return;
      const userId = socket.data.user.sub;
      liveUsers.delete(userId);
      io.emit('user:left', { userId });
      socket.data.user = null;
    });

    socket.on('disconnect', () => {
      if (!socket.data.user) return;
      const userId = socket.data.user.sub;
      liveUsers.delete(userId);
      io.emit('user:left', { userId });
    });
  });
}