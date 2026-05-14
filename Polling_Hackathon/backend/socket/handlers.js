import { verifyToken } from "../common/utils/tokenLogic.js";
import { findPollById } from "../modules/poll/poll.queries.js";
import { publicRoom, adminRoom, emitToPublic } from "./index.js";

const JOIN_LIMIT_PER_SOCKET = 20;
const EVENT_RATE_LIMIT      = 100;
const EVENT_WINDOW_MS       = 1000;

const socketJoinCounts  = new Map();
const socketEventBucket = new Map();
const socketPublicRooms = new Map();
const socketAdminRooms  = new Map();

const checkEventRate = (socketId) => {
    const now    = Date.now();
    const bucket = socketEventBucket.get(socketId) ?? { count: 0, windowStart: now };

    if (now - bucket.windowStart > EVENT_WINDOW_MS) {
        bucket.count       = 1;
        bucket.windowStart = now;
        socketEventBucket.set(socketId, bucket);
        return true;
    }

    bucket.count += 1;
    socketEventBucket.set(socketId, bucket);
    return bucket.count <= EVENT_RATE_LIMIT;
};

const getPublicRoomSize = (io, pollId) => {
    const room = io.sockets.adapter.rooms.get(publicRoom(pollId));
    return room ? room.size : 0;
};

const broadcastViewerCount = (io, pollId) => {
    const count = getPublicRoomSize(io, pollId);
    emitToPublic(pollId, "viewer-count-updated", { pollId, count });
};

const isValidPollId = (pollId) =>
    typeof pollId === "string" && pollId.length > 0 && pollId.length <= 100;

const totalJoinCount = (socketId) =>
    (socketJoinCounts.get(socketId) ?? 0);

const bumpJoinCount = (socketId) =>
    socketJoinCounts.set(socketId, totalJoinCount(socketId) + 1);

export const registerSocketHandlers = (io) => {
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (token) {
            try {
                socket.user = verifyToken(token);
            } catch {
            }
        }
        next();
    });

    io.on("connection", (socket) => {
        socketJoinCounts.set(socket.id, 0);
        socketEventBucket.set(socket.id, { count: 0, windowStart: Date.now() });
        socketPublicRooms.set(socket.id, new Set());
        socketAdminRooms.set(socket.id, new Set());

        socket.on("join:poll:public", async (pollId) => {
            if (!checkEventRate(socket.id)) { socket.disconnect(true); return; }
            if (totalJoinCount(socket.id) >= JOIN_LIMIT_PER_SOCKET) { socket.disconnect(true); return; }
            if (!isValidPollId(pollId)) return;

            const alreadyJoined = socketPublicRooms.get(socket.id);
            if (alreadyJoined?.has(pollId)) return;

            try {
                const poll = await findPollById(pollId);
                if (!poll) return;

                const isOwner  = socket.user?.userId === poll.creatorId;
                const isPublic = ["active", "published"].includes(poll.status);

                if (!isPublic && !isOwner) return;

                socket.join(publicRoom(pollId));
                bumpJoinCount(socket.id);
                alreadyJoined?.add(pollId);

                broadcastViewerCount(io, pollId);
            } catch {
            }
        });

        socket.on("leave:poll:public", (pollId) => {
            if (!checkEventRate(socket.id)) { socket.disconnect(true); return; }
            if (!isValidPollId(pollId)) return;

            socket.leave(publicRoom(pollId));
            socketPublicRooms.get(socket.id)?.delete(pollId);
            broadcastViewerCount(io, pollId);
        });

        socket.on("join:poll:admin", async (pollId) => {
            if (!checkEventRate(socket.id)) { socket.disconnect(true); return; }
            if (totalJoinCount(socket.id) >= JOIN_LIMIT_PER_SOCKET) { socket.disconnect(true); return; }
            if (!isValidPollId(pollId)) return;

            if (!socket.user?.userId) {
                socket.emit("error:admin-join", { message: "Authentication required" });
                return;
            }

            const alreadyJoined = socketAdminRooms.get(socket.id);
            if (alreadyJoined?.has(pollId)) return;

            try {
                const poll = await findPollById(pollId);
                if (!poll) {
                    socket.emit("error:admin-join", { message: "Poll not found" });
                    return;
                }

                if (poll.creatorId !== socket.user.userId) {
                    socket.emit("error:admin-join", { message: "Forbidden" });
                    return;
                }

                socket.join(adminRoom(pollId));
                bumpJoinCount(socket.id);
                alreadyJoined?.add(pollId);
            } catch {
            }
        });

        socket.on("leave:poll:admin", (pollId) => {
            if (!checkEventRate(socket.id)) { socket.disconnect(true); return; }
            if (!isValidPollId(pollId)) return;

            socket.leave(adminRoom(pollId));
            socketAdminRooms.get(socket.id)?.delete(pollId);
        });

        socket.on("disconnect", () => {
            const publicRooms = socketPublicRooms.get(socket.id);
            if (publicRooms) {
                for (const pollId of publicRooms) {
                    setImmediate(() => broadcastViewerCount(io, pollId));
                }
            }

            socketJoinCounts.delete(socket.id);
            socketEventBucket.delete(socket.id);
            socketPublicRooms.delete(socket.id);
            socketAdminRooms.delete(socket.id);
        });
    });
};
