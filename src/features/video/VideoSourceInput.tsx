import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toaster'
import { Video, Link, Upload, Youtube, Camera, Loader2 } from 'lucide-react'

interface VideoSourceInputProps {
  onSourceSelect: (source: VideoSource) => void
  isLoading?: boolean
}

export interface VideoSource {
  type: 'url' | 'file' | 'rtsp' | 'youtube'
  url?: string
  file?: File
  name: string
}

export function VideoSourceInput({ onSourceSelect, isLoading }: VideoSourceInputProps) {
  const [url, setUrl] = useState('')
  const [sourceType, setSourceType] = useState<'url' | 'file' | 'youtube'>('url')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleUrlSubmit = useCallback(() => {
    if (!url) {
      toast({
        title: 'Please enter a URL',
        description: 'Enter a valid video URL to analyze',
        type: 'warning',
      })
      return
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL',
        type: 'error',
      })
      return
    }

    onSourceSelect({
      type: sourceType === 'youtube' ? 'youtube' : 'url',
      url,
      name: url.split('/').pop() || 'Video Source',
    })
  }, [url, sourceType, onSourceSelect])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload a video file (MP4, AVI, MOV, etc.)',
        type: 'error',
      })
      return
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 100MB',
        type: 'error',
      })
      return
    }

    setSelectedFile(file)
    onSourceSelect({
      type: 'file',
      file,
      name: file.name,
    })
  }, [onSourceSelect])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text && text.startsWith('http')) {
        setUrl(text)
        toast({
          title: 'Pasted from clipboard',
          description: text,
          type: 'success',
        })
      }
    } catch {
      // Clipboard read failed
    }
  }, [])

  return (
    <Card className="border-border bg-secondary/30">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Video className="h-4 w-4" />
            <span>Video Source</span>
            <Badge variant="outline" className="ml-auto text-xs">
              {isLoading ? 'Processing...' : 'Ready'}
            </Badge>
          </div>

          {/* Source Type Tabs */}
          <div className="flex gap-1 bg-background rounded-lg p-1">
            <button
              onClick={() => setSourceType('url')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs transition-colors",
                sourceType === 'url' 
                  ? "bg-secondary text-foreground" 
                  : "hover:bg-secondary/50 text-muted-foreground"
              )}
            >
              <Link className="h-3 w-3" />
              URL
            </button>
            <button
              onClick={() => setSourceType('file')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs transition-colors",
                sourceType === 'file' 
                  ? "bg-secondary text-foreground" 
                  : "hover:bg-secondary/50 text-muted-foreground"
              )}
            >
              <Upload className="h-3 w-3" />
              File
            </button>
            <button
              onClick={() => setSourceType('youtube')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs transition-colors",
                sourceType === 'youtube' 
                  ? "bg-secondary text-foreground" 
                  : "hover:bg-secondary/50 text-muted-foreground"
              )}
            >
              <Youtube className="h-3 w-3" />
              YouTube
            </button>
          </div>

          {/* Input based on type */}
          {sourceType === 'url' || sourceType === 'youtube' ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="url"
                  placeholder={sourceType === 'youtube' 
                    ? "Enter YouTube URL (e.g., https://youtube.com/watch?v=...)" 
                    : "Enter video URL (RTSP, HLS, MP4, etc.)"
                  }
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-background pr-20"
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                {url && (
                  <button
                    onClick={handlePaste}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Paste
                  </button>
                )}
              </div>
              <Button 
                onClick={handleUrlSubmit} 
                disabled={isLoading || !url}
                size="sm"
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Video className="h-4 w-4 mr-1" />
                )}
                Analyze
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-background">
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedFile ? selectedFile.name : 'Drop video file or click to browse'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      MP4, AVI, MOV, WebM (Max 100MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              {selectedFile && (
                <Button 
                  onClick={() => {
                    if (selectedFile) {
                      onSourceSelect({
                        type: 'file',
                        file: selectedFile,
                        name: selectedFile.name,
                      })
                    }
                  }}
                  disabled={isLoading}
                  size="sm"
                  className="shrink-0 self-start"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 mr-1" />
                  )}
                  Process
                </Button>
              )}
            </div>
          )}

          {/* Example URLs */}
          <div className="flex flex-wrap gap-1">
            <span className="text-[10px] text-muted-foreground">Examples:</span>
            {[
              { label: 'Sample MP4', url: 'https://sample-videos.com/video321/mp4/240/big_buck_bunny_240p_1mb.mp4' },
              { label: 'RTSP Sim', url: 'rtsp://example.com/stream' },
              { label: 'HLS', url: 'https://example.com/stream.m3u8' },
            ].map((example) => (
              <button
                key={example.label}
                onClick={() => {
                  setUrl(example.url)
                  setSourceType('url')
                }}
                className="text-[10px] text-primary hover:underline"
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper for cn (class names)
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
