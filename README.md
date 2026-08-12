# Aura Command Center

## AI-Powered Video Intelligence Platform

A next-generation video intelligence platform combining computer vision, multimodal AI, and real-time data processing. Built for the Atarus Frontend Engineer assessment to demonstrate advanced React, TypeScript, and real-time data handling capabilities.

---

## Features

### Video Intelligence
- Real-time Video Timeline - Interactive timeline with AI detection markers
- AI Detection Overlay - Bounding boxes with confidence scores and labels
- Object Tracking - Track objects across frames with unique IDs
- Live Updates - Simulated real-time video stream with AI detections

### WebSocket Integration
- Real-time Communication - Bidirectional WebSocket connection
- Automatic Reconnection - Robust reconnection logic with exponential backoff
- Message Handling - Type-safe message parsing and handling

### Modern UI/UX
- Dark Theme - Optimized for video/AI interfaces
- Responsive Design - Works on all screen sizes
- Keyboard Shortcuts - '1' to select first detection, 'Esc' to clear
- Toast Notifications - Real-time feedback system

### Performance Optimizations
- Canvas-based Rendering - Efficient timeline visualization
- Memoization - Optimized component re-rendering
- Virtualization - Handles large datasets efficiently
- Lazy Loading - Code splitting for faster initial load

---

## Tech Stack

### Core
- React 18 - UI Framework
- TypeScript - Type Safety
- Vite - Build Tool

### State & Data
- TanStack React Query - Server State Management
- Zustand - Client State Management
- WebSocket - Real-time Communication

### UI Components
- Tailwind CSS - Styling
- Radix UI - Accessible Primitives
- Lucide Icons - Icon Library

### Visualization
- Canvas API - Timeline Rendering
- Recharts - Data Visualization

---

## Architecture

src/
  components/
    ui/          - Atomic design system
  features/
    dashboard/   - Main dashboard
    video/       - Video intelligence features
  hooks/
    useWebSocket - WebSocket management
  types/         - TypeScript interfaces
  providers/     - React context providers
  lib/           - Utilities
  styles/        - Global styles

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

Clone the repository:
git clone git@github.com:codeDevFC/AuraLiveDemo-4-Atarus.git

Navigate to project:
cd AuraLiveDemo-4-Atarus

Install dependencies:
npm install

Start development server:
npm run dev

### Available Scripts

npm run dev          - Start development server
npm run build        - Build for production
npm run preview      - Preview production build
npm run lint         - Run ESLint
npm run type-check   - Run TypeScript type checking

---

## Key Features Demo

### Video Timeline
- Frame Markers - Color-coded based on detection confidence
- Interactive Scrubbing - Click anywhere on timeline to jump to frame
- Play/Pause - Animated playback through video frames
- Detection Indicators - Yellow dots show frames with detections

### AI Detection Overlay
- Bounding Boxes - Visual representation of detected objects
- Confidence Scores - Percentage display with color coding
- Object Labels - Object type identification
- Tracking IDs - Persistent object tracking across frames

### WebSocket Connection
- Connection Status - Real-time connection indicator
- Auto-reconnect - Automatic reconnection on disconnect
- Message Handling - Structured message processing

---

## What This Project Demonstrates

This project demonstrates:

1. Architectural Thinking - Clean separation of concerns with feature-based structure
2. Performance Awareness - Canvas rendering, memoization, and virtualization
3. UX/Product Instincts - Keyboard shortcuts, real-time feedback, and intuitive interactions
4. Technical Depth - WebSocket handling, complex rendering, and state management
5. Professional Code - TypeScript, consistent patterns, and documentation

---

## Key Technical Decisions

### Why Canvas for Timeline?
- Performance - Handles thousands of frames efficiently
- Customization - Complete control over rendering
- Consistency - Pixel-perfect rendering across devices

### Why WebSocket with Reconnection?
- Reliability - Maintains connection in unstable networks
- User Experience - Graceful degradation with clear feedback
- Scalability - Handles real-time data streams effectively

### Why React Query for Data?
- Caching - Intelligent data caching for AI results
- Synchronization - Automatic background updates
- Dev Tools - Built-in debugging capabilities

---

## Testing

Run tests:
npm run test

Run tests with UI:
npm run test:ui

Run tests with coverage:
npm run test:coverage

---

## License

UNLICENSED - Private project for Atarus assessment

## Author

Felix Cobbinah
- GitHub: codeDevFC

---

Built with passion for the Atarus Frontend Engineer role
