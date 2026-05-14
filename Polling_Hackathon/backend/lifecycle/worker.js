import { findDraftPollsDueForActivation, findActivePollsDueForExpiry, updatePollStatus } from "../modules/poll/poll.queries.js";
import { invalidateAnalyticsCache } from "../modules/analytics/analytics.service.js";
import { emitPollStatusChanged } from "../socket/index.js";
import redis from "../config/redis.js";

const INTERVAL_MS = 5000;

const pollCacheKey = (slug) => `poll:${slug}`;

const invalidatePollCache = async (slug) => {
    await redis.del(pollCacheKey(slug));
};

const activateDuePolls = async () => {
    const polls = await findDraftPollsDueForActivation();
    for (const poll of polls) {
        await updatePollStatus(poll.id, "active");
        await invalidatePollCache(poll.slug);
        emitPollStatusChanged(poll.id, "active");
    }
    if (polls.length > 0) {
        console.log(`[Lifecycle] Activated ${polls.length} poll(s)`);
    }
};

const expireActivePolls = async () => {
    const polls = await findActivePollsDueForExpiry();
    for (const poll of polls) {
        await updatePollStatus(poll.id, "expired");
        await invalidatePollCache(poll.slug);
        await invalidateAnalyticsCache(poll.id);
        emitPollStatusChanged(poll.id, "expired");
    }
    if (polls.length > 0) {
        console.log(`[Lifecycle] Expired ${polls.length} poll(s)`);
    }
};

const tick = async () => {
    try {
        await activateDuePolls();
        await expireActivePolls();
    } catch (err) {
        console.error("[Lifecycle] Tick error:", err);
    }
};

let timer = null;

export const startLifecycleWorker = () => {
    if (timer) return;
    timer = setInterval(tick, INTERVAL_MS);
    console.log("[Lifecycle] Worker started");
};

export const stopLifecycleWorker = () => {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    console.log("[Lifecycle] Worker stopped");
};
