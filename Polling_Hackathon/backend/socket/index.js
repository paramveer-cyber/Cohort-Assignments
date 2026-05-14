let _io = null;

export const setIo = (io) => { _io = io; };
export const getIo = () => _io;

export const publicRoom = (pollId) => `public:poll:${pollId}`;
export const adminRoom  = (pollId) => `private:poll:${pollId}`;

export const emitToPublic = (pollId, event, data) => {
    if (!_io) return;
    _io.to(publicRoom(pollId)).emit(event, data);
};

export const emitToAdmin = (pollId, event, data) => {
    if (!_io) return;
    _io.to(adminRoom(pollId)).emit(event, data);
};

export const emitResponseSubmitted = (pollId, totalResponses) => {
    emitToPublic(pollId, "response-count-updated", { pollId, totalResponses });
};

export const emitAnalyticsUpdate = (pollId, analytics) => {
    emitToAdmin(pollId, "analytics-updated", analytics);
    emitResponseSubmitted(pollId, analytics.totalResponses);
};

export const emitPollStatusChanged = (pollId, status) => {
    const publicEvent = status === "expired" ? "poll-expired" : "poll-published";
    emitToPublic(pollId, publicEvent, { pollId, status });
    emitToAdmin(pollId, "poll-status-changed", { pollId, status });
};
