import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getLevelColor, formatTime } from '@/utils/format'
import { useLogs } from '@/hooks/useLogsContext'
import type { LogEntry } from '@/types'

interface ConsoleLogsProps {
  onClear?: () => void
}

export const ConsoleLogs: React.FC<ConsoleLogsProps> = ({ onClear }) => {
  const { logs, clearLogs } = useLogs()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const handleClear = () => {
    clearLogs()
    onClear?.()
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex-row items-center justify-between pb-4">
        <CardTitle>Console Logs</CardTitle>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClear}
            disabled={logs.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </motion.div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col">
        {/* Terminal Header */}
        <div className="mb-4 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs text-muted-foreground ml-2 font-mono">ApplyGenie Terminal</span>
          </div>
        </div>

        {/* Terminal Content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-black/20 rounded-lg p-4 font-mono text-xs"
        >
          {logs.length === 0 ? (
            <div className="text-muted-foreground/50 text-center py-8">
              <p>Waiting for logs...</p>
              <p className="text-xs mt-2">Activity will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log: LogEntry, index: number) => (
                <motion.div
                  key={index}
                  className="flex gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-muted-foreground/50 flex-shrink-0">
                    {formatTime(log.timestamp)}
                  </span>
                  <span className={`flex-shrink-0 font-semibold ${getLevelColor(log.level)}`}>
                    [{log.level}]
                  </span>
                  <span className="text-foreground/80 break-words flex-1">
                    {log.message}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Log Stats */}
        {logs.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/30 flex gap-4 text-xs text-muted-foreground">
            <span>Total: {logs.length}</span>
            <span>
              Info:{' '}
              {logs.filter((l: LogEntry) => l.level === 'INFO').length}
            </span>
            <span>
              Errors:{' '}
              {logs.filter((l: LogEntry) => l.level === 'ERROR').length}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
