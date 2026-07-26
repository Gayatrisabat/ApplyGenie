import React, { createContext, useContext, useState, useEffect } from 'react'
import type { LogEntry } from '@/types'

interface LogsContextType {
  logs: LogEntry[]
  addLog: (log: LogEntry) => void
  clearLogs: () => void
}

const LogsContext = createContext<LogsContextType | undefined>(undefined)

export const LogsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    // Connect to SSE endpoint for logs
    const eventSource = new EventSource(
      window.location.port === '5173' ? 'http://127.0.0.1:8000/api/logs/stream' : '/api/logs/stream',
    )

    eventSource.onmessage = (event) => {
      try {
        const log = JSON.parse(event.data)
        setLogs((prev) => [...prev, log])
      } catch {
        console.error('Failed to parse log message')
      }
    }

    eventSource.onerror = () => {
      console.log('Logs connection closed, reconnecting in 3s...')
      eventSource.close()
      setTimeout(() => {
        // Reconnect logic handled by browser
      }, 3000)
    }

    return () => eventSource.close()
  }, [])

  const addLog = (log: LogEntry) => {
    setLogs((prev) => [...prev, log])
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <LogsContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </LogsContext.Provider>
  )
}

export const useLogs = () => {
  const context = useContext(LogsContext)
  if (!context) {
    throw new Error('useLogs must be used within LogsProvider')
  }
  return context
}
