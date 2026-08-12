import { VideoFrame, DetectedObject } from '@/types/video'
import { DataMode } from '@/components/ui/mode-toggle'

// Mock data generator for Demo Mode
function generateMockFrame(width: number = 640, height: number = 360): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#1a1a2e')
  gradient.addColorStop(0.5, '#16213e')
  gradient.addColorStop(1, '#0f3460')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  for (let i = 0; i < 100; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`
    ctx.fillRect(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 10 + 1,
      Math.random() * 10 + 1
    )
  }
  
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  ctx.lineWidth = 1
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  ctx.font = '12px monospace'
  ctx.fillText('📹 LIVE FEED', 10, 30)
  
  return canvas.toDataURL('image/jpeg', 0.7)
}

function generateMockObjects(count: number = 0): DetectedObject[] {
  const labels = ['person', 'vehicle', 'animal', 'object', 'face']
  const numObjects = count > 0 ? count : Math.floor(Math.random() * 4) + 1
  
  return Array.from({ length: numObjects }, (_, i) => ({
    id: `obj-${Date.now()}-${i}`,
    label: labels[Math.floor(Math.random() * labels.length)],
    confidence: 0.5 + Math.random() * 0.5,
    boundingBox: {
      x: 0.1 + Math.random() * 0.7,
      y: 0.1 + Math.random() * 0.7,
      width: 0.05 + Math.random() * 0.3,
      height: 0.05 + Math.random() * 0.3,
    },
    trackingId: Math.random() > 0.5 ? `track-${Math.floor(Math.random() * 20)}` : undefined,
  }))
}

export class DataSourceManager {
  private mode: DataMode = 'demo'
  private realData: VideoFrame[] = []
  private mockData: VideoFrame[] = []
  private listeners: ((frames: VideoFrame[]) => void)[] = []
  private intervalId: NodeJS.Timeout | null = null
  private frameCount = 0

  constructor() {
    this.generateMockData()
  }

  setMode(mode: DataMode) {
    this.mode = mode
    this.stopLiveUpdates()
    this.startLiveUpdates()
    this.notifyListeners()
  }

  getMode(): DataMode {
    return this.mode
  }

  private generateMockData() {
    const frames: VideoFrame[] = []
    const count = 80
    
    for (let i = 0; i < count; i++) {
      const timestamp = Date.now() - (count - i) * 2000
      const hasDetections = Math.random() > 0.4
      
      frames.push({
        id: `mock-frame-${i}`,
        timestamp,
        dataUrl: generateMockFrame(),
        metadata: {
          width: 640,
          height: 360,
          fps: 30,
          confidence: 0.7 + Math.random() * 0.3,
          objects: hasDetections ? generateMockObjects() : [],
        },
      })
    }
    
    this.mockData = frames
  }

  private simulateLiveData() {
    if (this.mode === 'demo') {
      // Demo mode: generate new mock data
      const newFrame: VideoFrame = {
        id: `demo-frame-${Date.now()}`,
        timestamp: Date.now(),
        dataUrl: generateMockFrame(),
        metadata: {
          width: 640,
          height: 360,
          fps: 30,
          confidence: 0.6 + Math.random() * 0.4,
          objects: Math.random() > 0.4 ? generateMockObjects() : [],
        },
      }
      
      this.mockData = [...this.mockData.slice(-100), newFrame]
      this.notifyListeners()
      
    } else if (this.mode === 'live') {
      // Live mode: simulate real data with more realistic patterns
      const hasDetections = Math.random() > 0.3
      const numObjects = hasDetections ? Math.floor(Math.random() * 5) + 1 : 0
      
      const newFrame: VideoFrame = {
        id: `live-frame-${Date.now()}`,
        timestamp: Date.now(),
        dataUrl: generateMockFrame(),
        metadata: {
          width: 1920,
          height: 1080,
          fps: 30,
          confidence: 0.5 + Math.random() * 0.5,
          objects: generateMockObjects(numObjects),
        },
      }
      
      this.realData = [...this.realData.slice(-100), newFrame]
      this.notifyListeners()
      
    } else if (this.mode === 'hybrid') {
      // Hybrid mode: mock UI with realistic patterns
      const hasDetections = Math.random() > 0.25
      const numObjects = hasDetections ? Math.floor(Math.random() * 6) + 1 : 0
      
      const newFrame: VideoFrame = {
        id: `hybrid-frame-${Date.now()}`,
        timestamp: Date.now(),
        dataUrl: generateMockFrame(),
        metadata: {
          width: 1920,
          height: 1080,
          fps: 30,
          confidence: 0.7 + Math.random() * 0.3,
          objects: generateMockObjects(numObjects),
        },
      }
      
      this.realData = [...this.realData.slice(-100), newFrame]
      this.notifyListeners()
    }
  }

  private startLiveUpdates() {
    if (this.intervalId) return
    
    this.intervalId = setInterval(() => {
      this.simulateLiveData()
    }, this.mode === 'demo' ? 3000 : 2000) // Demo slower, live faster
  }

  private stopLiveUpdates() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private notifyListeners() {
    const data = this.getCurrentData()
    this.listeners.forEach(listener => listener(data))
  }

  getCurrentData(): VideoFrame[] {
    if (this.mode === 'demo') {
      return this.mockData
    } else {
      return this.realData.length > 0 ? this.realData : this.mockData
    }
  }

  subscribe(listener: (frames: VideoFrame[]) => void): () => void {
    this.listeners.push(listener)
    // Immediately send current data
    listener(this.getCurrentData())
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  regenerate() {
    if (this.mode === 'demo') {
      this.generateMockData()
    } else {
      // For live/hybrid, clear and regenerate
      this.realData = []
      // Force a new batch
      for (let i = 0; i < 10; i++) {
        this.simulateLiveData()
      }
    }
    this.notifyListeners()
  }

  getStats() {
    const data = this.getCurrentData()
    const totalFrames = data.length
    const totalDetections = data.reduce(
      (acc, f) => acc + f.metadata.objects.length, 0
    )
    const avgConfidence = data.length > 0 
      ? data.reduce((acc, f) => acc + f.metadata.confidence, 0) / data.length
      : 0
    
    return { totalFrames, totalDetections, avgConfidence }
  }

  destroy() {
    this.stopLiveUpdates()
    this.listeners = []
  }
}

// Singleton instance
let manager: DataSourceManager | null = null

export function getDataSourceManager(): DataSourceManager {
  if (!manager) {
    manager = new DataSourceManager()
  }
  return manager
}
