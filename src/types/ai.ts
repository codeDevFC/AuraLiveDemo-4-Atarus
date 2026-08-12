export interface AIDetection {
  id: string
  type: 'object' | 'face' | 'motion' | 'text' | 'custom'
  label: string
  confidence: number
  timestamp: number
  videoId: string
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  metadata?: Record<string, unknown>
}

export interface AIAlert {
  id: string
  type: 'info' | 'warning' | 'critical'
  title: string
  description: string
  timestamp: number
  videoId: string
  detectionId?: string
  read: boolean
  acknowledged: boolean
}

export interface AIQuery {
  id: string
  query: string
  type: 'search' | 'analyze' | 'summarize'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  results?: AIQueryResult[]
  error?: string
  timestamp: number
}

export interface AIQueryResult {
  id: string
  videoId: string
  timestamp: number
  confidence: number
  preview?: string
  metadata?: Record<string, unknown>
}

export interface AISuggestion {
  id: string
  type: 'insight' | 'anomaly' | 'trend' | 'recommendation'
  title: string
  description: string
  confidence: number
  timestamp: number
}
