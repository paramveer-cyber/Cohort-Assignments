import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });

redis.on("error", (err) => console.error("[Redis] Client error:", err));
redis.on("connect", () => console.log("[Redis] Connected"));
redis.on("reconnecting", () => console.log("[Redis] Reconnecting..."));

export const connectRedis = async () => { await redis.connect(); };
export const disconnectRedis = async () => { await redis.quit(); };

export default redis;
