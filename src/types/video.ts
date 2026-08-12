export interface VideoFrame {
  id: string
  timestamp: number // milliseconds since epoch
  dataUrl?: string
  metadata: FrameMetadata
}

export interface FrameMetadata {
  width: number
  height: number
  fps: number
  objects: DetectedObject[]
  confidence: number
}

export interface DetectedObject {
  id: string
  label: string
  confidence: number
  boundingBox: BoundingBox
  trackingId?: string
  attributes?: Record<string, string | number>
}

export interface BoundingBox {
  x: number // normalized 0-1
  y: number // normalized 0-1
  width: number // normalized 0-1
  height: number // normalized 0-1
}

export interface VideoStream {
  id: string
  name: string
  url: string
  status: 'active' | 'inactive' | 'error'
  metadata: {
    resolution: string
    fps: number
    bitrate?: number
  }
}
