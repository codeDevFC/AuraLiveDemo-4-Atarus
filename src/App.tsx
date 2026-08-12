import { QueryProvider } from './providers/QueryProvider'
import { Dashboard } from './features/dashboard/Dashboard'
import { Toaster, setupToastStore } from './components/ui/toaster'
import { useState, useEffect } from 'react'

// This connects the toast system
const toastStore = {
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
}

function App() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setupToastStore(toastStore)
    setMounted(true)
  }, [])

  return (
    <QueryProvider>
      <div className="min-h-screen bg-background">
        <Dashboard />
        {mounted && <Toaster />}
      </div>
    </QueryProvider>
  )
}

export default App
