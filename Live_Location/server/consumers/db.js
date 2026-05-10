import 'dotenv/config';
import { db } from '../db/index.js';
import { locationHistory } from '../db/schema.js';
import { createConsumer, TOPIC } from '../lib/kafka.js';

const FLUSH_MS = 5000;
const batch    = [];

async function flush() {
  if (batch.length === 0) return;
  const rows = batch.splice(0);
  try {
    await db.insert(locationHistory).values(
      rows.map(r => ({ userId: r.userId, username: r.username, lat: r.lat, lng: r.lng }))
    );
    console.log(`[db:consumer] flushed ${rows.length} events`);
  } catch (err) {
    console.error('[db:consumer] flush error', err.message);
  }
}

setInterval(flush, FLUSH_MS);

async function start() {
  const consumer = createConsumer('livetrack-db-writer');
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      try { batch.push(JSON.parse(message.value.toString())); } catch {}
    },
  });
  console.log('[db:consumer] running — flushing every', FLUSH_MS / 1000, 's');
}

start().catch((err) => { console.error('[db:consumer] fatal', err); process.exit(1); });