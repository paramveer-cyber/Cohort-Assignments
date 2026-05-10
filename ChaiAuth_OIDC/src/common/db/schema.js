import { pgTable, varchar, text, timestamp, uuid, jsonb, boolean } from "drizzle-orm/pg-core";
import { Role } from "../constants/roles.js";

export const users = pgTable("users", {
    user_id: uuid("user_id").defaultRandom().primaryKey(),
    username: varchar("username", { length: 50 }).unique().notNull(),
    display_name: varchar("display_name", { length: 100 }),
    email: varchar("email", { length: 255 }).unique(),
    avatar_url: text("avatar_url"),
    bio: varchar("bio", { length: 280 }),
    organization: varchar("organization", { length: 100 }),
    password: text("password").notNull(),
    role: varchar("role", { length: 20 }).notNull().default(Role.USER),
    refresh_token: text("refresh_token"),
    created_at: timestamp("created_at").defaultNow(),
});

export const clients = pgTable("clients", {
    client_id: uuid("client_id").defaultRandom().primaryKey(),
    client_name: varchar("client_name", { length: 100 }).notNull(),
    client_secret: text("client_secret"),
    client_type: varchar("client_type", { length: 20 }).notNull(),
    client_redirect_uris: jsonb("client_redirect_uris").notNull(),
    allowed_scopes: text("allowed_scopes").notNull().default("openid profile email"),
    pkce_required: boolean("pkce_required").notNull().default(false),
    created_at: timestamp("created_at").defaultNow(),
});

export const authCodes = pgTable("auth_codes", {
    code: varchar("code", { length: 128 }).primaryKey(),
    client_id: uuid("client_id").notNull().references(() => clients.client_id),
    user_id: uuid("user_id").notNull().references(() => users.user_id),
    redirect_uri: text("redirect_uri").notNull(),
    scope: text("scope").notNull().default("openid"),
    nonce: text("nonce"),
    state: text("state"),
    code_challenge: text("code_challenge"),
    code_challenge_method: varchar("code_challenge_method", { length: 10 }),
    used: boolean("used").notNull().default(false),
    expires_at: timestamp("expires_at").notNull(),
    created_at: timestamp("created_at").defaultNow(),
});
