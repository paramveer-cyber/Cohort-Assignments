import redis from "../../config/redis.js";
import ApiError from "../../common/utils/api-error.js";
import { generateSlug } from "../../common/utils/slugify.js";
import jwt from "jsonwebtoken";
import {
    findPollBySlug, findPollById, findPollsByCreator,
    insertPoll, updatePollStatus, updatePollFields, deletePollById,
    findExistingResponse, insertResponse, hasUserRespondedToPoll,
    getPublishedPolls, findResponseWithAnswers,
} from "./poll.queries.js";
import { getAnalytics, computeAndCacheAnalytics, invalidateAnalyticsCache } from "../analytics/analytics.service.js";
import { emitAnalyticsUpdate } from "../../socket/index.js";

const pollCacheKey   = (slug) => `poll:${slug}`;
const POLL_CACHE_TTL = 60;

const cachePoll = async (poll) => {
    await redis.setEx(pollCacheKey(poll.slug), POLL_CACHE_TTL, JSON.stringify(poll));
};

const getCachedPoll = async (slug) => {
    const cached = await redis.get(pollCacheKey(slug));
    return cached ? JSON.parse(cached) : null;
};

const invalidatePollCache = async (slug) => {
    await redis.del(pollCacheKey(slug));
};

const invalidateAllPollCaches = async (poll) => {
    const keys = [
        pollCacheKey(poll.slug),
        `analytics:${poll.id}`,
        `analytics:stale:${poll.id}`,
        `analytics:lock:${poll.id}`,
    ];
    await redis.del(keys);
};

const extractAnonId = (anonToken) => {
    if (!anonToken) return null;
    try {
        const decoded = jwt.verify(anonToken, process.env.JWT_SECRET, { issuer: "pollApp" });
        return decoded.anonId ?? null;
    } catch {
        return null;
    }
};

export const createPoll = async ({ creatorId, title, description, slug, anonymousAllowed, expiresAt, publishOn, resultsVisibility, questions }) => {
    const finalSlug = slug ?? generateSlug(title);
    return insertPoll({ creatorId, title, description, slug: finalSlug, anonymousAllowed, expiresAt, publishOn, resultsVisibility, questions });
};

export const activatePoll = async (pollId, requesterId) => {
    const poll = await findPollById(pollId);
    if (!poll)                          throw ApiError.notFound("Poll not found");
    if (poll.creatorId !== requesterId) throw ApiError.forbidden("Not your poll");
    if (poll.status !== "draft")        throw ApiError.badRequest("Only draft polls can be activated");

    const updated = await updatePollStatus(pollId, "active");
    await invalidatePollCache(updated.slug);
    return updated;
};

export const publishPoll = async (pollId, requesterId) => {
    const poll = await findPollById(pollId);
    if (!poll)                          throw ApiError.notFound("Poll not found");
    if (poll.creatorId !== requesterId) throw ApiError.forbidden("Not your poll");
    if (!["active", "expired"].includes(poll.status)) {
        throw ApiError.badRequest("Only active or expired polls can be published");
    }

    const updated = await updatePollStatus(pollId, "published");
    await invalidatePollCache(updated.slug);
    return updated;
};

export const updatePoll = async (pollId, requesterId, data) => {
    const poll = await findPollById(pollId);
    if (!poll)                          throw ApiError.notFound("Poll not found");
    if (poll.creatorId !== requesterId) throw ApiError.forbidden("Not your poll");
    if (poll.status !== "draft")        throw ApiError.badRequest("Only draft polls can be edited");

    const updated = await updatePollFields(pollId, data);
    await invalidatePollCache(updated.slug);

    if (data.questions !== undefined) {
        await invalidateAnalyticsCache(pollId);
    }

    return updated;
};

export const deletePoll = async (pollId, requesterId) => {
    const poll = await findPollById(pollId);
    if (!poll)                          throw ApiError.notFound("Poll not found");
    if (poll.creatorId !== requesterId) throw ApiError.forbidden("Not your poll");

    await invalidateAllPollCaches(poll);
    await deletePollById(pollId);
};

export const getPublicPoll = async (slug) => {
    let poll = await getCachedPoll(slug);

    if (!poll) {
        poll = await findPollBySlug(slug);
        if (!poll) throw ApiError.notFound("Poll not found");
        await cachePoll(poll);
    }

    if (!["active", "published"].includes(poll.status)) {
        throw ApiError.notFound("Poll is not available");
    }

    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
        throw ApiError.badRequest("This poll has expired");
    }

    return poll;
};

export const getPollById = async (pollId, requesterId) => {
    const poll = await findPollById(pollId);
    if (!poll) throw ApiError.notFound("Poll not found");
    if (poll.creatorId !== requesterId) throw ApiError.forbidden("Not your poll");
    return poll;
};

