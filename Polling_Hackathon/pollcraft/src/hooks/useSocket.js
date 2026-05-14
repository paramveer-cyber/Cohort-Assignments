import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

let sharedSocket = null
let refCount = 0

function getSocket(token) {
  if (!sharedSocket || sharedSocket.disconnected) {
    sharedSocket = io(BASE, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: token ? { token } : {},
    })
  }
  return sharedSocket
}

export function useSocket(pollId, handlers = {}, adminToken = null) {
  const socketRef = useRef(null)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!pollId) return

    refCount++
    const socket = getSocket(adminToken)
    socketRef.current = socket

    socket.emit('join:poll:public', pollId)

    if (adminToken) {
      socket.emit('join:poll:admin', pollId)
    }

    const onAnalytics = (data) => handlersRef.current.onAnalytics?.(data)
    const onResponseCount = (data) => {
      if (data.pollId === pollId) {
        handlersRef.current.onCount?.(data)
        handlersRef.current.onResponse?.(data)
      }
    }
    const onConnect = () => handlersRef.current.onConnect?.()
    const onDisconnect = () => handlersRef.current.onDisconnect?.()
    const onViewerCount = (data) => {
      if (data.pollId === pollId) handlersRef.current.onViewerCount?.(data)
    }
    const onExpired = (data) => {
      if (data.pollId === pollId) handlersRef.current.onExpired?.(data)
    }
    const onPublished = (data) => {
      if (data.pollId === pollId) handlersRef.current.onPublished?.(data)
    }
    const onStatusChanged = (data) => {
      if (data.pollId === pollId) handlersRef.current.onStatusChanged?.(data)
    }
    const onAdminJoinError = (data) => handlersRef.current.onAdminJoinError?.(data)

    if (adminToken) {
      socket.on('analytics-updated', onAnalytics)
      socket.on('poll-status-changed', onStatusChanged)
    }

    socket.on('response-count-updated', onResponseCount)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('viewer-count-updated', onViewerCount)
    socket.on('poll-expired', onExpired)
    socket.on('poll-published', onPublished)
    socket.on('error:admin-join', onAdminJoinError)

    return () => {
      socket.emit('leave:poll:public', pollId)

      if (adminToken) {
        socket.emit('leave:poll:admin', pollId)
        socket.off('analytics-updated', onAnalytics)
        socket.off('poll-status-changed', onStatusChanged)
      }

      socket.off('response-count-updated', onResponseCount)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('viewer-count-updated', onViewerCount)
      socket.off('poll-expired', onExpired)
      socket.off('poll-published', onPublished)
      socket.off('error:admin-join', onAdminJoinError)

      refCount--
      if (refCount <= 0) {
        refCount = 0
      }
    }
  }, [pollId, adminToken])

  const isConnected = useCallback(() => socketRef.current?.connected ?? false, [])

  return { isConnected }
}
