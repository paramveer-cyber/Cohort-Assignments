import { db } from "./index.js";
import { users, polls, questions, responses, answers } from "./schema.js";
import { eq, and, sql, isNotNull } from "drizzle-orm";

export const findUserById = (id) =>
    db.query.users.findFirst({ where: eq(users.id, id) });

export const findUserByEmail = (email) =>
    db.query.users.findFirst({ where: eq(users.email, email) });

export const findUserByGoogleId = (googleId) =>
    db.query.users.findFirst({ where: eq(users.providerId, googleId) });

export const findUserByRefreshToken = (token) =>
    db.query.users.findFirst({ where: eq(users.refreshToken, token) });

export const insertUser = async (data) => {
    const [user] = await db.insert(users).values(data).returning();
    return user;
};

export const setUserRefreshToken = (id, token) =>
    db.update(users).set({ refreshToken: token }).where(eq(users.id, id));

export const clearUserRefreshToken = (id) =>
    db.update(users).set({ refreshToken: null }).where(eq(users.id, id));

export const deleteUserById = (id) =>
    db.delete(users).where(eq(users.id, id));

export const findPollBySlug = (slug) =>
    db.query.polls.findFirst({
        where: eq(polls.slug, slug),
        with: { questions: { orderBy: (q, { asc }) => [asc(q.displayOrder)] } },
    });

export const findPollById = (id) =>
    db.query.polls.findFirst({
        where: eq(polls.id, id),
        with: { questions: { orderBy: (q, { asc }) => [asc(q.displayOrder)] } },
    });

export const findPollsByCreator = (creatorId) =>
    db.query.polls.findMany({
        where: eq(polls.creatorId, creatorId),
        orderBy: (p, { desc }) => [desc(p.createdAt)],
    });

export const getPublishedPolls = () =>
    db.query.polls.findMany({
        where: eq(polls.status, "published"),
        with: {
            creator: {
                columns: { id: true, name: true, avatarUrl: true },
            },
        },
        orderBy: (p, { desc }) => [desc(p.createdAt)],
    });

export const insertPoll = async ({ creatorId, title, slug, anonymousAllowed, expiresAt, questions: pollQuestions }) => {
    return db.transaction(async (tx) => {
        const [poll] = await tx
            .insert(polls)
            .values({ creatorId, title, slug, anonymousAllowed, expiresAt, status: "draft" })
            .returning();

        if (pollQuestions?.length) {
            await tx.insert(questions).values(
                pollQuestions.map((q, i) => ({
                    pollId:       poll.id,
                    content:      q.content,
                    isMandatory:  q.isMandatory ?? false,
                    displayOrder: i,
                    options:      q.options,
                }))
            );
        }
        return poll;
    });
};

export const updatePollStatus = async (id, status) => {
    const [poll] = await db.update(polls).set({ status }).where(eq(polls.id, id)).returning();
    return poll;
};

export const updatePollFields = async (id, { title, anonymousAllowed, expiresAt }) => {
    const [poll] = await db.update(polls)
        .set({ title, anonymousAllowed, expiresAt })
        .where(eq(polls.id, id))
        .returning();
    return poll;
};

export const findExistingResponse = (pollId, userId, sessionToken) => {
    if (userId) {
        return db.query.responses.findFirst({
            where: and(eq(responses.pollId, pollId), eq(responses.userId, userId)),
        });
    }
    if (sessionToken) {
        return db.query.responses.findFirst({
            where: and(eq(responses.pollId, pollId), eq(responses.sessionToken, sessionToken)),
        });
    }
    return null;
};

export const insertResponse = async ({ pollId, userId, sessionToken, answerData }) => {
    return db.transaction(async (tx) => {
        const [response] = await tx
            .insert(responses)
            .values({ pollId, userId: userId ?? null, sessionToken: sessionToken ?? null })
            .returning();

        if (answerData?.length) {
            await tx.insert(answers).values(
                answerData.map((a) => ({
                    responseId:       response.id,
                    questionId:       a.questionId,
                    selectedOptionId: a.selectedOptionId,
                }))
            );
        }
        return response;
    });
};

export const getResponseCount = async (pollId) => {
    const [row] = await db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(responses)
        .where(eq(responses.pollId, pollId));
    return row?.count ?? 0;
};

export const getOptionCounts = async (pollId) => {
    return db
        .select({
            questionId:       answers.questionId,
            selectedOptionId: answers.selectedOptionId,
            count:            sql`count(*)`.mapWith(Number),
        })
        .from(answers)
        .innerJoin(responses, eq(answers.responseId, responses.id))
        .where(eq(responses.pollId, pollId))
        .groupBy(answers.questionId, answers.selectedOptionId);
};

export const getParticipationOverTime = async (pollId) => {
    return db
        .select({
            hour:  sql`date_trunc('hour', ${responses.submittedAt})`,
            count: sql`count(*)`.mapWith(Number),
        })
        .from(responses)
        .where(
            and(
                eq(responses.pollId, pollId),
                sql`${responses.submittedAt} > now() - interval '7 days'`
            )
        )
        .groupBy(sql`date_trunc('hour', ${responses.submittedAt})`)
        .orderBy(sql`date_trunc('hour', ${responses.submittedAt})`);
};