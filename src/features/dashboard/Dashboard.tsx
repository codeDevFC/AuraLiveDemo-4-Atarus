import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toaster'
import { VideoIntelligenceDemo } from '@/features/video/VideoIntelligenceDemo'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Video, Bell, Search, Settings, Activity, Camera, Cpu, LayoutDashboard } from 'lucide-react'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('video')

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Aura Command Center</h1>
          <p className="text-muted-foreground mt-1">
            AI-Powered Video Intelligence Platform
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="success" className="gap-1">
            <Activity className="h-3 w-3" />
            Live
          </Badge>
          <Badge variant="info" className="gap-1">
            <Cpu className="h-3 w-3" />
            AI Active
          </Badge>
          <Button variant="outline" size="sm" onClick={() => toast({
            title: 'System Status',
            description: 'All systems operational',
            type: 'success'
          })}>
            <Activity className="h-4 w-4 mr-1" />
            Status
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="video" className="gap-2">
            <Video className="h-4 w-4" />
            Video Intelligence
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="space-y-4">
          <VideoIntelligenceDemo />
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alert Center</CardTitle>
              <CardDescription>Real-time AI alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={i === 1 ? "destructive" : i === 2 ? "warning" : "info"}>
                        {i === 1 ? 'Critical' : i === 2 ? 'Warning' : 'Info'}
                      </Badge>
                      <span className="text-sm">
                        {i === 1 ? 'Unauthorized access detected' : 
                         i === 2 ? 'High traffic anomaly' : 
                         'New object detected'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">2 min ago</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>AI Search</CardTitle>
              <CardDescription>Search across video footage using natural language</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search for objects, events, or scenes..."
                    className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Example searches:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>"Show me all people in Zone A"</li>
                    <li>"Vehicles detected yesterday afternoon"</li>
                    <li>"Suspicious activity near entrance"</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Detections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-xs text-muted-foreground">+12% from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Processing Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">134ms</p>
                <p className="text-xs text-muted-foreground">Average inference time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active Cameras</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">12/12</p>
                <p className="text-xs text-muted-foreground">All systems online</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>Aura Command Center v0.2.0 — Built for Atarus Frontend Engineer Assessment</p>
        <p className="mt-1 text-xs">
          React 18 • TypeScript • Tailwind • React Query • WebSockets • Real-time AI
        </p>
      </div>
    </div>
  )
}
