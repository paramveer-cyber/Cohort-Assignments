import { db } from "../../db/index.js";
import { polls, questions, responses, answers } from "../../db/schema.js";
import { eq, and, sql } from "drizzle-orm";

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

export const insertPoll = async ({ creatorId, title, description, slug, anonymousAllowed, expiresAt, publishOn, resultsVisibility, questions: pollQuestions }) => {
    return db.transaction(async (tx) => {
        const [poll] = await tx
            .insert(polls)
            .values({
                creatorId,
                title,
                description: description ?? null,
                slug,
                anonymousAllowed,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                publishOn: publishOn ? new Date(publishOn) : null,
                resultsVisibility: resultsVisibility ?? "all",
                status: "draft",
            })
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

export const updatePollFields = async (id, data) => {
    const { questions: pollQuestions, ...fields } = data;
    const payload = {
        ...fields,
        ...(fields.expiresAt !== undefined ? { expiresAt: fields.expiresAt ? new Date(fields.expiresAt) : null } : {}),
        ...(fields.publishOn !== undefined ? { publishOn: fields.publishOn ? new Date(fields.publishOn) : null } : {}),
    };

    return db.transaction(async (tx) => {
        const [poll] = await tx.update(polls).set(payload).where(eq(polls.id, id)).returning();

        if (pollQuestions !== undefined) {
            await tx.delete(questions).where(eq(questions.pollId, id));
            if (pollQuestions.length) {
                await tx.insert(questions).values(
                    pollQuestions.map((q, i) => ({
                        pollId:       id,
                        content:      q.content,
                        isMandatory:  q.isMandatory ?? false,
                        displayOrder: i,
                        options:      q.options,
                    }))
                );
            }
        }

        return poll;
    });
};

export const deletePollById = async (id) => {
    return db.transaction(async (tx) => {
        await tx.delete(polls).where(eq(polls.id, id));
    });
};

export const findExistingResponse = (pollId, userId, sessionToken) => {
    if (userId) {
        return db.query.responses.findFirst({
            where: and(eq(responses.pollId, pollId), eq(responses.userId, userId)),
        });
    }
    return db.query.responses.findFirst({
        where: and(eq(responses.pollId, pollId), eq(responses.sessionToken, sessionToken)),
    });
};

export const findResponseWithAnswers = (pollId, userId, sessionToken = null) => {
    const condition = userId
        ? and(eq(responses.pollId, pollId), eq(responses.userId, userId))
        : and(eq(responses.pollId, pollId), eq(responses.sessionToken, sessionToken));
    return db.query.responses.findFirst({ where: condition, with: { answers: true } });
};

export const hasUserRespondedToPoll = async (pollId, userId, sessionToken) => {
    if (userId) {
        const row = await db.query.responses.findFirst({
            where: and(eq(responses.pollId, pollId), eq(responses.userId, userId)),
            columns: { id: true },
        });
        return !!row;
    }
    if (sessionToken) {
        const row = await db.query.responses.findFirst({
            where: and(eq(responses.pollId, pollId), eq(responses.sessionToken, sessionToken)),
            columns: { id: true },
        });
        return !!row;
    }
    return false;
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
export const findDraftPollsDueForActivation = () =>
    db.query.polls.findMany({
        where: (p, { and, eq, lte, isNotNull }) =>
            and(eq(p.status, "draft"), isNotNull(p.publishOn), lte(p.publishOn, new Date())),
        columns: { id: true, slug: true },
    });

export const findActivePollsDueForExpiry = () =>
    db.query.polls.findMany({
        where: (p, { and, eq, lte, isNotNull }) =>
            and(eq(p.status, "active"), isNotNull(p.expiresAt), lte(p.expiresAt, new Date())),
        columns: { id: true, slug: true },
    });
