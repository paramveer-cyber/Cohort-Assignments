import Redis from 'ioredis';

const opts = { connectTimeout: 5000, maxRetriesPerRequest: 2 };

export const db = new Redis(process.env.REDIS_URL, opts);
export const sub = new Redis(process.env.REDIS_URL, opts);

db.on('error', (e) => console.error('[redis:db]', e.message));
sub.on('error', (e) => console.error('[redis:sub]', e.message));
