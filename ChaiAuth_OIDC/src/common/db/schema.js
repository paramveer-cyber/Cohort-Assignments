import { pgTable, varchar, text, timestamp, uuid, jsonb, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    user_id: uuid("user_id").defaultRandom().primaryKey(),
    username: varchar("username", { length: 155 }).unique().notNull(),
    password: text("password").notNull(),
    refresh_token: text("refresh_token"),
    created_at: timestamp("created_at").defaultNow(),
});

export const clients = pgTable("clients", {
    client_id: uuid("client_id").defaultRandom().primaryKey(),
    client_name: varchar("client_name", { length: 100 }).notNull(),
    client_secret: text(),
    client_type: varchar("client_type", { length: 20 }).notNull(),
    client_redirect_uris: jsonb().notNull(),
    created_at: timestamp("created_at").defaultNow()
});

export const authCodes = pgTable("auth_codes", {
    code: varchar("code", { length: 128 }).primaryKey(),
    client_id: uuid("client_id").notNull().references(() => clients.client_id),
    user_id: uuid("user_id").notNull().references(() => users.user_id),
    redirect_uri: text("redirect_uri").notNull(),
    scope: text("scope").notNull().default("openid"),
    nonce: text("nonce"),
    state: text("state"),
    used: boolean("used").notNull().default(false),
    expires_at: timestamp("expires_at").notNull(),
    created_at: timestamp("created_at").defaultNow()
});