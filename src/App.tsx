import { QueryProvider } from './providers/QueryProvider'
import { Dashboard } from './features/dashboard/Dashboard'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-background">
        <Dashboard />
        <Toaster />
      </div>
    </QueryProvider>
  )
}

export default App
