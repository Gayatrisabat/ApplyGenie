import React from 'react'
import { motion } from 'framer-motion'
import { Zap, BarChart3, FileText, Terminal, LogOut } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  isOpen?: boolean
  onClose?: () => void
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'search', label: 'Job Search', icon: Zap },
  { id: 'applications', label: 'Applications', icon: FileText },
  { id: 'logs', label: 'Console Logs', icon: Terminal },
]

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 border-r border-border bg-secondary/40 backdrop-blur-md flex flex-col transition-transform duration-300 lg:translate-x-0 z-40',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="px-6 py-8">
          <motion.div
            className="flex items-center gap-2 text-2xl font-bold"
            whileHover={{ scale: 1.05 }}
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">⚡</span>
            </div>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ApplyGenie
            </span>
          </motion.div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id)
                  onClose?.()
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium',
                  isActive
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </motion.button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="text-xs text-muted-foreground text-center mb-4">v1.2.0</div>
          <motion.button
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </motion.button>
        </div>
      </motion.aside>
    </>
  )
}
