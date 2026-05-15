import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

export function useSocket(pollId, token, handlers) {
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const emit = useCallback((event, data) => {
    if (socketRef.current) socketRef.current.emit(event, data);
  }, []);

  useEffect(() => {
    if (!pollId) return;

    const socket = io(import.meta.env.VITE_API_URL, { auth: token ? { token } : {} });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (token) {
        socket.emit("join:poll:admin", pollId);
      } else {
        socket.emit("join:poll:public", pollId);
      }
      if (handlersRef.current.onConnect) handlersRef.current.onConnect();
    });

    socket.on("disconnect", () => {
      if (handlersRef.current.onDisconnect) handlersRef.current.onDisconnect();
    });

    socket.on("analytics-updated", (data) => {
      if (handlersRef.current.onAnalytics) handlersRef.current.onAnalytics(data);
    });

    socket.on("poll-expired", () => {
      if (handlersRef.current.onExpired) handlersRef.current.onExpired();
    });

    socket.on("poll-published", () => {
      if (handlersRef.current.onPublished) handlersRef.current.onPublished();
    });

    socket.on("poll-status-changed", (data) => {
      if (handlersRef.current.onStatusChanged) handlersRef.current.onStatusChanged(data);
    });

    socket.on("response-count-updated", (data) => {
      if (handlersRef.current.onCount) handlersRef.current.onCount(data);
    });

    socket.on("viewer-count-updated", (data) => {
      if (handlersRef.current.onViewerCount) handlersRef.current.onViewerCount(data);
    });

    socket.on("response-count-updated", (data) => {
      if (handlersRef.current.onResponse) handlersRef.current.onResponse(data);
    });

    socket.on("error", (err) => {
      if (handlersRef.current.onError) handlersRef.current.onError(err);
    });

    return () => {
      socket.emit("leave:poll:public", pollId);
      socket.disconnect();
    };
  }, [pollId, token]);

  return { emit };
}