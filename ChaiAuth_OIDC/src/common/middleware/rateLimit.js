export function rateLimit({ windowMs = 60_000, max = 20, keyFn } = {}) {
    const store = new Map();

    const pruneInterval = setInterval(() => {
        const now = Date.now();
        for (const [k, v] of store) {
            if (v.resetAt <= now) store.delete(k);
        }
    }, windowMs);
    if (pruneInterval.unref) pruneInterval.unref();

    return function rateLimitMiddleware(req, res, next) {
        const key = keyFn ? keyFn(req) : (req.ip || "unknown");
        const now = Date.now();

        let entry = store.get(key);
        if (!entry || entry.resetAt <= now) {
            entry = { count: 0, resetAt: now + windowMs };
            store.set(key, entry);
        }

        entry.count++;

        res.setHeader("X-RateLimit-Limit", max);
        res.setHeader("X-RateLimit-Remaining", Math.max(0, max - entry.count));
        res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000));

        if (entry.count > max) {
            res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
            return res.status(429).json({ success: false, message: "Too many requests, please try again later" });
        }
        next();
    };
}
