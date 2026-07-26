import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { LogsProvider } from '@/hooks/useLogsContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { Dashboard } from '@/pages/Dashboard'
import { JobSearch } from '@/pages/JobSearch'
import { Applications } from '@/pages/Applications'
import { ConsoleLogs } from '@/pages/ConsoleLogs'
import { Landing } from '@/pages/Landing'
import { motion } from 'framer-motion'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

type PageType = 'dashboard' | 'search' | 'applications' | 'logs'
type ViewType = 'landing' | 'app'

const pageTitle: Record<PageType, string> = {
  dashboard: 'Dashboard',
  search: 'Job Search',
  applications: 'Applications',
  logs: 'Console Logs',
}

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('landing')
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [currentPage])

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'search':
        return <JobSearch onApplyClick={() => setCurrentPage('logs')} />
      case 'applications':
        return <Applications />
      case 'logs':
        return <ConsoleLogs />
      default:
        return <Dashboard />
    }
  }

  if (currentView === 'landing') {
    try {
      return (
        <QueryClientProvider client={queryClient}>
          <Landing onLaunchClick={() => setCurrentView('app')} />
          <Toaster position="bottom-right" theme="dark" />
        </QueryClientProvider>
      )
    } catch (error) {
      console.error('[v0] Landing error:', error)
      return (
        <QueryClientProvider client={queryClient}>
          <div className="w-full h-screen bg-black flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">ApplyGenie</h1>
              <p className="text-gray-400 mb-8">Error loading landing page</p>
              <button
                onClick={() => setCurrentView('app')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </QueryClientProvider>
      )
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LogsProvider>
        <div className="h-screen flex flex-col lg:flex-row bg-background">
          {/* Sidebar */}
          <Sidebar
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
            {/* Navbar */}
            <Navbar
              title={pageTitle[currentPage]}
              sidebarOpen={sidebarOpen}
              onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            {/* Page Content */}
            <motion.main
              key={currentPage}
              className="flex-1 overflow-hidden mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.main>
          </div>
        </div>

        {/* Notifications */}
        <Toaster position="bottom-right" theme="dark" />
      </LogsProvider>
    </QueryClientProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