export const getCreatorPolls = async (creatorId) => {
    return findPollsByCreator(creatorId);
};

export const listPublished = async () => {
    return getPublishedPolls();
};

export const getCreatorAnalytics = async (pollId, requesterId) => {
    const poll = await findPollById(pollId);
    if (!poll)                          throw ApiError.notFound("Poll not found");
    if (poll.creatorId !== requesterId) throw ApiError.forbidden("Not your poll");

    return getAnalytics(pollId);
};

export const getPublishedAnalytics = async (pollId, requesterId, anonToken) => {
    const poll = await findPollById(pollId);
    if (!poll || poll.status !== "published") throw ApiError.notFound("Poll not found");

    const visibility = poll.resultsVisibility ?? "all";

    if (visibility === "private") {
        if (!requesterId || requesterId !== poll.creatorId) {
            throw ApiError.forbidden("Results are private");
        }
    } else if (visibility === "respondents") {
        if (requesterId === poll.creatorId) {
            return getAnalytics(pollId);
        }
        const anonId = extractAnonId(anonToken);
        const hasResponded = await hasUserRespondedToPoll(pollId, requesterId ?? null, anonId ?? null);
        if (!hasResponded) {
            throw ApiError.forbidden("Only respondents can view results");
        }
    }

    return getAnalytics(pollId);
};

export const getSubmissionStatus = async (slug, userId, anonToken = null) => {
    const poll = await findPollBySlug(slug);
    if (!poll) throw ApiError.notFound("Poll not found");

    const anonId = !userId ? extractAnonId(anonToken) : null;

    if (!userId && !anonId) {
        return { submitted: false, answers: [] };
    }

    const response = await findResponseWithAnswers(poll.id, userId ?? null, anonId);

    if (!response) {
        return { submitted: false, answers: [] };
    }

    return {
        submitted: true,
        answers: (response.answers ?? []).map((a) => ({
            questionId:       a.questionId,
            selectedOptionId: a.selectedOptionId,
        })),
    };
};

export const submitResponse = async ({ slug, userId, anonToken, answers: answerData }) => {
    const poll = await findPollBySlug(slug);
    if (!poll) throw ApiError.notFound("Poll not found");

    if (poll.status !== "active") {
        throw ApiError.badRequest("This poll is not accepting responses");
    }

    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
        throw ApiError.badRequest("This poll has expired");
    }

    if (!poll.anonymousAllowed && !userId) {
        throw ApiError.unAuthorized("This poll requires authentication");
    }

    let anonId = null;
    if (poll.anonymousAllowed && !userId) {
        anonId = extractAnonId(anonToken);
        if (!anonId) {
            throw ApiError.badRequest("Anonymous session required. Call /auth/anon-token first.");
        }
    }

    const lockIdentifier = userId ?? anonId;
    const lockKey = `lock:response:${poll.id}:${lockIdentifier}`;
    const acquired = await redis.set(lockKey, "1", { NX: true, EX: 15 });
    if (!acquired) {
        throw ApiError.conflict("A submission is already in progress. Please wait.");
    }

    try {
        const existing = await findExistingResponse(poll.id, userId ?? null, userId ? null : anonId);
        if (existing) throw ApiError.conflict("You have already submitted a response to this poll");

        const answeredIds = new Set(answerData.map((a) => a.questionId));
        const missingMandatory = (poll.questions ?? [])
            .filter((q) => q.isMandatory && !answeredIds.has(q.id));
        if (missingMandatory.length > 0) {
            throw ApiError.badRequest(
                `Missing answers for mandatory questions: ${missingMandatory.map((q) => q.id).join(", ")}`
            );
        }

        const optionLookup = {};
        for (const q of poll.questions ?? []) {
            optionLookup[q.id] = new Set((q.options ?? []).map((o) => o.id));
        }
        for (const a of answerData) {
            const validOptions = optionLookup[a.questionId];
            if (!validOptions) throw ApiError.badRequest(`Unknown questionId: ${a.questionId}`);
            if (!validOptions.has(a.selectedOptionId)) {
                throw ApiError.badRequest(`Invalid option ${a.selectedOptionId} for question ${a.questionId}`);
            }
        }

        const response = await insertResponse({
            pollId:       poll.id,
            userId:       userId ?? null,
            sessionToken: userId ? null : anonId,
            answerData,
        });

        await invalidateAnalyticsCache(poll.id);
        const analytics = await computeAndCacheAnalytics(poll.id);

        if (analytics) {
            emitAnalyticsUpdate(poll.id, analytics);
        }

        return response;
    } finally {
        await redis.del(lockKey);
    }
};
