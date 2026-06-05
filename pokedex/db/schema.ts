import { sql } from "drizzle-orm";
import { 
    text, 
    pgTable, 
    uuid, 
    varchar, 
    pgEnum, 
    timestamp, 
    integer, 
    check,
    unique,
    numeric
} from "drizzle-orm/pg-core";

export const provider = pgEnum("provider", ["local", "google"])

export const users = pgTable("users", {
    id: uuid("user_id").defaultRandom().primaryKey(),
    username: varchar({length: 256}).notNull(),
    email: varchar({length: 322}).notNull(),
    salt: text(),
    password: text(),
    refreshToken: text("refresh_token"),
    provider: provider("provider").default("local").notNull(),
    userXP: integer("user_xp").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
        check("user_xp", sql`${table.userXP} >= 0`)
    ]
);

export const user_party = pgTable("user_party", {
    id: uuid("party_id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
            .notNull()
            .references(
                ()=>users.id, 
                {
                    onDelete: 'cascade',
                     onUpdate: "no action"
                }
            ),
    pokeId: integer("pokemon_id").notNull(),
    orderId: numeric("order_id", {
        precision: 4,
        scale: 3
    }).notNull()
},
    (table)=>[
        check("pokemon_id", sql`${table.pokeId} >= 0 AND ${table.pokeId} <= 99999`),
        check("order_id", sql`${table.orderId} >= 0 AND ${table.orderId} <= 6`),
        unique("user_slot_unique").on(table.userId, table.orderId),
    ]
);