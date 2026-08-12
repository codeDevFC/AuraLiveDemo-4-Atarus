import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDuration, formatTimestamp } from '@/lib/utils'
import { VideoFrame, DetectedObject } from '@/types/video'
import { cn } from '@/lib/utils'
import { Play, Pause, AlertCircle, Activity } from 'lucide-react'

interface VideoTimelineProps {
  frames: VideoFrame[]
  onFrameSelect?: (frame: VideoFrame) => void
  selectedFrameId?: string
  isLive?: boolean
  className?: string
}

const TIMELINE_HEIGHT = 120
const MARKER_WIDTH = 4 // pixels per frame marker
const MIN_VISIBLE_FRAMES = 100

export function VideoTimeline({
  frames = [],
  onFrameSelect,
  selectedFrameId,
  isLive = false,
  className,
}: VideoTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: MIN_VISIBLE_FRAMES })
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const animationRef = useRef<number>()

  // Memoize frames for performance
  const sortedFrames = useMemo(() => {
    return [...frames].sort((a, b) => a.timestamp - b.timestamp)
  }, [frames])

  // Calculate total duration
  const totalDuration = useMemo(() => {
    if (sortedFrames.length < 2) return 0
    return sortedFrames[sortedFrames.length - 1].timestamp - sortedFrames[0].timestamp
  }, [sortedFrames])

  // Get frames with detections for markers
  const framesWithDetections = useMemo(() => {
    return sortedFrames.filter(f => f.metadata.objects && f.metadata.objects.length > 0)
  }, [sortedFrames])

  // Render the timeline canvas
  const renderTimeline = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || sortedFrames.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.parentElement?.getBoundingClientRect()
    if (!rect) return

    // Set canvas size
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = TIMELINE_HEIGHT * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${TIMELINE_HEIGHT}px`
    ctx.scale(dpr, dpr)

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, rect.width, TIMELINE_HEIGHT)

    // Calculate visible frames
    const visibleFrames = sortedFrames.slice(visibleRange.start, visibleRange.end)
    if (visibleFrames.length === 0) return

    const totalWidth = rect.width - 40 // padding
    const startX = 20
    const pixelPerFrame = totalWidth / visibleFrames.length

    // Draw frame markers
    visibleFrames.forEach((frame, index) => {
      const x = startX + index * pixelPerFrame
      const hasDetections = frame.metadata.objects.length > 0
      const isSelected = frame.id === selectedFrameId

      // Determine color based on detections
      let color = '#2a2a3a' // Default
      if (hasDetections) {
        const maxConfidence = Math.max(...frame.metadata.objects.map(o => o.confidence))
        if (maxConfidence > 0.8) color = '#ef4444' // Red - high confidence
        else if (maxConfidence > 0.6) color = '#f59e0b' // Yellow - medium confidence
        else color = '#3b82f6' // Blue - low confidence
      }

      // Draw frame marker
      ctx.beginPath()
      ctx.rect(x, 10, Math.max(pixelPerFrame * 0.8, 1), TIMELINE_HEIGHT - 20)
      
      if (isSelected) {
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = '#3b82f6'
        ctx.shadowBlur = 10
      } else {
        ctx.fillStyle = color
        ctx.shadowBlur = 0
      }
      
      ctx.fill()
      ctx.shadowBlur = 0

      // Draw detection indicator dot
      if (hasDetections) {
        ctx.beginPath()
        ctx.arc(x + 5, TIMELINE_HEIGHT - 15, 3, 0, Math.PI * 2)
        ctx.fillStyle = '#f59e0b'
        ctx.fill()
      }
    })

    // Draw time markers
    ctx.fillStyle = '#6b7280'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    
    const timeMarkers = 5
    for (let i = 0; i <= timeMarkers; i++) {
      const frameIndex = Math.floor((i / timeMarkers) * visibleFrames.length)
      if (frameIndex < visibleFrames.length) {
        const x = startX + (i / timeMarkers) * totalWidth
        const frame = visibleFrames[frameIndex]
        ctx.fillText(
          formatDuration(frame.timestamp - sortedFrames[0].timestamp),
          x,
          TIMELINE_HEIGHT - 5
        )
      }
    }

    // Draw current time indicator
    if (currentTime > 0) {
      const timeX = startX + (currentTime / totalDuration) * totalWidth
      ctx.beginPath()
      ctx.moveTo(timeX, 0)
      ctx.lineTo(timeX, TIMELINE_HEIGHT)
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Draw live indicator
    if (isLive) {
      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 12px monospace'
      ctx.textAlign = 'right'
      ctx.fillText('● LIVE', rect.width - 10, 20)
    }

  }, [sortedFrames, visibleRange, selectedFrameId, currentTime, totalDuration, isLive])

  // Handle scroll to load more frames
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement
    const scrollLeft = target.scrollLeft
    const scrollWidth = target.scrollWidth
    const clientWidth = target.clientWidth

    // Calculate visible range based on scroll position
    const totalFrames = sortedFrames.length
    const visibleCount = Math.floor((clientWidth / (clientWidth * 0.8)) * totalFrames)
    const startIndex = Math.floor((scrollLeft / (scrollWidth - clientWidth)) * totalFrames)

    setVisibleRange({
      start: Math.max(0, startIndex),
      end: Math.min(totalFrames, startIndex + visibleCount + 10),
    })
  }, [sortedFrames.length])

  // Play/pause animation
  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  // Animation loop
  useEffect(() => {
    if (isPlaying && sortedFrames.length > 0) {
      const startTime = Date.now()
      const startTimestamp = currentTime

      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000 // seconds
        const newTime = Math.min(startTimestamp + elapsed * 30, totalDuration) // 30 fps playback

        setCurrentTime(newTime)

        // Find closest frame
        const closestFrame = sortedFrames.find(f => 
          (f.timestamp - sortedFrames[0].timestamp) >= newTime
        )

        if (closestFrame && onFrameSelect) {
          onFrameSelect(closestFrame)
        }

        if (newTime < totalDuration) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          setIsPlaying(false)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, currentTime, totalDuration, sortedFrames, onFrameSelect])

  // Handle canvas resize and render
  useEffect(() => {
    const handleResize = () => {
      renderTimeline()
    }

    window.addEventListener('resize', handleResize)
    renderTimeline()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [renderTimeline])

  // Handle click on canvas to select frame
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const totalWidth = rect.width - 40
    const startX = 20

    if (x < startX || x > startX + totalWidth) return

    const progress = (x - startX) / totalWidth
    const frameIndex = Math.floor(progress * sortedFrames.length)
    const frame = sortedFrames[Math.min(frameIndex, sortedFrames.length - 1)]

    if (frame && onFrameSelect) {
      onFrameSelect(frame)
      setCurrentTime(frame.timestamp - sortedFrames[0].timestamp)
    }
  }, [sortedFrames, onFrameSelect])

  if (sortedFrames.length === 0) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[120px] text-muted-foreground">
            <div className="text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Waiting for video frames...</p>
              <p className="text-xs">AI detections will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-1 rounded hover:bg-secondary transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
            <span className="text-sm font-mono text-muted-foreground">
              {formatDuration(currentTime)} / {formatDuration(totalDuration)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {sortedFrames.length} frames
            </Badge>
            <Badge variant="outline" className="text-xs">
              {framesWithDetections.length} with detections
            </Badge>
          </div>
        </div>

        <ScrollArea className="w-full rounded-md" onScroll={handleScroll}>
          <div 
            ref={containerRef}
            className="relative"
            style={{ 
              width: `${Math.max(sortedFrames.length * MARKER_WIDTH, 800)}px`,
              height: TIMELINE_HEIGHT,
            }}
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="cursor-pointer hover:opacity-90 transition-opacity"
              style={{ 
                width: '100%',
                height: TIMELINE_HEIGHT,
              }}
            />
          </div>
        </ScrollArea>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            High confidence (&gt;80%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Medium confidence (&gt;60%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Low confidence
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Detection dot
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
