import redis from "../../config/redis.js";
import ApiError from "../utils/api-error.js";

const INCR_EXPIRE_SCRIPT = `
local v = redis.call('INCR', KEYS[1])
if v == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return v
`;

export const createRateLimiter = ({
    windowMs = 60_000,
    max = 60,
    keyPrefix = "rl",
} = {}) => {
    const windowSec = Math.ceil(windowMs / 1000);

    return async (req, res, next) => {
        const identifier = req.user?.userId ?? req.ip ?? "unknown";
        const key = `${keyPrefix}:${identifier}`;

        try {
            const current = await redis.eval(INCR_EXPIRE_SCRIPT, {
                keys: [key],
                arguments: [String(windowSec)],
            });

            res.setHeader("X-RateLimit-Limit", max);
            res.setHeader("X-RateLimit-Remaining", Math.max(0, max - current));

            if (current > max) {
                const ttl = await redis.ttl(key);
                res.setHeader("Retry-After", ttl);
                return next(ApiError.tooManyRequests("Too many requests. Please try again later."));
            }

            return next();
        } catch (err) {
            console.error("[RateLimiter] Redis error – failing open:", err.message);
            return next();
        }
    };
};

export const authRateLimiter = createRateLimiter({
    windowMs: 300_000,
    max: 20,
    keyPrefix: "rl:auth",
});

export const submitRateLimiter = createRateLimiter({
    windowMs: 60_000,
    max: 5,
    keyPrefix: "rl:submit",
});

export const readRateLimiter = createRateLimiter({
    windowMs: 60_000,
    max: 120,
    keyPrefix: "rl:read",
});

export const analyticsRateLimiter = createRateLimiter({
    windowMs: 60_000,
    max: 60,
    keyPrefix: "rl:analytics",
});