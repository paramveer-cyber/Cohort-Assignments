import { pgTable, varchar, integer, text, timestamp, boolean, uuid, serial } from "drizzle-orm/pg-core";

export const seats = pgTable("seats", {
    id: uuid("id").defaultRandom().primaryKey(),
    seat_no: serial("seat_no"),
    name: varchar("name", { length: 255 }),
    is_booked: integer("isbooked").default(0),
    booked_by: uuid("booked_by").references(() => users.user_id),
});

export const users = pgTable("users", {
    user_id: uuid("user_id").defaultRandom().primaryKey(),
    username: varchar("username", { length: 155 }).unique().notNull(),
    password: text("password").notNull(),
    refresh_token: text("refresh_token"),
    created_at: timestamp("created_at").defaultNow(),
});