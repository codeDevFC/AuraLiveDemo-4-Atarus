export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface WebSocketMessage {
  type: 'detection' | 'alert' | 'status' | 'ping' | 'pong'
  payload: unknown
  timestamp: number
}

export interface SearchParams {
  query: string
  startTime?: number
  endTime?: number
  videoIds?: string[]
  limit?: number
  offset?: number
}
