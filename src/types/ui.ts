export interface Theme {
  mode: 'dark' | 'light'
  accentColor: string
}

export interface SidebarState {
  collapsed: boolean
  activeItem: string
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: number
  read: boolean
}

export type ViewMode = 'grid' | 'list' | 'timeline'

export interface LayoutState {
  sidebarCollapsed: boolean
  activeView: ViewMode
  selectedVideoId?: string
}
