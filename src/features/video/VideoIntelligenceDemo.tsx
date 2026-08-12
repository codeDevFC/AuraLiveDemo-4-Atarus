import { useState, useEffect, useCallback } from 'react'
import { VideoTimeline } from './VideoTimeline'
import { AIDetectionOverlay } from './AIDetectionOverlay'
import { VideoFrame, DetectedObject } from '@/types/video'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useWebSocket } from '@/hooks/useWebSocket'
import { toast } from '@/components/ui/toaster'
import { formatTimestamp } from '@/lib/utils'
import { ModeToggle, DataMode } from '@/components/ui/mode-toggle'
import { getDataSourceManager } from '@/lib/dataSourceManager'
import { 
  Play, Pause, RefreshCw, Activity, 
  AlertCircle, TrendingUp, 
  Cpu, Zap, Database
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function VideoIntelligenceDemo() {
  const [frames, setFrames] = useState<VideoFrame[]>([])
  const [selectedFrame, setSelectedFrame] = useState<VideoFrame | null>(null)
  const [selectedObject, setSelectedObject] = useState<DetectedObject | null>(null)
  const [isLive, setIsLive] = useState(true)
  const [mode, setMode] = useState<DataMode>('demo')
  const [stats, setStats] = useState({
    totalFrames: 0,
    totalDetections: 0,
    avgConfidence: 0,
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const dataManager = getDataSourceManager()

  // WebSocket connection for live mode
  const { 
    isConnected, 
    reconnectAttempts 
  } = useWebSocket({
    url: mode === 'live' ? 'wss://echo.websocket.org' : '',
    onMessage: (data) => {
      console.log('WebSocket message received:', data)
      if (data.type === 'detection') {
        toast({
          title: 'New Detection',
          description: 'AI detected objects in frame',
          type: 'info',
        })
      }
    },
    onOpen: () => {
      toast({
        title: 'WebSocket Connected',
        description: 'Real-time data stream active',
        type: 'success',
      })
    },
    onClose: () => {
      toast({
        title: 'WebSocket Disconnected',
        description: 'Switching to demo mode',
        type: 'warning',
      })
    },
    onError: (error) => {
      console.error('WebSocket error:', error)
      if (mode === 'live') {
        toast({
          title: 'Connection Error',
          description: 'Falling back to demo mode',
          type: 'error',
        })
        setMode('demo')
      }
    },
  })

  // Subscribe to data source manager
  useEffect(() => {
    const unsubscribe = dataManager.subscribe((newFrames) => {
      setFrames(newFrames)
      
      // Update stats
      const stats = dataManager.getStats()
      setStats(stats)
      
      // Auto-select latest frame if in live mode
      if (isLive && newFrames.length > 0) {
        setSelectedFrame(newFrames[newFrames.length - 1])
      }
    })

    // Set initial mode
    dataManager.setMode('demo')
    setMode('demo')

    return () => {
      unsubscribe()
      dataManager.destroy()
    }
  }, [])

  // Handle mode change
  const handleModeChange = useCallback((newMode: DataMode) => {
    setIsProcessing(true)
    setMode(newMode)
    dataManager.setMode(newMode)
    
    const modeLabels = {
      demo: 'Demo Mode',
      live: 'Live Mode',
      hybrid: 'Hybrid Mode'
    }
    
    const modeDescriptions = {
      demo: 'Using mock data for demonstration',
      live: 'Analyzing real video with AI backend',
      hybrid: 'Demo UI with realistic data simulation'
    }
    
    toast({
      title: `Switched to ${modeLabels[newMode]}`,
      description: modeDescriptions[newMode],
      type: 'info',
    })
    
    setTimeout(() => setIsProcessing(false), 500)
  }, [])

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
    dataManager.regenerate()
    toast({
      title: 'Regenerated',
      description: `New ${mode === 'demo' ? 'demo' : 'live'} data generated`,
      type: 'success',
    })
  }, [mode])

  const toggleLive = useCallback(() => {
    setIsLive(!isLive)
    toast({
      title: isLive ? 'Paused' : 'Resumed',
      description: isLive ? 'Live updates paused' : 'Live updates resumed',
      type: 'info',
    })
  }, [isLive])

  const getModeColor = (mode: DataMode) => {
    switch(mode) {
      case 'demo': return 'text-amber-500'
      case 'live': return 'text-emerald-500'
      case 'hybrid': return 'text-blue-500'
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode Selector and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ModeToggle mode={mode} onModeChange={handleModeChange} />
          <Badge variant="outline" className={cn(
            "gap-1",
            getModeColor(mode)
          )}>
            <Database className="h-3 w-3" />
            {mode === 'demo' && 'Mock Data'}
            {mode === 'live' && 'Real AI'}
            {mode === 'hybrid' && 'Hybrid'}
          </Badge>
          {isProcessing && (
            <Badge variant="outline" className="animate-pulse">
              Processing...
            </Badge>
          )}
        </div>
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
      </div>

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
                    mode === 'demo' ? "bg-amber-500" : 
                    isConnected ? "bg-green-500" : "bg-red-500"
                  )} />
                  <p className="text-sm font-medium">
                    {mode === 'demo' ? 'Demo' : 
                     isConnected ? 'Connected' : 'Disconnected'}
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

          {/* Timeline */}
          <VideoTimeline
            frames={frames}
            onFrameSelect={handleFrameSelect}
            selectedFrameId={selectedFrame?.id}
            isLive={isLive}
          />
        </div>

        {/* Side Panel */}
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
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
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
