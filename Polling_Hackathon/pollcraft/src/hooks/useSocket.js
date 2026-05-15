import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

export function useSocket(pollId, token, handlers = {}) {
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers || {};
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
      handlersRef.current?.onConnect?.();
    });

    socket.on("disconnect", () => {
      handlersRef.current?.onDisconnect?.();
    });

    socket.on("analytics-updated", (data) => {
      handlersRef.current?.onAnalytics?.(data);
    });

    socket.on("poll-expired", () => {
      handlersRef.current?.onExpired?.();
    });

    socket.on("poll-published", () => {
      handlersRef.current?.onPublished?.();
    });

    socket.on("poll-status-changed", (data) => {
      handlersRef.current?.onStatusChanged?.(data);
    });

    socket.on("response-count-updated", (data) => {
      handlersRef.current?.onCount?.(data);
      handlersRef.current?.onResponse?.(data);
    });

    socket.on("viewer-count-updated", (data) => {
      handlersRef.current?.onViewerCount?.(data);
    });

    socket.on("error", (err) => {
      handlersRef.current?.onError?.(err);
    });

    return () => {
      socket.emit("leave:poll:public", pollId);
      socket.disconnect();
    };
  }, [pollId, token]);

  return { emit };
}