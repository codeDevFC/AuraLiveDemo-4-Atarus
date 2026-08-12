import { useEffect, useRef, useState, useCallback } from 'react'
import { DetectedObject, VideoFrame } from '@/types/video'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { X, Target } from 'lucide-react'

interface AIDetectionOverlayProps {
  frame: VideoFrame | null
  onObjectSelect?: (object: DetectedObject) => void
  selectedObjectId?: string
  className?: string
  showLabels?: boolean
  showConfidence?: boolean
  minConfidence?: number
}

interface BoundingBoxProps {
  object: DetectedObject
  isSelected: boolean
  onClick?: (object: DetectedObject) => void
  showLabel?: boolean
  showConfidence?: boolean
}

function BoundingBox({
  object,
  isSelected,
  onClick,
  showLabel = true,
  showConfidence = true,
}: BoundingBoxProps) {
  const { boundingBox, label, confidence, id } = object

  // Get color based on confidence
  const getColor = (conf: number) => {
    if (conf > 0.8) return 'border-red-500 bg-red-500/20'
    if (conf > 0.6) return 'border-amber-500 bg-amber-500/20'
    return 'border-blue-500 bg-blue-500/20'
  }

  const colorClasses = getColor(confidence)
  const isHighConfidence = confidence > 0.8

  return (
    <div
      className={cn(
        'absolute border-2 rounded cursor-pointer transition-all duration-150',
        colorClasses,
        isSelected && 'border-white ring-2 ring-primary/50',
        isHighConfidence && 'animate-pulse-subtle'
      )}
      style={{
        left: `${boundingBox.x * 100}%`,
        top: `${boundingBox.y * 100}%`,
        width: `${boundingBox.width * 100}%`,
        height: `${boundingBox.height * 100}%`,
      }}
      onClick={() => onClick?.(object)}
    >
      {/* Label tag */}
      {(showLabel || showConfidence) && (
        <div className="absolute -top-6 left-0 flex items-center gap-1 text-xs whitespace-nowrap">
          {showLabel && (
            <Badge 
              variant="outline" 
              className={cn(
                'text-[10px] px-1 py-0 h-5 font-mono border',
                isHighConfidence ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-500'
              )}
            >
              {label}
            </Badge>
          )}
          {showConfidence && (
            <Badge 
              variant="outline" 
              className="text-[10px] px-1 py-0 h-5 font-mono border-green-500 text-green-500"
            >
              {(confidence * 100).toFixed(1)}%
            </Badge>
          )}
        </div>
      )}

      {/* Center target dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Target className="h-3 w-3 opacity-50" />
      </div>

      {/* Corner indicators */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current opacity-50" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-current opacity-50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-current opacity-50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current opacity-50" />

      {/* Tracking ID if available */}
      {object.trackingId && (
        <div className="absolute -bottom-5 right-0 text-[8px] font-mono text-muted-foreground">
          ID: {object.trackingId.slice(0, 6)}
        </div>
      )}
    </div>
  )
}

export function AIDetectionOverlay({
  frame,
  onObjectSelect,
  selectedObjectId,
  className,
  showLabels = true,
  showConfidence = true,
  minConfidence = 0.3,
}: AIDetectionOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  // Filter objects by confidence
  const objects = frame?.metadata.objects?.filter(
    obj => obj.confidence >= minConfidence
  ) ?? []

  // Handle container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({
          width: rect.width,
          height: rect.height,
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)

    return () => {
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Select first object with '1' key
      if (e.key === '1' && objects.length > 0) {
        onObjectSelect?.(objects[0])
      }
      // Clear selection with Escape
      if (e.key === 'Escape') {
        onObjectSelect?.(undefined as any)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [objects, onObjectSelect])

  if (!frame || objects.length === 0) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          "relative w-full bg-background/50 rounded-lg border border-border",
          "flex items-center justify-center min-h-[200px]",
          className
        )}
      >
        <div className="text-center text-muted-foreground">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No detections in this frame</p>
          <p className="text-xs">AI is analyzing...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full aspect-video bg-black rounded-lg overflow-hidden",
        className
      )}
    >
      {/* Video frame image */}
      {frame.dataUrl && (
        <img
          src={frame.dataUrl}
          alt={`Frame at ${new Date(frame.timestamp).toISOString()}`}
          className="w-full h-full object-contain"
        />
      )}

      {/* Detection overlay */}
      <div className="absolute inset-0">
        {objects.map((obj) => (
          <BoundingBox
            key={obj.id}
            object={obj}
            isSelected={obj.id === selectedObjectId}
            onClick={onObjectSelect}
            showLabel={showLabels}
            showConfidence={showConfidence}
          />
        ))}
      </div>

      {/* Status bar */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs text-muted-foreground bg-black/50 backdrop-blur-sm p-2 rounded">
        <div className="flex items-center gap-2">
          <span>{objects.length} objects detected</span>
          <span>•</span>
          <span>Min confidence: {(minConfidence * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="animate-pulse-subtle text-green-500">●</span>
          <span>AI Active</span>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="absolute top-2 right-2 text-[10px] text-muted-foreground bg-black/50 backdrop-blur-sm p-1 rounded">
        Press <kbd className="px-1 bg-secondary rounded">1</kbd> select first, <kbd className="px-1 bg-secondary rounded">Esc</kbd> clear
      </div>
    </div>
  )
}
