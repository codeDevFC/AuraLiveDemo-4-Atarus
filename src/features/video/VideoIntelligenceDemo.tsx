import { useState, useEffect, useCallback, useMemo } from 'react'
import { VideoTimeline } from './VideoTimeline'
import { AIDetectionOverlay } from './AIDetectionOverlay'
import { VideoFrame, DetectedObject } from '@/types/video'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useWebSocket } from '@/hooks/useWebSocket'
import { WebSocketMessage } from '@/types/api'
import { toast } from '@/components/ui/toaster'
import { formatTimestamp } from '@/lib/utils'
import { 
  Play, Pause, RefreshCw, Activity, 
  Camera, AlertCircle, TrendingUp, 
  Cpu, Zap, Maximize2 
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data generator for demo
function generateMockFrames(count: number = 50): VideoFrame[] {
  const frames: VideoFrame[] = []
  const objects = ['person', 'vehicle', 'animal', 'object']
  
  for (let i = 0; i < count; i++) {
    const timestamp = Date.now() - (count - i) * 1000
    const hasDetections = Math.random() > 0.6
    
    frames.push({
      id: `frame-${i}`,
      timestamp,
      metadata: {
        width: 1920,
        height: 1080,
        fps: 30,
        confidence: 0.7 + Math.random() * 0.3,
        objects: hasDetections ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
          id: `obj-${i}-${j}`,
          label: objects[Math.floor(Math.random() * objects.length)],
          confidence: 0.5 + Math.random() * 0.5,
          boundingBox: {
            x: Math.random() * 0.8,
            y: Math.random() * 0.8,
            width: 0.1 + Math.random() * 0.3,
            height: 0.1 + Math.random() * 0.3,
          },
          trackingId: `track-${Math.floor(Math.random() * 10)}`,
        })) : [],
      },
    })
  }
  
  return frames
}

