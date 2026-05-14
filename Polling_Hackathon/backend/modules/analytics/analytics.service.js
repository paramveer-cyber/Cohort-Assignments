import redis from "../../config/redis.js";
import { getResponseCount, getOptionCounts, getParticipationOverTime } from "./analytics.queries.js";
import { findPollById } from "../poll/poll.queries.js";

const ANALYTICS_TTL = 30;
const STALE_TTL = 120;
const LOCK_TTL = 10;
const LOCK_POLL_MS = 100;
const LOCK_MAX_WAIT = 3000;

const analyticsKey = (pollId) => `analytics:${pollId}`;
const staleKey = (pollId) => `analytics:stale:${pollId}`;
const lockKey = (pollId) => `analytics:lock:${pollId}`;

const buildAnalytics = async (pollId) => {
    const [totalResponses, optionCounts, participation, poll] = await Promise.all([
        getResponseCount(pollId),
        getOptionCounts(pollId),
        getParticipationOverTime(pollId),
        findPollById(pollId),
    ]);

    if (!poll) return null;

    const questionMap = {};
    for (const q of poll.questions ?? []) {
        questionMap[q.id] = {
            questionId: q.id,
            content: q.content,
            isMandatory: q.isMandatory,
            displayOrder: q.displayOrder,
            options: (q.options ?? []).map((opt) => ({
                id: opt.id,
                text: opt.text,
                votes: 0,
            })),
        };
    }

    for (const row of optionCounts) {
        const qd = questionMap[row.questionId];
        if (!qd) continue;
        const opt = qd.options.find((o) => o.id === row.selectedOptionId);
        if (opt) opt.votes = row.count;
    }

    return {
        pollId,
        totalResponses,
        questions: Object.values(questionMap).sort((a, b) => a.displayOrder - b.displayOrder),
        participation: participation.map((p) => ({ hour: p.hour, count: p.count })),
        computedAt: new Date().toISOString(),
    };
};

export const computeAndCacheAnalytics = async (pollId) => {
    const analytics = await buildAnalytics(pollId);
    if (!analytics) return null;

    const serialized = JSON.stringify(analytics);
    await Promise.all([
        redis.setEx(analyticsKey(pollId), ANALYTICS_TTL, serialized),
        redis.setEx(staleKey(pollId), STALE_TTL, serialized),
    ]);
    return analytics;
};

export const getAnalytics = async (pollId) => {
    const cached = await redis.get(analyticsKey(pollId));
    if (cached) return JSON.parse(cached);

    const lock = await redis.set(lockKey(pollId), "1", { NX: true, EX: LOCK_TTL });

    if (lock) {
        try {
            return await computeAndCacheAnalytics(pollId);
        } finally {
            await redis.del(lockKey(pollId));
        }
    }

    const waited = { ms: 0 };
    while (waited.ms < LOCK_MAX_WAIT) {
        await new Promise((r) => setTimeout(r, LOCK_POLL_MS));
        waited.ms += LOCK_POLL_MS;

        const fresh = await redis.get(analyticsKey(pollId));
        if (fresh) return JSON.parse(fresh);
    }

    const stale = await redis.get(staleKey(pollId));
    if (stale) return JSON.parse(stale);

    return computeAndCacheAnalytics(pollId);
};

export const invalidateAnalyticsCache = async (pollId) => {
    await redis.del(analyticsKey(pollId));
};