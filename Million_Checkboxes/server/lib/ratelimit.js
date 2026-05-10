import { db } from './redis.js';

export async function wsCheck(userId) {
  const key = `rl:${userId}:${Math.floor(Date.now() / 60000)}`;
  const n = await db.incr(key);
  if (n === 1) await db.expire(key, 120);
  return n <= 10;
}
