import "dotenv/config";
import { createServer } from "node:http";
import { Server as SocketIO } from "socket.io";
import { app, CORS_CONFIG } from "./app.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import { pool } from "./db/index.js";
import { setIo } from "./socket/index.js";
import { registerSocketHandlers } from "./socket/handlers.js";
import { startLifecycleWorker, stopLifecycleWorker } from "./lifecycle/worker.js";

const httpServer = createServer(app);

const io = new SocketIO(httpServer, {
    cors: CORS_CONFIG,
    pingTimeout: 10_000,
    pingInterval: 25_000,
    maxHttpBufferSize: 1e4,
    connectTimeout: 5_000,
});

setIo(io);
registerSocketHandlers(io);

const start = async () => {
    await connectRedis();
    console.log("[Server] Redis connected");
    startLifecycleWorker();
    httpServer.listen(process.env.PORT || 3000, () => {
        console.log(`[Server] Listening on port ${process.env.PORT || 3000} (${process.env.NODE_ENV || "development"})`);
    });
};

const shutdown = async (signal) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    httpServer.close(async () => {
        stopLifecycleWorker();
        await disconnectRedis();
        await pool.end();
        process.exit(0);
    });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
    console.error("[Server] Unhandled rejection:", reason);
    process.exit(1);
});

process.on("uncaughtException", (err) => {
    console.error("[Server] Uncaught exception:", err);
    process.exit(1);
});

start().catch((err) => {
    console.error("[Server] Failed to start:", err);
    process.exit(1);
});