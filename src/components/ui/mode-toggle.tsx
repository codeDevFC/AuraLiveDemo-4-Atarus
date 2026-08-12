import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Globe, Video } from 'lucide-react'

export type DataMode = 'demo' | 'live' | 'hybrid'

interface ModeToggleProps {
  mode: DataMode
  onModeChange: (mode: DataMode) => void
  className?: string
}

export function ModeToggle({ mode, onModeChange, className }: ModeToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  const modes = [
    { 
      id: 'demo' as DataMode, 
      label: 'Demo Mode', 
      icon: Sparkles,
      description: 'Mock data for UI demonstration',
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    },
    { 
      id: 'live' as DataMode, 
      label: 'Live Mode', 
      icon: Globe,
      description: 'Real video analysis with AI',
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    },
    { 
      id: 'hybrid' as DataMode, 
      label: 'Hybrid Mode', 
      icon: Video,
      description: 'Demo UI with real data simulation',
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  ]

  const currentMode = modes.find(m => m.id === mode) || modes[0]
  const Icon = currentMode.icon

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all",
          currentMode.color,
          "hover:scale-105 active:scale-95"
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{currentMode.label}</span>
        <span className="text-xs opacity-70">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-72 bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-2 space-y-1">
            {modes.map((m) => {
              const isActive = mode === m.id
              const ModeIcon = m.icon
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onModeChange(m.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left",
                    isActive 
                      ? "bg-secondary" 
                      : "hover:bg-secondary/50"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-full shrink-0",
                    isActive ? "bg-primary/20" : "bg-secondary"
                  )}>
                    <ModeIcon className={cn(
                      "h-4 w-4",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{m.label}</span>
                      {isActive && (
                        <Badge variant="outline" className="text-[10px] h-4">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {m.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-border bg-secondary/30">
            <p className="text-[10px] text-muted-foreground text-center">
              {mode === 'demo' && '🎯 Using mock data - no AI processing needed'}
              {mode === 'live' && '🔴 Analyzing real video with AI backend'}
              {mode === 'hybrid' && '🔄 Demo UI with simulated live data flow'}
            </p>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