export function VideoIntelligenceDemo() {
  const [frames, setFrames] = useState<VideoFrame[]>([])
  const [selectedFrame, setSelectedFrame] = useState<VideoFrame | null>(null)
  const [selectedObject, setSelectedObject] = useState<DetectedObject | null>(null)
  const [isLive, setIsLive] = useState(true)
  const [stats, setStats] = useState({
    totalFrames: 0,
    totalDetections: 0,
    avgConfidence: 0,
  })

  // WebSocket connection
  const { 
    isConnected, 
    lastMessage, 
    sendMessage,
    reconnectAttempts 
  } = useWebSocket({
    url: 'wss://echo.websocket.org', // Demo echo server
    onMessage: (data) => {
      console.log('WebSocket message received:', data)
      
      // Handle different message types
      if (data.type === 'detection') {
        toast({
          title: 'New Detection',
          description: `AI detected objects in frame`,
          type: 'info',
        })
      }
    },
    onOpen: () => {
      toast({
        title: 'Connected',
        description: 'WebSocket connection established',
        type: 'success',
      })
    },
    onClose: () => {
      toast({
        title: 'Disconnected',
        description: 'WebSocket connection lost',
        type: 'warning',
      })
    },
    onError: (error) => {
      console.error('WebSocket error:', error)
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to WebSocket server',
        type: 'error',
      })
    },
  })

  // Generate initial frames
  useEffect(() => {
    const initialFrames = generateMockFrames(80)
    setFrames(initialFrames)
    if (initialFrames.length > 0) {
      setSelectedFrame(initialFrames[Math.floor(initialFrames.length / 2)])
    }

    // Update stats
    const totalDetections = initialFrames.reduce(
      (acc, f) => acc + f.metadata.objects.length, 0
    )
    const avgConf = initialFrames.reduce(
      (acc, f) => acc + f.metadata.confidence, 0
    ) / initialFrames.length

    setStats({
      totalFrames: initialFrames.length,
      totalDetections,
      avgConfidence: avgConf,
    })
  }, [])

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      const newFrame: VideoFrame = {
        id: `frame-${Date.now()}`,
        timestamp: Date.now(),
        metadata: {
          width: 1920,
          height: 1080,
          fps: 30,
          confidence: 0.6 + Math.random() * 0.4,
          objects: Math.random() > 0.5 ? Array.from({ length: Math.floor(Math.random() * 4) }, (_, i) => ({
            id: `obj-${Date.now()}-${i}`,
            label: ['person', 'vehicle', 'animal', 'object', 'face'][Math.floor(Math.random() * 5)],
            confidence: 0.5 + Math.random() * 0.5,
            boundingBox: {
              x: Math.random() * 0.8,
              y: Math.random() * 0.8,
              width: 0.05 + Math.random() * 0.3,
              height: 0.05 + Math.random() * 0.3,
            },
            trackingId: `track-${Math.floor(Math.random() * 20)}`,
          })) : [],
        },
      }

      setFrames(prev => [...prev.slice(-100), newFrame])
      
      // Auto-select latest frame
      if (selectedFrame?.id === frames[frames.length - 1]?.id) {
        setSelectedFrame(newFrame)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive, selectedFrame, frames])

  // Update stats when frames change
  useEffect(() => {
    if (frames.length === 0) return
    
    const totalDetections = frames.reduce(
      (acc, f) => acc + f.metadata.objects.length, 0
    )
    const avgConf = frames.reduce(
      (acc, f) => acc + f.metadata.confidence, 0
    ) / frames.length

    setStats({
      totalFrames: frames.length,
      totalDetections,
      avgConfidence: avgConf,
    })
  }, [frames])

  const handleFrameSelect = useCallback((frame: VideoFrame) => {
    setSelectedFrame(frame)
    setSelectedObject(null)
  }, [])

  const handleObjectSelect = useCallback((object: DetectedObject) => {
    setSelectedObject(object)
    toast({
      title: 'Object Selected',
      description: `${object.label} with ${(object.confidence * 100).toFixed(1)}% confidence`,
      type: 'info',
    })
  }, [])

  const handleRegenerate = useCallback(() => {
    const newFrames = generateMockFrames(80)
    setFrames(newFrames)
    setSelectedObject(null)
    if (newFrames.length > 0) {
      setSelectedFrame(newFrames[Math.floor(newFrames.length / 2)])
    }
    
    toast({
      title: 'Regenerated',
      description: 'New video frames generated',
      type: 'success',
    })
  }, [])

  const toggleLive = useCallback(() => {
    setIsLive(!isLive)
    toast({
      title: isLive ? 'Paused' : 'Live',
      description: isLive ? 'Live updates paused' : 'Live updates resumed',
      type: 'info',
    })
  }, [isLive])

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Frames</p>
                <p className="text-lg font-bold">{stats.totalFrames}</p>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Detections</p>
                <p className="text-lg font-bold">{stats.totalDetections}</p>
              </div>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Confidence</p>
                <p className="text-lg font-bold">{(stats.avgConfidence * 100).toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    isConnected ? "bg-green-500" : "bg-red-500"
                  )} />
                  <p className="text-sm font-medium">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Mode</p>
                <p className="text-sm font-medium">{isLive ? 'Live' : 'Paused'}</p>
              </div>
              <Zap className={cn(
                "h-4 w-4",
                isLive ? "text-green-500" : "text-muted-foreground"
              )} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Video Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Video Display */}
          <AIDetectionOverlay
            frame={selectedFrame}
            onObjectSelect={handleObjectSelect}
            selectedObjectId={selectedObject?.id}
            showLabels={true}
            showConfidence={true}
            minConfidence={0.3}
            className="aspect-video"
          />

          {/* Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLive}
              >
                {isLive ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {isLive ? 'Pause' : 'Resume'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Regenerate
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant={isConnected ? "success" : "destructive"}>
                {isConnected ? '● Connected' : '● Disconnected'}
              </Badge>
              {reconnectAttempts > 0 && (
                <span>Reconnect attempts: {reconnectAttempts}</span>
              )}
            </div>
          </div>

          {/* Timeline */}
          <VideoTimeline
            frames={frames}
            onFrameSelect={handleFrameSelect}
            selectedFrameId={selectedFrame?.id}
            isLive={isLive}
          />
        </div>

        {/* Side Panel - Object Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Selected Object</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setSelectedObject(null)}
                >
                  <span className="sr-only">Clear</span>
                  <AlertCircle className="h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedObject ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{selectedObject.label}</span>
                    <Badge variant="outline">
                      {(selectedObject.confidence * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>ID: {selectedObject.id}</p>
                    {selectedObject.trackingId && (
                      <p>Tracking: {selectedObject.trackingId}</p>
                    )}
                    <p>Position: ({selectedObject.boundingBox.x.toFixed(3)}, {selectedObject.boundingBox.y.toFixed(3)})</p>
                    <p>Size: {selectedObject.boundingBox.width.toFixed(3)} × {selectedObject.boundingBox.height.toFixed(3)}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Click on any detection</p>
                  <p className="text-xs">or press '1' to select first</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recent Detections</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-1">
                  {frames
                    .flatMap(f => f.metadata.objects.map(o => ({ ...o, timestamp: f.timestamp })))
                    .slice(-10)
                    .reverse()
                    .map((obj, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-1 hover:bg-secondary rounded cursor-pointer text-xs"
                        onClick={() => {
                          const frame = frames.find(f => 
                            f.metadata.objects.some(o => o.id === obj.id)
                          )
                          if (frame) {
                            setSelectedFrame(frame)
                            setSelectedObject(obj)
                          }
                        }}
                      >
                        <span>{obj.label}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {(obj.confidence * 100).toFixed(0)}%
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTimestamp(obj.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
