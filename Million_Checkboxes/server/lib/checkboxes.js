import { db } from './redis.js';

const KEY = 'cbx:bits';
const TOTAL = parseInt(process.env.TOTAL_CHECKBOXES || '1000000', 10);
const BYTE_LEN = Math.ceil(TOTAL / 8);

export { TOTAL };

export async function getState() {
  const buf = await db.getBuffer(KEY);
  if (!buf) return Buffer.alloc(BYTE_LEN);
  if (buf.length < BYTE_LEN) {
    const padded = Buffer.alloc(BYTE_LEN);
    buf.copy(padded);
    return padded;
  }
  return buf;
}

export async function toggle(index) {
  if (index < 0 || index >= TOTAL) throw new RangeError('out of bounds');
  const [cur] = await db.bitfield(KEY, 'GET', 'u1', index);
  const next = cur === 1 ? 0 : 1;
  await db.bitfield(KEY, 'SET', 'u1', index, next);
  return next;
}
