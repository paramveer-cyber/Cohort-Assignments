import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { themesTable } from "./theme";

export const formStatusEnum = pgEnum("form_status", ["draft", "published", "archived"]);
export const formVisibilityEnum = pgEnum("form_visibility", ["public", "unlisted"]);
export const fieldTypeEnum = pgEnum("field_type", [
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
  "dropdown",
  "rating",
  "date",
  "page_break",
]);

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  description: text("description"),
  status: formStatusEnum("status").default("draft").notNull(),
  visibility: formVisibilityEnum("visibility"),
  themeId: uuid("theme_id").references(() => themesTable.id),
  coverImageUrl: text("cover_image_url"),
  successMessage: text("success_message"),
  closedMessage: text("closed_message"),
  allowMultipleSubmissions: boolean("allow_multiple_submissions").default(true),
  collectEmail: boolean("collect_email").default(false),
  requiresLogin: boolean("requires_login").default(false),
  isTemplate: boolean("is_template").default(false),
  passwordHash: text("password_hash"),
  expiresAt: timestamp("expires_at"),
  responseLimit: integer("response_limit"),
  publishedAt: timestamp("published_at"),
  unpublishedAt: timestamp("unpublished_at"),
  responseCount: integer("response_count").default(0),
  viewCount: integer("view_count").default(0),
  lastResponseAt: timestamp("last_response_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const formFieldsTable = pgTable("form_fields", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  fieldType: fieldTypeEnum("field_type").notNull(),
  placeholder: text("placeholder"),
  required: boolean("required").default(false),
  orderIndex: integer("order_index").notNull(),
  validationRules: jsonb("validation_rules"),
  config: jsonb("config"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const formResponsesTable = pgTable("form_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),
  respondentEmail: varchar("respondent_email", { length: 255 }),
  answers: jsonb("answers").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
});

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;
export type SelectFormField = typeof formFieldsTable.$inferSelect;
export type InsertFormField = typeof formFieldsTable.$inferInsert;
export type SelectFormResponse = typeof formResponsesTable.$inferSelect;
export type InsertFormResponse = typeof formResponsesTable.$inferInsert;
