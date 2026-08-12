import { useEffect, useRef, useState, useCallback } from 'react'
import { WebSocketMessage } from '@/types/api'

interface WebSocketOptions {
  url: string
  onMessage?: (data: WebSocketMessage) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

interface WebSocketState {
  isConnected: boolean
  lastMessage: WebSocketMessage | null
  reconnectAttempts: number
  error: Event | null
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: WebSocketOptions) {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    lastMessage: null,
    reconnectAttempts: 0,
    error: null,
  })

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        if (!isMountedRef.current) return
        setState((prev) => ({
          ...prev,
          isConnected: true,
          reconnectAttempts: 0,
          error: null,
        }))
        onOpen?.()
        console.log('🔌 WebSocket connected')
      }

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return
        try {
          const data = JSON.parse(event.data) as WebSocketMessage
          setState((prev) => ({
            ...prev,
            lastMessage: data,
          }))
          onMessage?.(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        if (!isMountedRef.current) return
        setState((prev) => ({
          ...prev,
          isConnected: false,
          error: null,
        }))
        onClose?.()
        console.log('🔌 WebSocket disconnected')

        // Attempt reconnection
        if (state.reconnectAttempts < maxReconnectAttempts) {
          reconnectTimerRef.current = window.setTimeout(() => {
            setState((prev) => ({
              ...prev,
              reconnectAttempts: prev.reconnectAttempts + 1,
            }))
            connect()
          }, reconnectInterval)
        } else {
          console.error('Max reconnection attempts reached')
        }
      }

      ws.onerror = (error) => {
        if (!isMountedRef.current) return
        setState((prev) => ({
          ...prev,
          error,
        }))
        onError?.(error)
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnectInterval, maxReconnectAttempts, state.reconnectAttempts])

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setState((prev) => ({
      ...prev,
      isConnected: false,
    }))
  }, [])

  const sendMessage = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
      return true
    }
    console.warn('WebSocket is not connected')
    return false
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    connect()

    return () => {
      isMountedRef.current = false
      disconnect()
    }
  }, [connect, disconnect])

  return {
    ...state,
    sendMessage,
    disconnect,
    reconnect: connect,
    isReady: state.isConnected && wsRef.current?.readyState === WebSocket.OPEN,
  }
}
