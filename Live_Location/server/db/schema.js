import { pgTable, bigserial, text, doublePrecision, timestamp } from 'drizzle-orm/pg-core';

export const locationHistory = pgTable('location_history', {
  id:         bigserial('id', { mode: 'number' }).primaryKey(),
  userId:     text('user_id').notNull(),
  username:   text('username').notNull(),
  lat:        doublePrecision('lat').notNull(),
  lng:        doublePrecision('lng').notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow(),
});