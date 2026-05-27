import { pgTable, uuid, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const themesTable = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  primaryColor: varchar("primary_color", { length: 20 }).default("#000000"),
  backgroundColor: varchar("background_color", { length: 20 }).default("#ffffff"),
  textColor: varchar("text_color", { length: 20 }).default("#000000"),
  fontFamily: varchar("font_family", { length: 100 }).default("sans-serif"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectTheme = typeof themesTable.$inferSelect;
export type InsertTheme = typeof themesTable.$inferInsert;
