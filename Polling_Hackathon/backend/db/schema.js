import {
    pgTable, uuid, varchar, text, timestamp,
    boolean, integer, jsonb, pgEnum, uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const providerEnum = pgEnum("provider", ["local", "google"]);
export const pollStatusEnum = pgEnum("poll_status", ["draft", "active", "expired", "published"]);
export const resultsVisibilityEnum = pgEnum("results_visibility", ["all", "respondents", "private"]);

export const users = pgTable(
    "users",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull(),
        avatarUrl: text("avatar_url"),
        passwordHash: text("password_hash"),
        provider: providerEnum("provider").notNull().default("local"),
        providerId: varchar("provider_id", { length: 255 }),
        refreshToken: text("refresh_token"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => ({
        emailUnique: uniqueIndex("users_email_unique").on(t.email),
    })
);

export const polls = pgTable(
    "polls",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        creatorId: uuid("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
        title: varchar("title", { length: 255 }).notNull(),
        description: text("description"),
        slug: varchar("slug", { length: 255 }).notNull(),
        status: pollStatusEnum("status").notNull().default("draft"),
        anonymousAllowed: boolean("anonymous_allowed").notNull().default(false),
        expiresAt: timestamp("expires_at", { withTimezone: true }),
        publishOn: timestamp("publish_on", { withTimezone: true }),
        resultsVisibility: resultsVisibilityEnum("results_visibility").notNull().default("all"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => ({
        slugUnique: uniqueIndex("polls_slug_unique").on(t.slug),
        slugIdx: index("polls_slug_idx").on(t.slug),
        statusIdx: index("polls_status_idx").on(t.status),
        creatorIdx: index("polls_creator_idx").on(t.creatorId),
    })
);

export const questions = pgTable(
    "questions",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        pollId: uuid("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
        content: text("content").notNull(),
        isMandatory: boolean("is_mandatory").notNull().default(false),
        displayOrder: integer("display_order").notNull().default(0),
        options: jsonb("options").notNull(),
    },
    (t) => ({
        pollIdx: index("questions_poll_idx").on(t.pollId),
    })
);

export const responses = pgTable(
    "responses",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        pollId: uuid("poll_id").notNull().references(() => polls.id, { onDelete: "cascade" }),
        userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
        sessionToken: varchar("session_token", { length: 255 }),
        submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => ({
        pollIdx: index("responses_poll_idx").on(t.pollId),
        userIdx: index("responses_user_idx").on(t.userId),
        sessionIdx: index("responses_session_idx").on(t.sessionToken),
        uniqueUserPoll: uniqueIndex("responses_user_poll_unique")
            .on(t.pollId, t.userId)
            .where(sql`${t.userId} IS NOT NULL`),
        uniqueSessionPoll: uniqueIndex("responses_session_poll_unique")
            .on(t.pollId, t.sessionToken)
            .where(sql`${t.sessionToken} IS NOT NULL`),
    })
);

export const answers = pgTable(
    "answers",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        responseId: uuid("response_id").notNull().references(() => responses.id, { onDelete: "cascade" }),
        questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
        selectedOptionId: varchar("selected_option_id", { length: 255 }).notNull(),
    },
    (t) => ({
        uniqueAnswer: uniqueIndex("answers_response_question_unique").on(t.responseId, t.questionId),
        responseIdx: index("answers_response_idx").on(t.responseId),
        questionIdx: index("answers_question_idx").on(t.questionId),
    })
);

export const usersRelations = relations(users, ({ many }) => ({
    polls: many(polls),
    responses: many(responses),
}));

export const pollsRelations = relations(polls, ({ one, many }) => ({
    creator: one(users, { fields: [polls.creatorId], references: [users.id] }),
    questions: many(questions),
    responses: many(responses),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
    poll: one(polls, { fields: [questions.pollId], references: [polls.id] }),
    answers: many(answers),
}));

export const responsesRelations = relations(responses, ({ one, many }) => ({
    poll: one(polls, { fields: [responses.pollId], references: [polls.id] }),
    user: one(users, { fields: [responses.userId], references: [users.id] }),
    answers: many(answers),
}));

export const answersRelations = relations(answers, ({ one }) => ({
    response: one(responses, { fields: [answers.responseId], references: [responses.id] }),
    question: one(questions, { fields: [answers.questionId], references: [questions.id] }),
}));
