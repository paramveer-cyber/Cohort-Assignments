import { pgTable, uuid, varchar, timestamp, boolean, text, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  username: varchar("username", { length: 50 }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  salt: text("salt").default(""),
  passwordHash: text("password_hash"),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").default("user"),
  emailVerified: boolean("email_verified").default(false),
  googleId: text("google_id").unique(),
  lastLoginAt: timestamp("last_login_at"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpiresAt: timestamp("password_reset_expires_at"),
  deletedAt: timestamp("deleted_at"),
  deletionToken: text("deletion_token"),
  deletionScheduledAt: timestamp("deletion_scheduled_at"),
  emailPreferences: jsonb("email_preferences").$type<Record<string, boolean>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
